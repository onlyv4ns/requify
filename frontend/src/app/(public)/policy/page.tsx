import { PageHeader, SectionLabel } from "@/components/ui";

const SECTIONS = [
  {
    title: "INFORMATION WE COLLECT",
    body: "Account details you provide (name, email) and the chats, code, and projects you create. In this demo, everything is stored only in your own browser's local storage — nothing is sent to a server.",
  },
  {
    title: "HOW WE USE IT",
    body: "To run the product: sign you in, show your chat history, and remember your preferences.",
  },
  {
    title: "SHARING",
    body: "We don't sell your data. It's never shared with third parties except a model provider, if you connect one.",
  },
  {
    title: "COOKIES",
    body: "We use local storage to keep you signed in and remember settings — no tracking cookies.",
  },
  {
    title: "DATA RETENTION",
    body: 'Data lives in your browser until you clear it (Settings → Clear all chats) or clear your browser storage.',
  },
  {
    title: "YOUR RIGHTS",
    body: "You can export or delete your data at any time from Settings.",
  },
];

export default function PolicyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <PageHeader
        title="Privacy Policy"
        subtitle="Last updated July 2026. Demo product — policy is for illustration."
      />
      <div className="flex flex-col gap-6">
        {SECTIONS.map(({ title, body }) => (
          <div key={title}>
            <SectionLabel>{title}</SectionLabel>
            <p className="mt-3 text-sm text-foreground/70">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
