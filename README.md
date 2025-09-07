# Polly - A Polling Application

Polly is a full-stack polling application that allows users to create, manage, and vote on polls. It is built with Next.js, Supabase, and Tailwind CSS.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Authentication & Database:** [Supabase](https://supabase.io/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [Shadcn UI](https://ui.shadcn.com/)

## Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   npm
*   A Supabase account

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/alx-polly-1.git
    cd alx-polly-1
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Supabase:**
    *   Create a new project on [Supabase](https://supabase.io/).
    *   In your Supabase project, go to the **SQL Editor** and run the following script to create the `polls` and `votes` tables:
        ```sql
        -- Create the polls table
        CREATE TABLE polls (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id),
          question TEXT NOT NULL,
          options TEXT[] NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Create the votes table
        CREATE TABLE votes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id),
          option_index INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        ```

4.  **Configure environment variables:**
    *   Create a `.env.local` file in the root of your project.
    *   Add your Supabase project URL and anon key to the `.env.local` file:
        ```
        NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
        ```

### Running the Application

To run the application locally, use the following command:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Testing

To run the tests, use the following command:

```bash
npm run test
```

## Usage

*   **Register and Login:** Create an account or log in to an existing account.
*   **Create a Poll:** Go to the "Create Poll" page, enter a question and at least two options, and submit the form.
*   **View Your Polls:** Go to the "My Polls" page to see a list of the polls you have created.
*   **Vote on a Poll:** Click on a poll to view the options and cast your vote.
*   **Share a Poll:** Share a poll with others using the shareable link.

## Security Audit and Remediation

This document outlines the findings of a security audit performed on this codebase. It details the vulnerabilities that were discovered, their potential impact, and the steps taken to remediate them.

### Vulnerabilities Discovered

#### 1. Insecure Direct Object Reference (IDOR) in `deletePoll`

*   **Vulnerability:** The `deletePoll` function in `app/lib/actions/poll-actions.ts` allowed any authenticated user to delete any poll, regardless of ownership.
*   **Impact:** This could lead to unauthorized data loss and disruption of service.
*   **Remediation:** The `deletePoll` function was updated to include a check that ensures the user deleting the poll is the owner of the poll.

#### 2. Information Leak in Authentication

*   **Vulnerability:** The `login` and `register` functions in `app/lib/actions/auth-actions.ts` returned specific error messages from Supabase, which could be used for user enumeration.
*   **Impact:** This could allow an attacker to determine which email addresses are registered in the system.
*   **Remediation:** The error messages in the `login` and `register` functions were replaced with generic messages, such as "Invalid credentials" and "Could not create user".

#### 3. Reflected Cross-Site Scripting (XSS) in `vulnerable-share.tsx`

*   **Vulnerability:** The `pollTitle` prop in `app/(dashboard)/polls/vulnerable-share.tsx` was not sanitized before being embedded in share links, which could lead to reflected XSS.
*   **Impact:** An attacker could craft a malicious link that, when clicked by a user, would execute arbitrary JavaScript in their browser.
*   **Remediation:** The `pollTitle` is now properly encoded using `encodeURIComponent` before being used in the share links.

### General Security Recommendations

*   **Regular Audits:** Conduct regular security audits to identify and remediate vulnerabilities.
*   **Dependency Scanning:** Use automated tools to scan for vulnerabilities in third-party dependencies.
*   **Secure Coding Practices:** Follow secure coding practices to prevent common vulnerabilities, such as those outlined in the OWASP Top 10.
*   **Input Validation:** Always validate and sanitize user input to prevent injection attacks.
*   **Principle of Least Privilege:** Ensure that users only have access to the resources they need to perform their duties.
