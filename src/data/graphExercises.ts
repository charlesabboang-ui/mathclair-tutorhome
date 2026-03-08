import type { GraphConfig } from "@/components/FunctionGraph";

export interface GraphExercise {
  id: string;
  level: "bepc" | "probatoire" | "bac";
  section: "francophone" | "anglophone";
  topic: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: number;
  graph: GraphConfig;
}

type GGen = (sec: "francophone" | "anglophone", start: number, count: number) => GraphExercise[];

// ═══════════════════════════════════════════════
// BEPC — Graph exercises
// ═══════════════════════════════════════════════

const genGraphLinear: GGen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = -3 + (i % 7); const b = -2 + (i % 5);
    const slope = a === 0 ? 1 : a;
    return {
      id: `bepc-${sec[0]}-gl-${start + i}`, level: "bepc" as const, section: sec,
      topic: f ? "Fonctions linéaires" : "Linear Functions",
      question: f
        ? `Observez le graphique de f(x) = ${slope}x + ${b}. Quel est le coefficient directeur ?`
        : `Look at the graph of f(x) = ${slope}x + ${b}. What is the slope?`,
      options: [`${slope}`, `${b}`, `${slope + 1}`, `${-slope}`], answer: 0,
      explanation: f
        ? `Le coefficient directeur est le facteur de x : ${slope}`
        : `The slope is the coefficient of x: ${slope}`,
      difficulty: 1,
      graph: {
        fn: `${slope}*x+${b}`, xMin: -5, xMax: 5,
        points: [{ x: 0, y: b, label: `(0,${b})` }, { x: 1, y: slope + b, label: `(1,${slope + b})` }],
        label: `f(x) = ${slope}x + ${b}`,
      },
    };
  });
};

const genGraphIntercept: GGen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 1 + (i % 5); const b = -4 + (i % 9);
    const xIntercept = -b / a;
    const xStr = Number.isInteger(xIntercept) ? `${xIntercept}` : `${-b}/${a}`;
    return {
      id: `bepc-${sec[0]}-gi-${start + i}`, level: "bepc" as const, section: sec,
      topic: f ? "Fonctions linéaires" : "Linear Functions",
      question: f
        ? `Où la droite f(x) = ${a}x + ${b} coupe-t-elle l'axe des x ?`
        : `Where does f(x) = ${a}x + ${b} cross the x-axis?`,
      options: [`x = ${xStr}`, `x = ${b}`, `x = ${a}`, `x = 0`], answer: 0,
      explanation: `${a}x + ${b} = 0 → x = ${xStr}`,
      difficulty: 1,
      graph: {
        fn: `${a}*x+${b}`, xMin: -6, xMax: 6,
        points: [{ x: xIntercept, y: 0, label: `(${xStr}, 0)` }],
        label: `f(x) = ${a}x + ${b}`,
      },
    };
  });
};

const genGraphParabola: GGen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = (i % 2 === 0 ? 1 : -1) * (1 + (i % 3) * 0.5);
    const h = -2 + (i % 5); const k = -3 + (i % 7);
    const direction = a > 0 ? (f ? "vers le haut" : "upward") : (f ? "vers le bas" : "downward");
    return {
      id: `bepc-${sec[0]}-gp-${start + i}`, level: "bepc" as const, section: sec,
      topic: f ? "Fonctions quadratiques" : "Quadratic Functions",
      question: f
        ? `La parabole ci-dessous s'ouvre-t-elle vers le haut ou vers le bas ? Sommet = ?`
        : `Does the parabola open upward or downward? Vertex = ?`,
      options: [`${direction}, (${h}, ${k})`, `${a > 0 ? (f ? "vers le bas" : "downward") : (f ? "vers le haut" : "upward")}, (${h}, ${k})`,
        `${direction}, (${k}, ${h})`, `${direction}, (0, 0)`],
      answer: 0,
      explanation: f
        ? `a = ${a} ${a > 0 ? "> 0 → vers le haut" : "< 0 → vers le bas"}. Sommet = (${h}, ${k})`
        : `a = ${a} ${a > 0 ? "> 0 → upward" : "< 0 → downward"}. Vertex = (${h}, ${k})`,
      difficulty: 1,
      graph: {
        fn: `${a}*(x-${h})*(x-${h})+${k}`, xMin: h - 5, xMax: h + 5,
        points: [{ x: h, y: k, label: `(${h},${k})` }],
        label: `f(x)`,
      },
    };
  });
};

// ═══════════════════════════════════════════════
// PROBATOIRE — Graph exercises
// ═══════════════════════════════════════════════

