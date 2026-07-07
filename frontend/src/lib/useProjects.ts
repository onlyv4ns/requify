import { useLocalStorage } from "@/lib/useLocalStorage";

export type Project = {
  slug: string;
  name: string;
  chats: number;
  updated: string;
};

const DEFAULT_PROJECTS: Project[] = [
  { slug: "landing-page-copy", name: "Landing Page Copy", chats: 12, updated: "2h ago" },
  { slug: "dijkstra-visualizer", name: "Dijkstra Visualizer", chats: 5, updated: "1d ago" },
  { slug: "data-pipeline-refactor", name: "Data Pipeline Refactor", chats: 8, updated: "3d ago" },
  { slug: "silicon-valley-essay", name: "Silicon Valley Essay", chats: 2, updated: "1w ago" },
];

function slugify(name: string, existing: Project[]) {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "project";
  let slug = base;
  let n = 2;
  while (existing.some((p) => p.slug === slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export function useProjects() {
  const [projects, setProjects] = useLocalStorage<Project[]>(
    "nexa-projects",
    DEFAULT_PROJECTS
  );

  function addProject(name: string) {
    setProjects((p) => [
      { slug: slugify(name, p), name, chats: 0, updated: "just now" },
      ...p,
    ]);
  }

  function removeProject(slug: string) {
    setProjects((p) => p.filter((proj) => proj.slug !== slug));
  }

  return { projects, addProject, removeProject };
}
