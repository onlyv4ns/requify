"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard, Field } from "@/components/AuthForm";

export default function NewPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (password.length < 8) next.password = "At least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  if (done) {
    return (
      <AuthCard
        title="Password updated"
        subtitle="Demo only — no password was actually changed. Sign in to continue."
      >
        <button
          onClick={() => router.push("/login")}
          className="rounded bg-accent py-2 text-sm font-medium text-black"
        >
          Go to sign in
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your account.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          error={errors.password}
        />
        <Field
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          error={errors.confirm}
        />
        <button
          type="submit"
          className="rounded bg-accent py-2 text-sm font-medium text-black"
        >
          Update password
        </button>
      </form>
    </AuthCard>
  );
}
