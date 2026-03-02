import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface Props {
  text: string;
  className?: string;
}

function renderSegment(segment: string, isDisplay: boolean): string {
  try {
    return katex.renderToString(segment, {
      displayMode: isDisplay,
      throwOnError: false,
      strict: false,
      trust: true,
    });
  } catch {
    return segment;
  }
}

export default function MathRenderer({ text, className = "" }: Props) {
  const html = useMemo(() => {
    // Split by display math $$...$$ first, then inline $...$
    let result = text;

    // Replace display math $$...$$
    result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_match, expr) => {
      return `<div class="my-2 text-center overflow-x-auto">${renderSegment(expr.trim(), true)}</div>`;
    });

    // Replace inline math $...$
    result = result.replace(/\$([^\$\n]+?)\$/g, (_match, expr) => {
      return renderSegment(expr.trim(), false);
    });

    // Format step markers
    result = result.replace(/^(Step \d+|Étape \d+)/gim, '<strong class="text-secondary">$1</strong>');
    result = result.replace(/^→/gm, '<span class="text-accent">→</span>');

    // Convert newlines to proper HTML
    result = result.replace(/\n/g, "<br/>");

    return result;
  }, [text]);

  return (
    <div
      className={`math-content leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
