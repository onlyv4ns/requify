"use client";

import { useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { PageHeader, SectionLabel } from "@/components/ui";
import { Field } from "@/components/AuthForm";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Fill in every field.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <PageHeader
        title="Contact"
        subtitle="Have a question or found a bug? Send us a message."
      />

      {sent ? (
        <div className="rounded border border-border p-4 text-sm text-foreground/70">
          Thanks, {name.split(" ")[0]} — this is a demo, so nothing was
          actually sent, but in a real deployment we'd get back to you at{" "}
          {email}.
        </div>
      ) : (
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
          />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-foreground/70">Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="How can we help?"
              className="rounded border border-border bg-transparent px-3 py-2 outline-none placeholder:text-foreground/60 focus:border-accent/60"
            />
          </label>
          {error && <span className="text-xs text-red-400">{error}</span>}
          <button
            type="submit"
            className="rounded bg-accent py-2 text-sm font-medium text-black"
          >
            Send message
          </button>
        </form>
      )}

      <div className="mt-8">
        <SectionLabel>OTHER WAYS TO REACH US</SectionLabel>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded border border-border p-3 text-sm">
          <Mail size={16} className="text-accent" />
          support@nexa.app
        </div>
        <div className="flex items-center gap-3 rounded border border-border p-3 text-sm">
          <MessageCircle size={16} className="text-accent" />
          Community — browse ideas on the{" "}
          <a href="/explore" className="underline text-accent">
            Explore
          </a>{" "}
          page
        </div>
      </div>
    </div>
  );
}
