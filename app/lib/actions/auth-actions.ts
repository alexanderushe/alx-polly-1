"use server";

import { createClient } from "@/lib/supabase/server";
import { LoginFormData, RegisterFormData } from "../types";

/**
 * Handles user login by authenticating with Supabase.
 * @param data - The login form data, containing email and password.
 * @returns An object with an error message if login fails, or null on success.
 * @remarks This function is a server action and should only be called from the server.
 */
export async function login(data: LoginFormData) {
  const supabase = await createClient();

  // Attempt to sign in with the provided credentials.
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  // Return a generic error message to prevent user enumeration.
  if (error) {
    return { error: "Invalid credentials" };
  }

  // Success: no error
  return { error: null };
}

/**
 * Handles new user registration with Supabase.
 * @param data - The registration form data, containing name, email, and password.
 * @returns An object with an error message if registration fails, or null on success.
 * @remarks This function is a server action and should only be called from the server.
 */
export async function register(data: RegisterFormData) {
  const supabase = await createClient();

  // Attempt to sign up a new user.
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      // Add user's name to the user_metadata.
      data: {
        name: data.name,
      },
    },
  });

  // Return a generic error message to prevent leaking information.
  if (error) {
    return { error: "Could not create user" };
  }

  // Success: no error
  return { error: null };
}

/**
 * Logs out the currently authenticated user.
 * @returns An object with an error message if logout fails, or null on success.
 * @remarks This function is a server action and should only be called from the server.
 */
export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

/**
 * Retrieves the currently authenticated user's data.
 * @returns The user object if a user is authenticated, otherwise null.
 * @remarks This function is a server action and should only be called from the server.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Retrieves the current session data.
 * @returns The session object if a session exists, otherwise null.
 * @remarks This function is a server action and should only be called from the server.
 */
export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}
