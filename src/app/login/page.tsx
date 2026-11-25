"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[rgba(61,214,198,0.12)] blur-3xl" />
        <div className="absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-[rgba(91,141,239,0.14)] blur-3xl" />
      </div>

      <div className="card relative w-full max-w-md p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[rgba(61,214,198,0.15)] text-xl text-[var(--brand)] ring-1 ring-[rgba(61,214,198,0.35)]">
            ↪
          </div>
          <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-semibold">
            pe<span className="text-[var(--brand)]">direct</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Sign in to manage redirects, campaigns, and offers
          </p>
        </div>

        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue="demo@pedirect.com"
              className="field"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              defaultValue="demo@1226"
              className="field"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          Demo: demo@pedirect.com / demo@1226
        </p>
      </div>
    </main>
  );
}
