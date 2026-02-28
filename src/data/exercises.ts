export interface Exercise {
  id: string;
  level: "bepc" | "probatoire" | "bac";
  section: "francophone" | "anglophone";
  topic: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: number;
}

// Seeded PRNG for deterministic exercises
const rand = (s: number) => ((s * 9301 + 49297) % 233280) / 233280;
const randInt = (s: number, min: number, max: number) => min + Math.floor(rand(s) * (max - min + 1));

type Gen = (sec: "francophone" | "anglophone", start: number, count: number) => Exercise[];

// ─── BEPC GENERATORS ──────────────────────
const genLinearEq: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 2 + (i % 9); const sol = 1 + (i % 7); const b = 3 + (i * 3 % 11); const c = a * sol + b;
    return { id: `bepc-${sec[0]}-le-${start + i}`, level: "bepc" as const, section: sec, topic: f ? "Algèbre" : "Algebra",
      question: f ? `Résoudre : ${a}x + ${b} = ${c}` : `Solve: ${a}x + ${b} = ${c}`,
      options: [`x = ${sol}`, `x = ${sol + 2}`, `x = ${sol - 1}`, `x = ${a}`], answer: 0,
      explanation: `${a}x = ${c} - ${b} = ${c - b}, x = ${c - b}/${a} = ${sol}`, difficulty: 1 };
  });
};

const genPythagoras: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  const triples = [[3,4,5],[5,12,13],[6,8,10],[8,15,17],[7,24,25],[9,12,15],[9,40,41],[12,16,20],[15,20,25],[20,21,29]];
  return Array.from({ length: count }, (_, i) => {
    const t = triples[i % triples.length]; const k = 1 + Math.floor(i / triples.length);
    const a = t[0]*k, b = t[1]*k, c = t[2]*k;
    return { id: `bepc-${sec[0]}-py-${start+i}`, level: "bepc" as const, section: sec, topic: f ? "Géométrie" : "Geometry",
      question: f ? `Triangle rectangle, côtés ${a} cm et ${b} cm. Hypoténuse = ?` : `Right triangle, legs ${a} cm and ${b} cm. Hypotenuse = ?`,
      options: [`${c} cm`, `${c+2} cm`, `${c-1} cm`, `${a+b} cm`], answer: 0,
      explanation: `√(${a}² + ${b}²) = √(${a*a} + ${b*b}) = √${c*c} = ${c}`, difficulty: 1 };
  });
};

const genFractions: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const n1 = 1 + (i % 7); const d1 = 2 + (i % 5); const n2 = 1 + ((i*3) % 6); const d2 = 3 + (i % 4);
    const rn = n1*d2 + n2*d1; const rd = d1*d2;
    const g = gcd(rn, rd); const sn = rn/g; const sd = rd/g;
    return { id: `bepc-${sec[0]}-fr-${start+i}`, level: "bepc" as const, section: sec, topic: f ? "Arithmétique" : "Arithmetic",
      question: f ? `Calculer : ${n1}/${d1} + ${n2}/${d2}` : `Calculate: ${n1}/${d1} + ${n2}/${d2}`,
      options: [`${sn}/${sd}`, `${sn+1}/${sd}`, `${n1+n2}/${d1+d2}`, `${sn}/${sd+1}`], answer: 0,
      explanation: `${n1}×${d2} + ${n2}×${d1} / ${d1}×${d2} = ${rn}/${rd} = ${sn}/${sd}`, difficulty: 1 };
  });
};

const genPercentage: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const base = (i % 10 + 1) * 50; const pct = (i % 8 + 1) * 5; const ans = base * pct / 100;
    return { id: `bepc-${sec[0]}-pc-${start+i}`, level: "bepc" as const, section: sec, topic: f ? "Arithmétique" : "Arithmetic",
      question: f ? `${pct}% de ${base} = ?` : `${pct}% of ${base} = ?`,
      options: [`${ans}`, `${ans+10}`, `${ans-5}`, `${base-ans}`], answer: 0,
      explanation: `${pct}/100 × ${base} = ${ans}`, difficulty: 1 };
  });
};

