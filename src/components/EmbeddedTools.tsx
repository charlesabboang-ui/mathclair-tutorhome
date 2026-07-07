import { useMemo, lazy, Suspense } from "react";

// Lazy tldraw (only loaded when needed)
const Tldraw = lazy(() => import("tldraw").then((m) => ({ default: m.Tldraw })));
import "tldraw/tldraw.css";

/**
 * GeoGebra graph embed via public GeoGebra Graphing Calculator iframe.
 * Accepts a formula string like "y = x^2 - 2x + 1" or "f(x) = sin(x)".
 * Multi-formula: separate with "|".
 */
export function GeoGebraEmbed({ formula, height = 320 }: { formula: string; height?: number }) {
  const src = useMemo(() => {
    const commands = formula.split("|").map((f) => f.trim()).filter(Boolean);
    const params = {
      appName: "graphing",
      width: "800",
      height: String(height),
      showToolBar: "false",
      showAlgebraInput: "true",
      showMenuBar: "false",
      showResetIcon: "true",
      enableLabelDrags: "false",
      enableShiftDragZoom: "true",
      showZoomButtons: "true",
      language: "en",
      material_id: "",
      capturingThreshold: "3",
      customToolBar: "0 39 59",
    };
    const url = new URL("https://www.geogebra.org/calculator");
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    if (commands.length) url.searchParams.set("command", commands.join(";"));
    return url.toString();
  }, [formula, height]);

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-border bg-background">
      <div className="px-3 py-1.5 text-[0.65rem] text-muted-foreground bg-muted flex items-center gap-2">
        <span>📈 GeoGebra</span>
        <code className="truncate">{formula}</code>
      </div>
      <iframe
        src={src}
        title={`GeoGebra: ${formula}`}
        style={{ width: "100%", height, border: 0, display: "block" }}
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
}

/** Small tldraw canvas — used inside Whiteboard or inline sketches. */
export function TldrawCanvas({ height = 360, persistenceKey }: { height?: number; persistenceKey?: string }) {
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-border" style={{ height }}>
      <Suspense fallback={<div className="flex items-center justify-center h-full text-xs text-muted-foreground">Loading whiteboard…</div>}>
        <Tldraw persistenceKey={persistenceKey || "mathclair-whiteboard"} />
      </Suspense>
    </div>
  );
}
