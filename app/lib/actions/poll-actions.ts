"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Creates a new poll.
 * @param formData - The form data from the poll creation form.
 * @returns An object with an error message if creation fails, or null on success.
 */
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  // Basic validation for the poll data.
  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Get the current user from the session.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to create a poll." };
  }

  // Insert the new poll into the database.
  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question,
      options,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  // Revalidate the polls page to show the new poll.
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Retrieves all polls for the currently authenticated user.
 * @returns An object containing the user's polls or an error message.
 */
export async function getUserPolls() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { polls: [], error: "Not authenticated" };

  // Fetch all polls where the user_id matches the current user's ID.
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: error.message };
  return { polls: data ?? [], error: null };
}

/**
 * Retrieves a single poll by its ID.
 * @param id - The ID of the poll to retrieve.
 * @returns An object containing the poll data or an error message.
 */
export async function getPollById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { poll: null, error: error.message };
  return { poll: data, error: null };
}

/**
 * Submits a vote for a poll.
 * @param pollId - The ID of the poll being voted on.
 * @param optionIndex - The index of the option being voted for.
 * @returns An object with an error message if the vote fails, or null on success.
 */
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Insert a new vote record.
  // The user_id is optional to allow anonymous voting.
  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null,
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Deletes a poll.
 * @param id - The ID of the poll to delete.
 * @returns An object with an error message if deletion fails, or null on success.
 */
export async function deletePoll(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Delete the poll only if the user is the owner.
  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  // Revalidate the polls page to reflect the deletion.
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Updates an existing poll.
 * @param pollId - The ID of the poll to update.
 * @param formData - The form data from the poll edit form.
 * @returns An object with an error message if the update fails, or null on success.
 */
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to update a poll." };
  }

  // Update the poll only if the user is the owner.
  const { error } = await supabase
    .from("polls")
    .update({ question, options })
    .eq("id", pollId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
