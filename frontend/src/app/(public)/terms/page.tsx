import { PageHeader, SectionLabel } from "@/components/ui";

const SECTIONS = [
  {
    title: "ACCEPTANCE OF TERMS",
    body: "By using Nexa you agree to these terms. If you don't agree, don't use the service.",
  },
  {
    title: "USE OF SERVICE",
    body: "Nexa is provided as a demo product. Don't use it to break the law, harass anyone, or attempt to disrupt the service.",
  },
  {
    title: "ACCOUNTS",
    body: "You're responsible for keeping your login credentials safe and for any activity under your account.",
  },
  {
    title: "CONTENT",
    body: "You keep ownership of anything you send through Nexa. We don't claim rights to your chats, code, or projects.",
  },
  {
    title: "TERMINATION",
    body: "We can suspend or terminate access for violating these terms. You can stop using the service at any time.",
  },
  {
    title: "DISCLAIMER",
    body: 'Nexa is provided "as is" with no warranty of any kind, including accuracy of model responses.',
  },
  {
    title: "CHANGES",
    body: "We may update these terms occasionally. Continued use after a change means you accept the new terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <PageHeader
        title="Terms of Service"
        subtitle="Last updated July 2026. Demo product — terms are for illustration."
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
