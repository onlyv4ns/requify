"use client";

import { useState } from "react";
import { Play, Plus, Loader2 } from "lucide-react";
import { PageHeader, SectionLabel } from "@/components/ui";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useModel } from "@/lib/useModel";
import ModelSelect from "@/components/ModelSelect";
import { useAppDialog } from "@/components/AppDialog";

type Tok = { t: string; c: string };
type FileContent = Tok[][];

const DEFAULT_FILES: Record<string, FileContent> = {
  "main.py": [
    [{ t: "def ", c: "text-accent" }, { t: "dijkstra(graph, start):", c: "text-foreground" }],
    [
      { t: "    distances = {node: ", c: "text-foreground" },
      { t: "float", c: "text-accent" },
      { t: '("inf") ', c: "text-foreground/60" },
      { t: "for node in graph}", c: "text-foreground" },
    ],
    [{ t: "    distances[start] = 0", c: "text-foreground" }],
    [{ t: "    visited = set()", c: "text-foreground" }],
    [{ t: "", c: "" }],
    [{ t: "    # relax edges until every node is visited", c: "text-foreground/60" }],
    [
      { t: "    while ", c: "text-accent" },
      { t: "len", c: "text-accent" },
      { t: "(visited) < ", c: "text-foreground" },
      { t: "len", c: "text-accent" },
      { t: "(graph):", c: "text-foreground" },
    ],
    [
      { t: "        node = min(", c: "text-foreground" },
      { t: "(n for n in graph if n not in visited),", c: "text-foreground/70" },
    ],
    [{ t: "                   key=distances.get)", c: "text-foreground/70" }],
    [{ t: "        visited.add(node)", c: "text-foreground" }],
    [{ t: "", c: "" }],
    [{ t: "    return", c: "text-accent" }, { t: " distances", c: "text-foreground" }],
  ],
  "utils.py": [
    [{ t: "def ", c: "text-accent" }, { t: "format_distance(n):", c: "text-foreground" }],
    [{ t: "    return f", c: "text-foreground" }, { t: '"{n} units away"', c: "text-foreground/60" }],
  ],
};

function blankFile(name: string): FileContent {
  return [
    [{ t: `# ${name}`, c: "text-foreground/60" }],
    [{ t: "# describe what you want below to generate code", c: "text-foreground/60" }],
  ];
}

export default function CodePage() {
  const [files, setFiles] = useLocalStorage<Record<string, FileContent>>(
    "nexa-code-files",
    DEFAULT_FILES
  );
  const [file, setFile] = useState("main.py");
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<{ cmd: string; line: string } | null>({
    cmd: "python main.py",
    line: "{'A': 0, 'B': 2, 'C': 5, 'D': 7}",
  });
  const [model, setModel] = useModel();
  const { dialog, prompt: promptDialog } = useAppDialog();

  function run() {
    setRunning(true);
    setTimeout(() => {
      setOutput({
        cmd: `python ${file}`,
        line: "{'A': 0, 'B': 2, 'C': 5, 'D': 7}",
      });
      setRunning(false);
    }, 600);
  }

  async function addFile() {
    const name = await promptDialog("File name", "script.py");
    if (!name) return;
    setFiles((f) => ({ ...f, [name]: f[name] ?? blankFile(name) }));
    setFile(name);
  }

  function generate() {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setFiles((f) => ({
      ...f,
      [file]: [
        ...f[file],
        [{ t: "", c: "" }],
        [{ t: `# TODO: ${trimmed}`, c: "text-foreground/60" }],
        [{ t: "# (demo) connect an API key to generate real code", c: "text-foreground/60" }],
      ],
    }));
    setPrompt("");
  }

  const names = Object.keys(files);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      {dialog}
      <PageHeader
        title="Code"
        subtitle="Generate, explain, and run code snippets."
      />

      <SectionLabel>WORKSPACE</SectionLabel>

      <div className="mt-4 rounded border border-border">
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-2 pt-2">
          {names.map((f) => (
            <button
              key={f}
              onClick={() => setFile(f)}
              className={`rounded-t px-3 py-1.5 text-xs ${
                f === file
                  ? "border-b-2 border-accent text-accent"
                  : "text-foreground/50 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={addFile}
            className="rounded-t px-2 py-1.5 text-xs text-foreground/50 hover:text-foreground"
            title="New file"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="overflow-x-auto p-4 text-xs leading-relaxed">
          {files[file].map((line, i) => (
            <div key={i} className="flex gap-4 whitespace-pre">
              <span className="w-4 shrink-0 select-none text-right text-foreground/60">
                {i + 1}
              </span>
              <span>
                {line.map((tok, j) => (
                  <span key={j} className={tok.c}>
                    {tok.t}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <span className="text-xs text-foreground/60">Python 3.12</span>
          <button
            onClick={run}
            disabled={running}
            className="flex items-center gap-1.5 rounded bg-accent px-3 py-1.5 text-xs font-medium text-black disabled:opacity-60"
          >
            {running ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Play size={13} />
            )}
            {running ? "Running" : "Run"}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded border border-border p-3 text-xs">
        {output && (
          <>
            <div className="text-foreground/60">$ {output.cmd}</div>
            <div className="mt-1 text-foreground">{output.line}</div>
            <div className="mt-2 flex items-center gap-2 text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> exited
              with code 0
            </div>
          </>
        )}
      </div>

      <div className="mt-6 rounded border border-accent/60 p-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-accent">&gt;_</span>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") generate();
            }}
            placeholder="Describe the code you want..."
            className="flex-1 bg-transparent py-2 outline-none placeholder:text-foreground/60"
          />
          <span className="h-4 w-2 animate-pulse bg-accent" />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 text-xs text-foreground/60">
          <span className="truncate">Generates directly into {file}</span>
          <ModelSelect value={model} onChange={setModel} />
        </div>
      </div>
    </div>
  );
}