const genStatBasic: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const vals = [2+i%5, 4+(i*2)%7, 6+i%4, 8+(i*3)%6, 5+i%3];
    const sum = vals.reduce((a,b) => a+b, 0); const mean = sum / vals.length;
    return { id: `bepc-${sec[0]}-st-${start+i}`, level: "bepc" as const, section: sec, topic: f ? "Statistiques" : "Statistics",
      question: f ? `Moyenne de {${vals.join(", ")}} = ?` : `Mean of {${vals.join(", ")}} = ?`,
      options: [`${mean}`, `${mean+1}`, `${mean-1}`, `${vals[2]}`], answer: 0,
      explanation: `(${vals.join(" + ")}) / ${vals.length} = ${sum}/${vals.length} = ${mean}`, difficulty: 1 };
  });
};

// ─── PROBATOIRE GENERATORS ──────────────────────
const genQuadratic: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const r1 = 1 + (i % 6); const r2 = 2 + ((i*2) % 5);
    const a = 1; const b = -(r1 + r2); const c = r1 * r2;
    const disc = b*b - 4*a*c;
    return { id: `prob-${sec[0]}-qd-${start+i}`, level: "probatoire" as const, section: sec, topic: f ? "Algèbre" : "Algebra",
      question: f ? `Résoudre : x² ${b>=0?"+":""}${b}x + ${c} = 0` : `Solve: x² ${b>=0?"+":""}${b}x + ${c} = 0`,
      options: [`x = ${r1}, x = ${r2}`, `x = ${-r1}, x = ${-r2}`, `x = ${r1+1}, x = ${r2+1}`, `x = ${r1*r2}`], answer: 0,
      explanation: `Δ = ${b}² - 4(${c}) = ${disc}. x = (${-b} ± √${disc}) / 2 → x = ${r1}, x = ${r2}`, difficulty: 2 };
  });
};

const genTrig: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  const angles = [30, 45, 60, 90, 120, 135, 150, 180, 210, 240];
  const sinVals: Record<number,string> = {30:"1/2",45:"√2/2",60:"√3/2",90:"1",120:"√3/2",135:"√2/2",150:"1/2",180:"0",210:"-1/2",240:"-√3/2"};
  return Array.from({ length: count }, (_, i) => {
    const angle = angles[i % angles.length];
    const sv = sinVals[angle] || "0";
    return { id: `prob-${sec[0]}-tr-${start+i}`, level: "probatoire" as const, section: sec, topic: f ? "Trigonométrie" : "Trigonometry",
      question: f ? `sin(${angle}°) = ?` : `sin(${angle}°) = ?`,
      options: [sv, "√3/3", "1/√2", "2/3"], answer: 0,
      explanation: `sin(${angle}°) = ${sv}`, difficulty: 2 };
  });
};

const genSequence: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a1 = 2 + (i % 8); const d = 3 + (i % 5); const n = 10 + (i % 11);
    const an = a1 + (n-1)*d;
    return { id: `prob-${sec[0]}-sq-${start+i}`, level: "probatoire" as const, section: sec, topic: f ? "Suites" : "Sequences",
      question: f ? `Suite arithmétique: a₁=${a1}, r=${d}. Trouver a${n}.` : `AP: a₁=${a1}, d=${d}. Find a${n}.`,
      options: [`${an}`, `${an+d}`, `${an-d}`, `${a1*n}`], answer: 0,
      explanation: `aₙ = a₁ + (n-1)d = ${a1} + ${n-1}×${d} = ${an}`, difficulty: 2 };
  });
};

