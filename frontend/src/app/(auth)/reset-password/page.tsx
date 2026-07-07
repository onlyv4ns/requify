"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard, Field } from "@/components/AuthForm";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your email.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        subtitle={`If an account exists for ${email}, a reset link was sent (demo only — nothing was actually sent).`}
        footer={
          <Link href="/login" className="underline text-accent">
            Back to sign in
          </Link>
        }
      >
        <Link
          href="/new-password"
          className="rounded border border-border py-2 text-center text-sm text-foreground/70 hover:bg-accent-dim/40"
        >
          Continue to reset link (demo)
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link href="/login" className="underline text-accent">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={error}
        />
        <button
          type="submit"
          className="rounded bg-accent py-2 text-sm font-medium text-black"
        >
          Send reset link
        </button>
      </form>
    </AuthCard>
  );
}
