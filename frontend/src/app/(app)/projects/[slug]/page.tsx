"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Trash2 } from "lucide-react";
import { PageHeader, SectionLabel } from "@/components/ui";
import { useProjects } from "@/lib/useProjects";
import { useAppDialog } from "@/components/AppDialog";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { projects, removeProject } = useProjects();
  const router = useRouter();
  const { dialog, confirm } = useAppDialog();
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Link href="/projects" className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground">
          <ArrowLeft size={14} /> Back to projects
        </Link>
        <p className="mt-6 text-sm text-foreground/50">
          This project doesn&apos;t exist (or was deleted).
        </p>
      </div>
    );
  }

  async function handleDelete() {
    if (await confirm(`Delete "${project!.name}"? This can't be undone.`, true)) {
      removeProject(project!.slug);
      router.push("/projects");
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      {dialog}
      <Link href="/projects" className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground">
        <ArrowLeft size={14} /> Back to projects
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title={project.name}
          subtitle={`${project.chats} chats · updated ${project.updated}`}
        />
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/chat"
            className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-black"
          >
            Open in Chat
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded border border-red-500/50 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      <SectionLabel>CHATS</SectionLabel>
      <div className="mt-4 flex flex-col gap-2">
        {project.chats === 0 && (
          <p className="text-sm text-foreground/50">
            No chats yet — open the chat and start a conversation.
          </p>
        )}
        {Array.from({ length: project.chats }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded border border-border p-3 text-sm text-foreground/70"
          >
            <MessageSquare size={14} className="text-foreground/60" />
            Untitled chat #{i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