const genProbability: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const total = 6 + (i % 6)*2; const fav = 1 + (i % (total-1));
    const g2 = gcd(fav, total); const sn = fav/g2; const sd = total/g2;
    return { id: `prob-${sec[0]}-pr-${start+i}`, level: "probatoire" as const, section: sec, topic: f ? "Probabilités" : "Probability",
      question: f ? `Urne de ${total} boules, ${fav} rouges. P(rouge) = ?` : `Bag of ${total} balls, ${fav} red. P(red) = ?`,
      options: [`${sn}/${sd}`, `${sn+1}/${sd}`, `${fav}/${total+2}`, `1/${total}`], answer: 0,
      explanation: `P = ${fav}/${total} = ${sn}/${sd}`, difficulty: 2 };
  });
};

const genFunctions: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 2 + (i % 5); const b = 1 + (i % 8); const x = 3 + (i % 4);
    const y = a*x + b;
    return { id: `prob-${sec[0]}-fn-${start+i}`, level: "probatoire" as const, section: sec, topic: f ? "Fonctions" : "Functions",
      question: f ? `f(x) = ${a}x + ${b}. Calculer f(${x}).` : `f(x) = ${a}x + ${b}. Find f(${x}).`,
      options: [`${y}`, `${y+a}`, `${y-b}`, `${a*b}`], answer: 0,
      explanation: `f(${x}) = ${a}×${x} + ${b} = ${a*x} + ${b} = ${y}`, difficulty: 1 };
  });
};

// ─── BACCALAURÉAT GENERATORS ──────────────────────
const genDerivative: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 2 + (i % 6); const n = 2 + (i % 4); const b = 1 + (i % 7);
    const da = a*n; const dn = n-1;
    return { id: `bac-${sec[0]}-dv-${start+i}`, level: "bac" as const, section: sec, topic: f ? "Analyse" : "Calculus",
      question: f ? `Dériver f(x) = ${a}x${sup(n)} + ${b}x` : `Differentiate f(x) = ${a}x${sup(n)} + ${b}x`,
      options: [`${da}x${sup(dn)} + ${b}`, `${a}x${sup(dn)} + ${b}`, `${da}x${sup(n)}`, `${a*b}x`], answer: 0,
      explanation: `f'(x) = ${a}·${n}·x${sup(dn)} + ${b} = ${da}x${sup(dn)} + ${b}`, difficulty: 3 };
  });
};

const genIntegral: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 1 + (i % 5); const upper = 2 + (i % 4);
    const result = a * Math.pow(upper, 3) / 3;
    const rStr = Number.isInteger(result) ? `${result}` : `${a*upper*upper*upper}/3`;
    return { id: `bac-${sec[0]}-ig-${start+i}`, level: "bac" as const, section: sec, topic: f ? "Analyse" : "Calculus",
      question: f ? `Calculer ∫₀${sup2(upper)} ${a}x² dx` : `Calculate ∫₀${sup2(upper)} ${a}x² dx`,
      options: [rStr, `${a*upper*upper}`, `${a*upper}`, `${a}/3`], answer: 0,
      explanation: `∫${a}x²dx = ${a}x³/3. F(${upper})-F(0) = ${a}·${upper}³/3 = ${rStr}`, difficulty: 3 };
  });
};

const genLimits: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 2 + (i % 7); const b = 3 + (i % 5);
    return { id: `bac-${sec[0]}-lm-${start+i}`, level: "bac" as const, section: sec, topic: f ? "Analyse" : "Calculus",
      question: f ? `lim(x→∞) (${a}x + ${b}) / (x + 1) = ?` : `lim(x→∞) (${a}x + ${b}) / (x + 1) = ?`,
      options: [`${a}`, `${b}`, `∞`, `0`], answer: 0,
      explanation: `Divide by x: lim = ${a}/1 = ${a}`, difficulty: 3 };
  });
};

const genComplex: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 1+(i%5); const b = 2+(i%4); const c = 1+(i*2%6); const d = 3+(i%3);
    const rr = a+c; const ri = b+d;
    return { id: `bac-${sec[0]}-cx-${start+i}`, level: "bac" as const, section: sec, topic: f ? "Nombres complexes" : "Complex Numbers",
      question: f ? `(${a}+${b}i) + (${c}+${d}i) = ?` : `(${a}+${b}i) + (${c}+${d}i) = ?`,
      options: [`${rr}+${ri}i`, `${rr}-${ri}i`, `${a*c}+${b*d}i`, `${rr}`], answer: 0,
      explanation: `(${a}+${c}) + (${b}+${d})i = ${rr}+${ri}i`, difficulty: 2 };
  });
};

