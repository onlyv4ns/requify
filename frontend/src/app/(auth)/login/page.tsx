"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard, Field } from "@/components/AuthForm";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email.trim(), password);
      router.push("/generate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Sign in to your Requify account."
      footer={
        <>
          <div>
            No account?{" "}
            <Link href="/register" className="underline text-accent">
              Register
            </Link>
          </div>
          <div className="mt-1">
            <Link href="/reset-password" className="underline text-accent">
              Forgot password?
            </Link>
          </div>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          error={error}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-accent py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}
