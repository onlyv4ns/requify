"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";

export default function MermaidDiagram({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("mermaid").then(async ({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "strict" });
      try {
        const { svg } = await mermaid.render(`mermaid-${id}`, chart);
        // DOMPurify (strict mode) serializes HTML-label void elements as bare
        // <br>, which is valid HTML5 but invalid XML — and the <img
        // src="data:image/svg+xml"> below is parsed as strict XML, so a bare
        // <br> fails to decode and the whole diagram renders blank.
        // ponytail: <br> is the only void element mermaid emits in labels;
        // widen the alternation if <hr>/<img>/etc. ever show up.
        if (!cancelled) setSvg(svg.replace(/<br\s*>/g, "<br/>"));
      } catch {
        if (!cancelled) setError(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <pre className="overflow-auto rounded border border-border bg-black/30 p-3 text-xs">
        {chart}
      </pre>
    );
  }

  if (!svg) {
    return (
      <div className="rounded border border-border bg-black/30 p-3 text-xs text-foreground/50">
        Rendering diagram...
      </div>
    );
  }

  // Rendering as an <img src="data:..."> (instead of inline SVG) is what lets
  // the browser offer its native "open image in new tab" on right-click.
  const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

  return (
    <>
      <div className="overflow-auto rounded border border-border bg-black/30 p-3">
        <img
          src={dataUrl}
          alt="Diagram"
          className="mx-auto cursor-zoom-in transition-opacity hover:opacity-80"
          onClick={() => dialogRef.current?.showModal()}
        />
      </div>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto max-h-[90vh] w-[95vw] max-w-5xl overflow-auto rounded border border-border bg-background p-2 backdrop:bg-black/80"
      >
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="sticky left-full top-0 flex h-8 w-8 items-center justify-center rounded border border-border bg-background text-foreground/70 hover:bg-accent-dim/40"
        >
          <X size={16} />
        </button>
        <img src={dataUrl} alt="Diagram" className="mx-auto" />
      </dialog>
    </>
  );
}