const genGraphQuadRoots: GGen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const r1 = -2 + (i % 5); const r2 = r1 + 1 + (i % 4);
    // f(x) = (x - r1)(x - r2) = x² - (r1+r2)x + r1*r2
    const b = -(r1 + r2); const c = r1 * r2;
    return {
      id: `prob-${sec[0]}-gqr-${start + i}`, level: "probatoire" as const, section: sec,
      topic: f ? "Fonctions quadratiques" : "Quadratic Functions",
      question: f
        ? `D'après le graphique, quelles sont les racines de f(x) = x² ${b >= 0 ? "+" : ""}${b}x + ${c} ?`
        : `From the graph, what are the roots of f(x) = x² ${b >= 0 ? "+" : ""}${b}x + ${c}?`,
      options: [`x = ${r1}, x = ${r2}`, `x = ${-r1}, x = ${-r2}`, `x = ${r1 + 1}, x = ${r2 + 1}`, `x = 0, x = ${r1 + r2}`],
      answer: 0,
      explanation: f ? `La courbe coupe l'axe x en x=${r1} et x=${r2}` : `The curve crosses x-axis at x=${r1} and x=${r2}`,
      difficulty: 2,
      graph: {
        fn: `(x-${r1})*(x-${r2})`, xMin: Math.min(r1, r2) - 3, xMax: Math.max(r1, r2) + 3,
        points: [{ x: r1, y: 0, label: `(${r1},0)` }, { x: r2, y: 0, label: `(${r2},0)` }],
        label: `f(x)`,
      },
    };
  });
};

const genGraphTrig: GGen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const amp = 1 + (i % 3); const freq = 1 + (i % 2);
    return {
      id: `prob-${sec[0]}-gtr-${start + i}`, level: "probatoire" as const, section: sec,
      topic: f ? "Trigonométrie" : "Trigonometry",
      question: f
        ? `Observez le graphique. Quelle est l'amplitude de f(x) = ${amp}sin(${freq}x) ?`
        : `Look at the graph. What is the amplitude of f(x) = ${amp}sin(${freq}x)?`,
      options: [`${amp}`, `${freq}`, `${amp * freq}`, `${2 * amp}`], answer: 0,
      explanation: f ? `L'amplitude = |a| = ${amp}` : `Amplitude = |a| = ${amp}`,
      difficulty: 2,
      graph: {
        fn: `${amp}*Math.sin(${freq}*x)`, xMin: -2 * Math.PI, xMax: 2 * Math.PI,
        yMin: -amp - 1, yMax: amp + 1,
        asymptotes: [{ y: amp }, { y: -amp }],
        label: `f(x) = ${amp}sin(${freq}x)`,
      },
    };
  });
};

const genGraphAbsValue: GGen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 1 + (i % 4); const h = -2 + (i % 5); const k = -1 + (i % 4);
    return {
      id: `prob-${sec[0]}-gav-${start + i}`, level: "probatoire" as const, section: sec,
      topic: f ? "Valeur absolue" : "Absolute Value",
      question: f
        ? `Le sommet de f(x) = ${a}|x − ${h}| + ${k} est en quel point ?`
        : `The vertex of f(x) = ${a}|x − ${h}| + ${k} is at which point?`,
      options: [`(${h}, ${k})`, `(${-h}, ${k})`, `(${h}, ${-k})`, `(0, ${a * Math.abs(h) + k})`], answer: 0,
      explanation: f ? `Sommet de a|x−h|+k est (h,k) = (${h},${k})` : `Vertex of a|x−h|+k is (h,k) = (${h},${k})`,
      difficulty: 2,
      graph: {
        fn: `${a}*Math.abs(x-${h})+${k}`, xMin: h - 5, xMax: h + 5,
        points: [{ x: h, y: k, label: `(${h},${k})` }],
        label: `f(x)`,
      },
    };
  });
};

// ═══════════════════════════════════════════════
// BACCALAURÉAT — Graph exercises
// ═══════════════════════════════════════════════

const genGraphDerivative: GGen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 1 + (i % 3); const b = -3 + (i % 7);
    // f(x) = a*x³/3 + b*x → f'(x) = a*x² + b
    const critX = Math.round(Math.sqrt(Math.abs(b / a)) * 100) / 100;
    return {
      id: `bac-${sec[0]}-gde-${start + i}`, level: "bac" as const, section: sec,
      topic: f ? "Analyse graphique" : "Graphical Analysis",
      question: f
        ? `Voici f(x) et f'(x). Où f'(x) = 0 (point critique) ?`
        : `Here are f(x) and f'(x). Where is f'(x) = 0 (critical point)?`,
      options: [
        b < 0 ? `x ≈ ±${critX}` : `${f ? "Aucun" : "None"} (f' > 0)`,
        `x = 0`,
        `x = ${a}`,
        `x = ${b}`
      ], answer: 0,
      explanation: f
        ? `f'(x) = ${a}x² + ${b}. f'(x) = 0 quand ${a}x² = ${-b}`
        : `f'(x) = ${a}x² + ${b}. f'(x) = 0 when ${a}x² = ${-b}`,
      difficulty: 3,
      graph: {
        fn: `${a}*x*x*x/3+${b}*x`, fn2: `${a}*x*x+${b}`,
        xMin: -4, xMax: 4, label: "f(x)", label2: "f'(x)",
      },
    };
  });
};

