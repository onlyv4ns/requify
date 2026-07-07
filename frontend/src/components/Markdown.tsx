"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MermaidDiagram from "@/components/MermaidDiagram";

function Markdown({ children }: { children: string }) {
  return (
    <div className="prd-markdown text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1 className="mb-4 mt-6 text-lg font-bold text-accent first:mt-0" {...props} />
          ),
          h2: (props) => (
            <h2
              className="mb-3 mt-8 border-b border-border pb-2 text-base font-bold text-accent"
              {...props}
            />
          ),
          h3: (props) => <h3 className="mb-2 mt-5 text-sm font-bold" {...props} />,
          p: (props) => <p className="mb-3 text-foreground/90" {...props} />,
          ul: (props) => <ul className="mb-3 ml-5 list-disc space-y-1" {...props} />,
          ol: (props) => <ol className="mb-3 ml-5 list-decimal space-y-1" {...props} />,
          li: (props) => <li className="text-foreground/90" {...props} />,
          strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
          a: (props) => <a className="text-accent underline" {...props} />,
          blockquote: (props) => (
            <blockquote
              className="mb-3 border-l-2 border-accent/50 pl-3 text-foreground/70"
              {...props}
            />
          ),
          table: (props) => (
            <div className="mb-4 overflow-x-auto">
              <table className="w-full border-collapse text-xs" {...props} />
            </div>
          ),
          thead: (props) => <thead className="bg-accent-dim/30 text-accent" {...props} />,
          th: (props) => (
            <th className="border border-border px-2 py-1.5 text-left font-medium" {...props} />
          ),
          td: (props) => <td className="border border-border px-2 py-1.5 align-top" {...props} />,
          // Fenced code blocks are always wrapped in <pre> regardless of whether a
          // language is given — that wrapper, not the `language-xxx` class, is the
          // reliable signal for "this is a block, not inline code".
          pre: ({ children }) => {
            const codeEl = children as React.ReactElement<{
              className?: string;
              children?: React.ReactNode;
            }>;
            const language = /language-(\w+)/.exec(codeEl.props.className || "")?.[1];
            const code = String(codeEl.props.children).replace(/\n$/, "");

            if (language === "mermaid") {
              return (
                <div className="mb-4">
                  <MermaidDiagram chart={code} />
                </div>
              );
            }

            return (
              <pre className="mb-4 overflow-x-auto rounded border border-border bg-black/30 p-3 text-xs">
                <code>{code}</code>
              </pre>
            );
          },
          code: ({ children, ...props }) => (
            <code className="rounded bg-accent-dim/40 px-1 py-0.5 text-xs text-accent" {...props}>
              {children}
            </code>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export default memo(Markdown);
