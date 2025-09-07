"use client";

import { useState } from "react";
import { createPoll } from "@/app/lib/actions/poll-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * A form for creating a new poll.
 * This component manages the state for the poll question and its options.
 */
export default function PollCreateForm() {
  // State for the poll options. Starts with two empty options.
  const [options, setOptions] = useState(["", ""]);
  // State for handling form submission errors.
  const [error, setError] = useState<string | null>(null);
  // State to indicate successful form submission.
  const [success, setSuccess] = useState(false);

  /**
   * Updates the value of an option at a specific index.
   * @param idx - The index of the option to update.
   * @param value - The new value of the option.
   */
  const handleOptionChange = (idx: number, value: string) => {
    setOptions((opts) => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  /**
   * Adds a new empty option to the poll.
   */
  const addOption = () => setOptions((opts) => [...opts, ""]);

  /**
   * Removes an option from the poll, ensuring at least two options remain.
   * @param idx - The index of the option to remove.
   */
  const removeOption = (idx: number) => {
    if (options.length > 2) {
      setOptions((opts) => opts.filter((_, i) => i !== idx));
    }
  };

  return (
    <form
      action={async (formData) => {
        // Reset error and success states on new submission.
        setError(null);
        setSuccess(false);
        // Call the server action to create the poll.
        const res = await createPoll(formData);
        if (res?.error) {
          setError(res.error);
        } else {
          setSuccess(true);
          // Redirect to the polls page on success.
          setTimeout(() => {
            window.location.href = "/polls";
          }, 1200);
        }
      }}
      className="space-y-6 max-w-md mx-auto"
    >
      <div>
        <Label htmlFor="question">Poll Question</Label>
        <Input name="question" id="question" required />
      </div>
      <div>
        <Label>Options</Label>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <Input
              name="options"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              required
            />
            {/* Only show the remove button if there are more than two options. */}
            {options.length > 2 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeOption(idx)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" onClick={addOption} variant="secondary">
          Add Option
        </Button>
      </div>
      {/* Display error or success messages. */}
      {error && <div className="text-red-500">{error}</div>}
      {success && (
        <div className="text-green-600">Poll created! Redirecting...</div>
      )}
      <Button type="submit">Create Poll</Button>
    </form>
  );
}
