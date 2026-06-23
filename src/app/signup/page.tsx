"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || undefined },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-ink">
            <path d="M4 6h16M4 12h10M4 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="12" r="2" fill="#f7a501" />
          </svg>
          <span className="text-lg font-bold text-ink">LLM Flow Studio</span>
        </div>

        <div className="rounded-md border border-hairline bg-surface-card p-6">
          <h1 className="text-base font-bold text-ink">Create an account</h1>
          <p className="mt-1 text-xs text-mute">Get started with your own workspace.</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="display-name" className="block text-xs font-medium text-ink">
                Name
              </label>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-xs text-ink placeholder:text-stone focus:border-primary-cta focus:outline-none"
                placeholder="Your name (optional)"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-xs text-ink placeholder:text-stone focus:border-primary-cta focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-hairline bg-white px-3 py-2 text-xs text-ink placeholder:text-stone focus:border-primary-cta focus:outline-none"
                placeholder="At least 6 characters"
                minLength={6}
              />
            </div>

            {error && (
              <p className="rounded-md bg-accent-red-soft px-3 py-2 text-xs text-accent-red">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary-cta py-2 text-xs font-bold text-on-primary transition-colors hover:bg-primary-pressed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-mute">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-ink hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
