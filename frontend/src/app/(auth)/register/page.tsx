"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard, Field } from "@/components/AuthForm";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim() || !email.trim()) next.form = "Fill in every field.";
    if (password.length < 8) next.password = "At least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.push("/generate");
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Registration failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Create your Requify account."
      footer={
        <div>
          Already have an account?{" "}
          <Link href="/login" className="underline text-accent">
            Sign in
          </Link>
        </div>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ada Lovelace"
        />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={errors.form}
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          error={errors.password}
        />
        <Field
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          error={errors.confirm}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-accent py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
