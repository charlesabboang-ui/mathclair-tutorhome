import MathRenderer from "./MathRenderer";
import { GeoGebraEmbed, TldrawCanvas } from "./EmbeddedTools";

/**
 * Renders tutor / exercise text with inline embeds.
 * Supported markers (on their own or inline):
 *   [[geogebra: y = x^2 - 2x + 1]]
 *   [[tldraw]]
 */
export default function TutorContent({ text, className = "" }: { text: string; className?: string }) {
  const parts: Array<{ type: "text" | "geogebra" | "tldraw"; content: string }> = [];
  const re = /\[\[(geogebra|tldraw)(?::([^\]]+))?\]\]/gi;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > lastIdx) parts.push({ type: "text", content: text.slice(lastIdx, m.index) });
    const kind = m[1].toLowerCase();
    if (kind === "geogebra") parts.push({ type: "geogebra", content: (m[2] || "y=x").trim() });
    else parts.push({ type: "tldraw", content: "" });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) parts.push({ type: "text", content: text.slice(lastIdx) });
  if (parts.length === 0) parts.push({ type: "text", content: text });

  return (
    <div className={className}>
      {parts.map((p, i) => {
        if (p.type === "geogebra") return <GeoGebraEmbed key={i} formula={p.content} />;
        if (p.type === "tldraw") return <TldrawCanvas key={i} persistenceKey={`tutor-inline-${i}`} />;
        return <MathRenderer key={i} text={p.content} />;
      })}
    </div>
  );
}
