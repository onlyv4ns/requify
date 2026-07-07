import { PageHeader, SectionLabel } from "@/components/ui";

const SECTIONS = [
  {
    title: "INFORMATION WE COLLECT",
    body: "Account details you provide (name, email) and the PRDs you generate or edit. This data is stored in our database, scoped to your account.",
  },
  {
    title: "HOW WE USE IT",
    body: "To run the product: sign you in, show your PRDs, and send their content to the configured AI provider when you generate, edit, or ask a question.",
  },
  {
    title: "SHARING",
    body: "We don't sell your data. PRD content is sent to the AI provider configured on the server (Anthropic API or the claude CLI) to generate responses, and to no one else.",
  },
  {
    title: "COOKIES",
    body: "We use a single session cookie to keep you signed in — no tracking cookies.",
  },
  {
    title: "DATA RETENTION",
    body: "Your PRDs are kept until you delete them from the PRDs page.",
  },
  {
    title: "YOUR RIGHTS",
    body: "You can delete any PRD at any time from its page.",
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
