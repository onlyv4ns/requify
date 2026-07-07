"use client";

import Link from "next/link";
import { Plus, MessageSquare, Folder } from "lucide-react";
import { PageHeader, SectionLabel } from "@/components/ui";
import { useProjects } from "@/lib/useProjects";
import { useAppDialog } from "@/components/AppDialog";

export default function ProjectsPage() {
  const { projects, addProject } = useProjects();
  const { dialog, prompt } = useAppDialog();

  async function newProject() {
    const name = await prompt("Project name");
    if (name && name.trim()) addProject(name.trim());
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      {dialog}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Projects"
          subtitle="Group related chats and files together."
        />
        <button
          onClick={newProject}
          className="flex shrink-0 items-center gap-1.5 rounded bg-accent px-3 py-1.5 text-xs font-medium text-black"
        >
          <Plus size={14} /> New Project
        </button>
      </div>

      <SectionLabel>{projects.length} PROJECTS</SectionLabel>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {projects.map(({ slug, name, chats, updated }) => (
          <Link
            key={slug}
            href={`/projects/${slug}`}
            className="group flex flex-col gap-3 rounded border border-border p-4 text-left text-sm hover:border-accent/50 hover:bg-accent-dim/20"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded bg-accent-dim text-accent">
              <Folder size={16} />
            </span>
            <div>
              <div className="font-medium">{name}</div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-foreground/50">
                <MessageSquare size={12} />
                {chats} chats &middot; {updated}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