const genGraphIntegral: GGen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 1 + (i % 4); const from = 0; const to = 1 + (i % 4);
    const area = a * to * to / 2;
    return {
      id: `bac-${sec[0]}-gin-${start + i}`, level: "bac" as const, section: sec,
      topic: f ? "Intégrales" : "Integrals",
      question: f
        ? `L'aire colorée sous f(x) = ${a}x de 0 à ${to} vaut ?`
        : `The shaded area under f(x) = ${a}x from 0 to ${to} = ?`,
      options: [`${area}`, `${a * to}`, `${area + a}`, `${to * to}`], answer: 0,
      explanation: `∫₀${to} ${a}x dx = ${a}x²/2 |₀${to} = ${a}·${to}²/2 = ${area}`,
      difficulty: 3,
      graph: {
        fn: `${a}*x`, xMin: -1, xMax: to + 2,
        shade: { from, to },
        label: `f(x) = ${a}x`,
      },
    };
  });
};

const genGraphExpLog: GGen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const type = i % 2;
    if (type === 0) {
      const a = 1 + (i % 3);
      return {
        id: `bac-${sec[0]}-gel-${start + i}`, level: "bac" as const, section: sec,
        topic: f ? "Exponentielle" : "Exponential",
        question: f
          ? `Le graphique montre f(x) = ${a}eˣ. Quelle est f(0) ?`
          : `The graph shows f(x) = ${a}eˣ. What is f(0)?`,
        options: [`${a}`, `0`, `1`, `e`], answer: 0,
        explanation: `f(0) = ${a}·e⁰ = ${a}·1 = ${a}`,
        difficulty: 3,
        graph: {
          fn: `${a}*Math.exp(x)`, xMin: -3, xMax: 3, yMin: -1, yMax: a * 8,
          points: [{ x: 0, y: a, label: `(0,${a})` }],
          asymptotes: [{ y: 0 }],
          label: `f(x) = ${a}eˣ`,
        },
      };
    }
    const a = 1 + ((i >> 1) % 3);
    return {
      id: `bac-${sec[0]}-gel-${start + i}`, level: "bac" as const, section: sec,
      topic: f ? "Logarithme" : "Logarithm",
      question: f
        ? `Le graphique montre f(x) = ${a > 1 ? a : ""}ln(x). Quelle est l'asymptote verticale ?`
        : `The graph shows f(x) = ${a > 1 ? a : ""}ln(x). What is the vertical asymptote?`,
      options: [`x = 0`, `y = 0`, `x = 1`, `x = -1`], answer: 0,
      explanation: f ? `ln(x) n'est pas défini pour x ≤ 0. Asymptote verticale : x = 0` : `ln(x) is undefined for x ≤ 0. Vertical asymptote: x = 0`,
      difficulty: 3,
      graph: {
        fn: `${a}*Math.log(x)`, xMin: 0.01, xMax: 8, yMin: -5, yMax: 6,
        points: [{ x: 1, y: 0, label: "(1,0)" }],
        asymptotes: [{ x: 0 }],
        label: `f(x) = ${a > 1 ? a : ""}ln(x)`,
      },
    };
  });
};

// ─── GENERATE ALL GRAPH EXERCISES ──────────────────────
let _graphCache: GraphExercise[] | null = null;
const GN = 50; // per generator per section

export function getAllGraphExercises(): GraphExercise[] {
  if (_graphCache) return _graphCache;

  const exercises: GraphExercise[] = [];
  const secs: Array<"francophone" | "anglophone"> = ["francophone", "anglophone"];

  // BEPC graph exercises: 3 generators × 2 sections × 50 = 300
  for (const sec of secs) {
    exercises.push(...genGraphLinear(sec, exercises.length, GN));
    exercises.push(...genGraphIntercept(sec, exercises.length, GN));
    exercises.push(...genGraphParabola(sec, exercises.length, GN));
  }

  // Probatoire graph exercises: 3 generators × 2 sections × 50 = 300
  for (const sec of secs) {
    exercises.push(...genGraphQuadRoots(sec, exercises.length, GN));
    exercises.push(...genGraphTrig(sec, exercises.length, GN));
    exercises.push(...genGraphAbsValue(sec, exercises.length, GN));
  }

  // Bac graph exercises: 3 generators × 2 sections × 50 = 300
  for (const sec of secs) {
    exercises.push(...genGraphDerivative(sec, exercises.length, GN));
    exercises.push(...genGraphIntegral(sec, exercises.length, GN));
    exercises.push(...genGraphExpLog(sec, exercises.length, GN));
  }

  _graphCache = exercises;
  return exercises;
}