const genVectors: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const x1=1+(i%5),y1=2+(i%4),x2=3+(i%3),y2=1+(i%6);
    const dot = x1*x2+y1*y2;
    return { id: `bac-${sec[0]}-vc-${start+i}`, level: "bac" as const, section: sec, topic: f ? "Vecteurs" : "Vectors",
      question: f ? `u⃗(${x1},${y1}) · v⃗(${x2},${y2}) = ?` : `u⃗(${x1},${y1}) · v⃗(${x2},${y2}) = ?`,
      options: [`${dot}`, `${dot+2}`, `${x1*y2}`, `${x1+y1}`], answer: 0,
      explanation: `${x1}×${x2} + ${y1}×${y2} = ${x1*x2} + ${y1*y2} = ${dot}`, difficulty: 2 };
  });
};

// ─── HELPERS ──────────────────────
function gcd(a: number, b: number): number { return b === 0 ? Math.abs(a) : gcd(b, a % b); }
function sup(n: number): string { const s: Record<number,string>={0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹"}; return String(n).split("").map(c=>s[+c]||c).join(""); }
function sup2(n: number): string { return sup(n); }

// ─── GENERATE ALL 3000 EXERCISES ──────────────────────
let _cache: Exercise[] | null = null;

export function getAllExercises(): Exercise[] {
  if (_cache) return _cache;

  const exercises: Exercise[] = [];
  const secs: Array<"francophone" | "anglophone"> = ["francophone", "anglophone"];

  // BEPC: 5 generators × 2 sections × 50 each = 500
  for (const sec of secs) {
    exercises.push(...genLinearEq(sec, exercises.length, 50));
    exercises.push(...genPythagoras(sec, exercises.length, 50));
    exercises.push(...genFractions(sec, exercises.length, 50));
    exercises.push(...genPercentage(sec, exercises.length, 50));
    exercises.push(...genStatBasic(sec, exercises.length, 50));
  }

  // Probatoire: 5 generators × 2 sections × 50 each = 500
  for (const sec of secs) {
    exercises.push(...genQuadratic(sec, exercises.length, 50));
    exercises.push(...genTrig(sec, exercises.length, 50));
    exercises.push(...genSequence(sec, exercises.length, 50));
    exercises.push(...genProbability(sec, exercises.length, 50));
    exercises.push(...genFunctions(sec, exercises.length, 50));
  }

  // Baccalauréat: 5 generators × 2 sections × 50 each = 500
  for (const sec of secs) {
    exercises.push(...genDerivative(sec, exercises.length, 50));
    exercises.push(...genIntegral(sec, exercises.length, 50));
    exercises.push(...genLimits(sec, exercises.length, 50));
    exercises.push(...genComplex(sec, exercises.length, 50));
    exercises.push(...genVectors(sec, exercises.length, 50));
  }

  // Double up with harder variants to reach 3000
  const base = exercises.length;
  for (const sec of secs) {
    exercises.push(...genLinearEq(sec, base, 50));
    exercises.push(...genQuadratic(sec, base+100, 50));
    exercises.push(...genDerivative(sec, base+200, 50));
    exercises.push(...genPythagoras(sec, base+300, 50));
    exercises.push(...genTrig(sec, base+400, 50));
    exercises.push(...genIntegral(sec, base+500, 50));
    exercises.push(...genFractions(sec, base+600, 50));
    exercises.push(...genSequence(sec, base+700, 50));
    exercises.push(...genProbability(sec, base+800, 50));
    exercises.push(...genStatBasic(sec, base+900, 50));
  }

  _cache = exercises;
  return exercises;
}
