import { useMemo } from "react";

export interface GraphConfig {
  /** JS math expression using x, e.g. "2*x+1", "x*x-3*x+2", "Math.sin(x)" */
  fn: string;
  /** Optional second function for comparison */
  fn2?: string;
  /** x range */
  xMin?: number;
  xMax?: number;
  /** y range (auto if omitted) */
  yMin?: number;
  yMax?: number;
  /** Points to highlight [{x, y, label}] */
  points?: { x: number; y: number; label?: string }[];
  /** Show area under curve between x values */
  shade?: { from: number; to: number };
  /** Asymptote lines */
  asymptotes?: { x?: number; y?: number }[];
  /** Label for the function */
  label?: string;
  label2?: string;
}

const W = 320;
const H = 240;
const PAD = 32;

function evalFn(expr: string, x: number): number {
  try {
    // eslint-disable-next-line no-new-func
    return new Function("x", "Math", `return ${expr}`)(x, Math);
  } catch { return NaN; }
}

export default function FunctionGraph({ fn, fn2, xMin = -5, xMax = 5, yMin: yMinProp, yMax: yMaxProp, points, shade, asymptotes, label, label2 }: GraphConfig) {
  const steps = 200;

  const { path1, path2, shadePath, yMin, yMax } = useMemo(() => {
    const dx = (xMax - xMin) / steps;
    const pts1: { x: number; y: number }[] = [];
    const pts2: { x: number; y: number }[] = [];

    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const y1 = evalFn(fn, x);
      if (isFinite(y1)) pts1.push({ x, y: y1 });
      if (fn2) {
        const y2 = evalFn(fn2, x);
        if (isFinite(y2)) pts2.push({ x, y: y2 });
      }
    }

    const allY = [...pts1.map(p => p.y), ...pts2.map(p => p.y)];
    let autoMin = Math.min(...allY);
    let autoMax = Math.max(...allY);
    const margin = (autoMax - autoMin) * 0.15 || 1;
    autoMin -= margin;
    autoMax += margin;

    const yMin = yMinProp ?? autoMin;
    const yMax = yMaxProp ?? autoMax;

    const toSvg = (px: number, py: number) => {
      const sx = PAD + ((px - xMin) / (xMax - xMin)) * (W - 2 * PAD);
      const sy = PAD + ((yMax - py) / (yMax - yMin)) * (H - 2 * PAD);
      return { sx, sy };
    };

    const buildPath = (pts: { x: number; y: number }[]) => {
      if (!pts.length) return "";
      return pts.map((p, i) => {
        const { sx, sy } = toSvg(p.x, p.y);
        return `${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
      }).join(" ");
    };

    let shadePath = "";
    if (shade) {
      const shadePts = pts1.filter(p => p.x >= shade.from && p.x <= shade.to);
      if (shadePts.length > 1) {
        const first = toSvg(shadePts[0].x, 0);
        const last = toSvg(shadePts[shadePts.length - 1].x, 0);
        shadePath = `M${first.sx.toFixed(1)},${first.sy.toFixed(1)} ` +
          shadePts.map(p => { const s = toSvg(p.x, p.y); return `L${s.sx.toFixed(1)},${s.sy.toFixed(1)}`; }).join(" ") +
          ` L${last.sx.toFixed(1)},${last.sy.toFixed(1)} Z`;
      }
    }

    return { path1: buildPath(pts1), path2: buildPath(pts2), shadePath, yMin, yMax };
  }, [fn, fn2, xMin, xMax, yMinProp, yMaxProp, shade, steps]);

  const toSvg = (px: number, py: number) => {
    const sx = PAD + ((px - xMin) / (xMax - xMin)) * (W - 2 * PAD);
    const sy = PAD + ((yMax - py) / (yMax - yMin)) * (H - 2 * PAD);
    return { sx, sy };
  };

  // Grid lines
  const gridLines: JSX.Element[] = [];
  const xStep = Math.ceil((xMax - xMin) / 10) || 1;
  const yStep = Math.ceil((yMax - yMin) / 8) || 1;

  for (let x = Math.ceil(xMin); x <= xMax; x += xStep) {
    const { sx } = toSvg(x, 0);
    gridLines.push(<line key={`gx${x}`} x1={sx} y1={PAD} x2={sx} y2={H - PAD} className="stroke-border/30" strokeWidth={0.5} />);
    gridLines.push(<text key={`lx${x}`} x={sx} y={H - PAD + 14} textAnchor="middle" className="fill-muted-foreground text-[9px]">{x}</text>);
  }
  for (let y = Math.ceil(yMin); y <= yMax; y += yStep) {
    const { sy } = toSvg(0, y);
    gridLines.push(<line key={`gy${y}`} x1={PAD} y1={sy} x2={W - PAD} y2={sy} className="stroke-border/30" strokeWidth={0.5} />);
    gridLines.push(<text key={`ly${y}`} x={PAD - 4} y={sy + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">{y}</text>);
  }

  // Axes
  const origin = toSvg(0, 0);
  const axisColor = "hsl(var(--muted-foreground))";

  return (
    <div className="bg-background border border-border rounded-lg p-2 inline-block">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block">
        {/* Grid */}
        {gridLines}

        {/* Axes */}
        {origin.sy >= PAD && origin.sy <= H - PAD && (
          <line x1={PAD} y1={origin.sy} x2={W - PAD} y2={origin.sy} stroke={axisColor} strokeWidth={1.2} />
        )}
        {origin.sx >= PAD && origin.sx <= W - PAD && (
          <line x1={origin.sx} y1={PAD} x2={origin.sx} y2={H - PAD} stroke={axisColor} strokeWidth={1.2} />
        )}

        {/* Asymptotes */}
        {asymptotes?.map((a, idx) => {
          if (a.x !== undefined) {
            const { sx } = toSvg(a.x, 0);
            return <line key={`ax${idx}`} x1={sx} y1={PAD} x2={sx} y2={H - PAD} stroke="hsl(var(--destructive))" strokeWidth={1} strokeDasharray="5,4" />;
          }
          if (a.y !== undefined) {
            const { sy } = toSvg(0, a.y);
            return <line key={`ay${idx}`} x1={PAD} y1={sy} x2={W - PAD} y2={sy} stroke="hsl(var(--destructive))" strokeWidth={1} strokeDasharray="5,4" />;
          }
          return null;
        })}

        {/* Shaded area */}
        {shadePath && (
          <path d={shadePath} fill="hsl(var(--primary) / 0.2)" stroke="none" />
        )}

        {/* Function curves */}
        {path1 && <path d={path1} fill="none" stroke="hsl(var(--secondary))" strokeWidth={2.5} strokeLinecap="round" />}
        {path2 && <path d={path2} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="6,3" strokeLinecap="round" />}

        {/* Points */}
        {points?.map((p, idx) => {
          const { sx, sy } = toSvg(p.x, p.y);
          return (
            <g key={`pt${idx}`}>
              <circle cx={sx} cy={sy} r={4} fill="hsl(var(--accent))" stroke="hsl(var(--background))" strokeWidth={2} />
              {p.label && <text x={sx + 7} y={sy - 7} className="fill-accent text-[10px] font-bold">{p.label}</text>}
            </g>
          );
        })}

        {/* Labels */}
        {label && <text x={W - PAD - 4} y={PAD + 12} textAnchor="end" className="fill-secondary text-[10px] font-bold">{label}</text>}
        {label2 && <text x={W - PAD - 4} y={PAD + 24} textAnchor="end" className="fill-primary text-[10px] font-bold">{label2}</text>}

        {/* Axis labels */}
        <text x={W - PAD + 4} y={origin.sy + 4} className="fill-muted-foreground text-[10px] font-bold">x</text>
        <text x={origin.sx + 6} y={PAD - 4} className="fill-muted-foreground text-[10px] font-bold">y</text>
      </svg>
    </div>
  );
}
