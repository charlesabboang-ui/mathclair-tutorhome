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

// ─── HELPERS ──────────────────────
function gcd(a: number, b: number): number { return b === 0 ? Math.abs(a) : gcd(b, a % b); }
function sup(n: number): string { const s: Record<number,string>={0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹"}; return String(n).split("").map(c=>s[+c]||c).join(""); }
function sup2(n: number): string { return sup(n); }

// ═══════════════════════════════════════════════════
// BEPC GENERATORS (10 topics)
// ═══════════════════════════════════════════════════

const genLinearEq: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 2 + (i % 12); const sol = 1 + (i % 10); const b = 3 + (i * 3 % 15); const c = a * sol + b;
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
    const n1 = 1 + (i % 9); const d1 = 2 + (i % 7); const n2 = 1 + ((i*3) % 8); const d2 = 3 + (i % 6);
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
    const base = (i % 15 + 1) * 40; const pct = (i % 12 + 1) * 5; const ans = base * pct / 100;
    return { id: `bepc-${sec[0]}-pc-${start+i}`, level: "bepc" as const, section: sec, topic: f ? "Arithmétique" : "Arithmetic",
      question: f ? `${pct}% de ${base} = ?` : `${pct}% of ${base} = ?`,
      options: [`${ans}`, `${ans+10}`, `${ans-5}`, `${base-ans}`], answer: 0,
      explanation: `${pct}/100 × ${base} = ${ans}`, difficulty: 1 };
  });
};

const genStatBasic: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const vals = [2+i%7, 4+(i*2)%9, 6+i%6, 8+(i*3)%8, 5+i%5];
    const sum = vals.reduce((a,b) => a+b, 0); const mean = sum / vals.length;
    return { id: `bepc-${sec[0]}-st-${start+i}`, level: "bepc" as const, section: sec, topic: f ? "Statistiques" : "Statistics",
      question: f ? `Moyenne de {${vals.join(", ")}} = ?` : `Mean of {${vals.join(", ")}} = ?`,
      options: [`${mean}`, `${mean+1}`, `${mean-1}`, `${vals[2]}`], answer: 0,
      explanation: `(${vals.join(" + ")}) / ${vals.length} = ${sum}/${vals.length} = ${mean}`, difficulty: 1 };
  });
};

const genArea: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const shape = i % 3;
    if (shape === 0) {
      const l = 3 + (i % 12); const w = 2 + ((i * 3) % 10); const area = l * w;
      return { id: `bepc-${sec[0]}-ar-${start+i}`, level: "bepc" as const, section: sec, topic: f ? "Géométrie" : "Geometry",
        question: f ? `Aire d'un rectangle ${l} cm × ${w} cm = ?` : `Area of rectangle ${l} cm × ${w} cm = ?`,
        options: [`${area} cm²`, `${area+l} cm²`, `${2*(l+w)} cm²`, `${l+w} cm²`], answer: 0,
        explanation: `A = l × w = ${l} × ${w} = ${area} cm²`, difficulty: 1 };
    } else if (shape === 1) {
      const b = 4 + (i % 10); const h = 3 + ((i * 2) % 8); const area = b * h / 2;
      return { id: `bepc-${sec[0]}-ar-${start+i}`, level: "bepc" as const, section: sec, topic: f ? "Géométrie" : "Geometry",
        question: f ? `Aire d'un triangle base ${b} cm, hauteur ${h} cm = ?` : `Area of triangle base ${b} cm, height ${h} cm = ?`,
        options: [`${area} cm²`, `${b*h} cm²`, `${area+b} cm²`, `${b+h} cm²`], answer: 0,
        explanation: `A = b×h/2 = ${b}×${h}/2 = ${area} cm²`, difficulty: 1 };
    } else {
      const r = 2 + (i % 10); const area = Math.round(Math.PI * r * r * 100) / 100;
      return { id: `bepc-${sec[0]}-ar-${start+i}`, level: "bepc" as const, section: sec, topic: f ? "Géométrie" : "Geometry",
        question: f ? `Aire d'un cercle de rayon ${r} cm = ? (π ≈ 3.14)` : `Area of circle radius ${r} cm = ? (π ≈ 3.14)`,
        options: [`${(3.14*r*r).toFixed(1)} cm²`, `${(2*3.14*r).toFixed(1)} cm²`, `${r*r} cm²`, `${(3.14*r).toFixed(1)} cm²`], answer: 0,
        explanation: `A = πr² = 3.14 × ${r}² = ${(3.14*r*r).toFixed(1)} cm²`, difficulty: 1 };
    }
  });
};

const genPerimeter: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const l = 3 + (i % 15); const w = 2 + ((i * 2) % 12); const p = 2 * (l + w);
    return { id: `bepc-${sec[0]}-pm-${start+i}`, level: "bepc" as const, section: sec, topic: f ? "Géométrie" : "Geometry",
      question: f ? `Périmètre d'un rectangle ${l} cm × ${w} cm = ?` : `Perimeter of rectangle ${l} cm × ${w} cm = ?`,
      options: [`${p} cm`, `${l*w} cm`, `${p+2} cm`, `${l+w} cm`], answer: 0,
      explanation: `P = 2(l + w) = 2(${l} + ${w}) = ${p} cm`, difficulty: 1 };
  });
};

const genRatio: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 2 + (i % 8); const b = 3 + ((i * 2) % 7); const total = (a + b) * (2 + (i % 6));
    const partA = Math.round(total * a / (a + b));
    return { id: `bepc-${sec[0]}-rt-${start+i}`, level: "bepc" as const, section: sec, topic: f ? "Arithmétique" : "Arithmetic",
      question: f ? `Partager ${total} dans le rapport ${a}:${b}. Plus grande part = ?` : `Share ${total} in ratio ${a}:${b}. Larger share = ?`,
      options: [`${Math.max(partA, total - partA)}`, `${Math.min(partA, total - partA)}`, `${total}`, `${a * b}`], answer: 0,
      explanation: `${total} × ${Math.max(a,b)}/${a+b} = ${Math.max(partA, total - partA)}`, difficulty: 1 };
  });
};

const genIntegers: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = -(5 + (i % 10)); const b = 3 + ((i * 3) % 12); const sum = a + b;
    return { id: `bepc-${sec[0]}-in-${start+i}`, level: "bepc" as const, section: sec, topic: f ? "Arithmétique" : "Arithmetic",
      question: f ? `Calculer : (${a}) + ${b} = ?` : `Calculate: (${a}) + ${b} = ?`,
      options: [`${sum}`, `${-sum}`, `${a * b}`, `${Math.abs(a) + b}`], answer: 0,
      explanation: `(${a}) + ${b} = ${sum}`, difficulty: 1 };
  });
};

const genLCMGCD: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 4 + (i % 20) * 2; const b = 6 + ((i * 3) % 18); const g = gcd(a, b);
    return { id: `bepc-${sec[0]}-gd-${start+i}`, level: "bepc" as const, section: sec, topic: f ? "Arithmétique" : "Arithmetic",
      question: f ? `PGCD(${a}, ${b}) = ?` : `GCD(${a}, ${b}) = ?`,
      options: [`${g}`, `${g * 2}`, `${a * b / g}`, `${Math.min(a, b)}`], answer: 0,
      explanation: `PGCD(${a}, ${b}) = ${g}`, difficulty: 1 };
  });
};

// ═══════════════════════════════════════════════════
// PROBATOIRE GENERATORS (10 topics)
// ═══════════════════════════════════════════════════

const genQuadratic: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const r1 = 1 + (i % 8); const r2 = 2 + ((i*2) % 7);
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
  const angles = [30, 45, 60, 90, 120, 135, 150, 180, 210, 240, 270, 300, 315, 330, 360];
  const sinVals: Record<number,string> = {30:"1/2",45:"√2/2",60:"√3/2",90:"1",120:"√3/2",135:"√2/2",150:"1/2",180:"0",210:"-1/2",240:"-√3/2",270:"-1",300:"-√3/2",315:"-√2/2",330:"-1/2",360:"0"};
  return Array.from({ length: count }, (_, i) => {
    const func = i % 2 === 0 ? "sin" : "cos";
    const angle = angles[i % angles.length];
    const sv = sinVals[angle] || "0";
    return { id: `prob-${sec[0]}-tr-${start+i}`, level: "probatoire" as const, section: sec, topic: f ? "Trigonométrie" : "Trigonometry",
      question: `${func}(${angle}°) = ?`,
      options: [sv, "√3/3", "1/√2", "2/3"], answer: 0,
      explanation: `${func}(${angle}°) = ${sv}`, difficulty: 2 };
  });
};

const genSequence: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const isGeo = i % 2 === 1;
    if (isGeo) {
      const a1 = 2 + (i % 5); const r = 2 + (i % 3); const n = 4 + (i % 5);
      const an = a1 * Math.pow(r, n - 1);
      return { id: `prob-${sec[0]}-sq-${start+i}`, level: "probatoire" as const, section: sec, topic: f ? "Suites" : "Sequences",
        question: f ? `Suite géométrique: u₁=${a1}, q=${r}. Trouver u${n}.` : `GP: a₁=${a1}, r=${r}. Find a${n}.`,
        options: [`${an}`, `${an * r}`, `${a1 * n}`, `${an / r}`], answer: 0,
        explanation: `uₙ = u₁ × qⁿ⁻¹ = ${a1} × ${r}${sup(n-1)} = ${an}`, difficulty: 2 };
    }
    const a1 = 2 + (i % 10); const d = 3 + (i % 7); const n = 8 + (i % 15);
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
    const total = 6 + (i % 10)*2; const fav = 1 + (i % (total-1));
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
    const a = 2 + (i % 8); const b = 1 + (i % 12); const x = 1 + (i % 7);
    const y = a*x + b;
    return { id: `prob-${sec[0]}-fn-${start+i}`, level: "probatoire" as const, section: sec, topic: f ? "Fonctions" : "Functions",
      question: f ? `f(x) = ${a}x + ${b}. Calculer f(${x}).` : `f(x) = ${a}x + ${b}. Find f(${x}).`,
      options: [`${y}`, `${y+a}`, `${y-b}`, `${a*b}`], answer: 0,
      explanation: `f(${x}) = ${a}×${x} + ${b} = ${a*x} + ${b} = ${y}`, difficulty: 1 };
  });
};

const genInequality: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 2 + (i % 9); const b = 3 + ((i * 2) % 11); const c = a * (3 + i % 5) + b;
    const sol = (c - b) / a;
    return { id: `prob-${sec[0]}-iq-${start+i}`, level: "probatoire" as const, section: sec, topic: f ? "Inéquations" : "Inequalities",
      question: f ? `Résoudre : ${a}x + ${b} < ${c}` : `Solve: ${a}x + ${b} < ${c}`,
      options: [`x < ${sol}`, `x > ${sol}`, `x < ${-sol}`, `x > ${sol + 1}`], answer: 0,
      explanation: `${a}x < ${c} - ${b} = ${c-b}, x < ${c-b}/${a} = ${sol}`, difficulty: 2 };
  });
};

const genSystemEq: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const x = 1 + (i % 7); const y = 2 + ((i * 2) % 6);
    const a1 = 1 + (i % 4); const b1 = 1 + ((i * 3) % 3); const c1 = a1 * x + b1 * y;
    const a2 = 2 + (i % 3); const b2 = 1 + (i % 5); const c2 = a2 * x + b2 * y;
    return { id: `prob-${sec[0]}-sy-${start+i}`, level: "probatoire" as const, section: sec, topic: f ? "Systèmes" : "Systems of Equations",
      question: f ? `Résoudre : ${a1}x + ${b1}y = ${c1} et ${a2}x + ${b2}y = ${c2}` : `Solve: ${a1}x + ${b1}y = ${c1} and ${a2}x + ${b2}y = ${c2}`,
      options: [`x=${x}, y=${y}`, `x=${y}, y=${x}`, `x=${x+1}, y=${y-1}`, `x=${x-1}, y=${y+1}`], answer: 0,
      explanation: f ? `Par substitution ou élimination: x=${x}, y=${y}` : `By substitution or elimination: x=${x}, y=${y}`, difficulty: 2 };
  });
};

const genLogarithm: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  const bases = [2, 3, 5, 10];
  return Array.from({ length: count }, (_, i) => {
    const base = bases[i % bases.length]; const exp = 2 + (i % 5);
    const val = Math.pow(base, exp);
    return { id: `prob-${sec[0]}-lg-${start+i}`, level: "probatoire" as const, section: sec, topic: f ? "Logarithmes" : "Logarithms",
      question: f ? `log${base === 10 ? "" : "₂₃₅"[bases.indexOf(base)]}(${val}) = ?` : `log${base === 10 ? "" : "₂₃₅"[bases.indexOf(base)]}(${val}) = ?`,
      options: [`${exp}`, `${exp + 1}`, `${base}`, `${val / base}`], answer: 0,
      explanation: `${base}${sup(exp)} = ${val}, ${f ? "donc" : "so"} log = ${exp}`, difficulty: 2 };
  });
};

const genPolynomial: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 1 + (i % 5); const b = 2 + (i % 6); const c = 1 + ((i * 3) % 4);
    const x = 2 + (i % 4);
    const result = a * x * x + b * x + c;
    return { id: `prob-${sec[0]}-pl-${start+i}`, level: "probatoire" as const, section: sec, topic: f ? "Polynômes" : "Polynomials",
      question: f ? `P(x) = ${a}x² + ${b}x + ${c}. Calculer P(${x}).` : `P(x) = ${a}x² + ${b}x + ${c}. Find P(${x}).`,
      options: [`${result}`, `${result + a}`, `${result - c}`, `${a * x + b}`], answer: 0,
      explanation: `P(${x}) = ${a}(${x})² + ${b}(${x}) + ${c} = ${a*x*x} + ${b*x} + ${c} = ${result}`, difficulty: 2 };
  });
};

// ═══════════════════════════════════════════════════
// BACCALAURÉAT GENERATORS (10 topics)
// ═══════════════════════════════════════════════════

const genDerivative: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 2 + (i % 8); const n = 2 + (i % 5); const b = 1 + (i % 10);
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
    const a = 1 + (i % 6); const upper = 2 + (i % 5);
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
    const a = 2 + (i % 10); const b = 3 + (i % 8);
    return { id: `bac-${sec[0]}-lm-${start+i}`, level: "bac" as const, section: sec, topic: f ? "Analyse" : "Calculus",
      question: f ? `lim(x→∞) (${a}x + ${b}) / (x + 1) = ?` : `lim(x→∞) (${a}x + ${b}) / (x + 1) = ?`,
      options: [`${a}`, `${b}`, `∞`, `0`], answer: 0,
      explanation: `Divide by x: lim = ${a}/1 = ${a}`, difficulty: 3 };
  });
};

const genComplex: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const op = i % 3;
    const a = 1+(i%7); const b = 2+(i%6); const c = 1+(i*2%8); const d = 3+(i%5);
    if (op === 0) {
      const rr = a+c; const ri = b+d;
      return { id: `bac-${sec[0]}-cx-${start+i}`, level: "bac" as const, section: sec, topic: f ? "Nombres complexes" : "Complex Numbers",
        question: f ? `(${a}+${b}i) + (${c}+${d}i) = ?` : `(${a}+${b}i) + (${c}+${d}i) = ?`,
        options: [`${rr}+${ri}i`, `${rr}-${ri}i`, `${a*c}+${b*d}i`, `${rr}`], answer: 0,
        explanation: `(${a}+${c}) + (${b}+${d})i = ${rr}+${ri}i`, difficulty: 2 };
    } else if (op === 1) {
      const mod = Math.round(Math.sqrt(a*a + b*b) * 100) / 100;
      return { id: `bac-${sec[0]}-cx-${start+i}`, level: "bac" as const, section: sec, topic: f ? "Nombres complexes" : "Complex Numbers",
        question: f ? `|${a}+${b}i| = ?` : `|${a}+${b}i| = ?`,
        options: [`√${a*a+b*b}`, `${a+b}`, `${a*b}`, `√${a*a-b*b > 0 ? a*a-b*b : a*a+b*b+1}`], answer: 0,
        explanation: `|z| = √(${a}²+${b}²) = √${a*a+b*b}`, difficulty: 2 };
    } else {
      const rr = a-c; const ri = b-d;
      return { id: `bac-${sec[0]}-cx-${start+i}`, level: "bac" as const, section: sec, topic: f ? "Nombres complexes" : "Complex Numbers",
        question: f ? `(${a}+${b}i) - (${c}+${d}i) = ?` : `(${a}+${b}i) - (${c}+${d}i) = ?`,
        options: [`${rr}${ri>=0?"+":""}${ri}i`, `${-rr}+${-ri}i`, `${a*c}i`, `${rr}`], answer: 0,
        explanation: `(${a}-${c}) + (${b}-${d})i = ${rr}${ri>=0?"+":""}${ri}i`, difficulty: 2 };
    }
  });
};

const genVectors: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const x1=1+(i%8),y1=2+(i%6),x2=3+(i%5),y2=1+(i%9);
    const dot = x1*x2+y1*y2;
    return { id: `bac-${sec[0]}-vc-${start+i}`, level: "bac" as const, section: sec, topic: f ? "Vecteurs" : "Vectors",
      question: f ? `u⃗(${x1},${y1}) · v⃗(${x2},${y2}) = ?` : `u⃗(${x1},${y1}) · v⃗(${x2},${y2}) = ?`,
      options: [`${dot}`, `${dot+2}`, `${x1*y2}`, `${x1+y1}`], answer: 0,
      explanation: `${x1}×${x2} + ${y1}×${y2} = ${x1*x2} + ${y1*y2} = ${dot}`, difficulty: 2 };
  });
};

const genMatrix: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 1+(i%6); const b = 2+(i%4); const c = 3+(i%3); const d = 1+(i%5);
    const det = a*d - b*c;
    return { id: `bac-${sec[0]}-mx-${start+i}`, level: "bac" as const, section: sec, topic: f ? "Matrices" : "Matrices",
      question: f ? `Déterminant de la matrice [[${a},${b}],[${c},${d}]] = ?` : `Determinant of matrix [[${a},${b}],[${c},${d}]] = ?`,
      options: [`${det}`, `${a*d+b*c}`, `${a+d}`, `${a*d}`], answer: 0,
      explanation: `det = ad - bc = ${a}×${d} - ${b}×${c} = ${a*d} - ${b*c} = ${det}`, difficulty: 3 };
  });
};

const genContinuity: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 2 + (i % 7); const b = 1 + (i % 9); const x0 = 1 + (i % 5);
    const val = a * x0 + b;
    return { id: `bac-${sec[0]}-ct-${start+i}`, level: "bac" as const, section: sec, topic: f ? "Continuité" : "Continuity",
      question: f ? `f(x) = ${a}x + ${b}. f est-elle continue en x=${x0} ? f(${x0}) = ?` : `f(x) = ${a}x + ${b}. Is f continuous at x=${x0}? f(${x0}) = ?`,
      options: [`${f ? "Oui" : "Yes"}, f(${x0})=${val}`, `${f ? "Non" : "No"}`, `f(${x0})=${val+1}`, `${f ? "Indéterminé" : "Undefined"}`], answer: 0,
      explanation: f ? `Polynôme → continue partout. f(${x0}) = ${a}×${x0}+${b} = ${val}` : `Polynomial → continuous everywhere. f(${x0}) = ${a}×${x0}+${b} = ${val}`, difficulty: 3 };
  });
};

const genExpLog: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const a = 1 + (i % 6); const b = 2 + (i % 4);
    return { id: `bac-${sec[0]}-el-${start+i}`, level: "bac" as const, section: sec, topic: f ? "Exponentielle & Log" : "Exponential & Log",
      question: f ? `Simplifier : ln(e${sup(a)}) + ln(e${sup(b)}) = ?` : `Simplify: ln(e${sup(a)}) + ln(e${sup(b)}) = ?`,
      options: [`${a + b}`, `${a * b}`, `e${sup(a+b)}`, `ln(${a+b})`], answer: 0,
      explanation: `ln(eᵃ) = a. ${a} + ${b} = ${a + b}`, difficulty: 3 };
  });
};

const genSeries: Gen = (sec, start, count) => {
  const f = sec === "francophone";
  return Array.from({ length: count }, (_, i) => {
    const n = 5 + (i % 20);
    const sum = n * (n + 1) / 2;
    return { id: `bac-${sec[0]}-sr-${start+i}`, level: "bac" as const, section: sec, topic: f ? "Séries" : "Series",
      question: f ? `Somme des ${n} premiers entiers naturels = ?` : `Sum of first ${n} natural numbers = ?`,
      options: [`${sum}`, `${sum + n}`, `${n * n}`, `${n * (n - 1) / 2}`], answer: 0,
      explanation: `S = n(n+1)/2 = ${n}×${n+1}/2 = ${sum}`, difficulty: 3 };
  });
};

// ─── GENERATE ALL EXERCISES: 3000+ per level ──────────────────────
let _cache: Exercise[] | null = null;

const N = 150; // exercises per generator per section → 10 generators × 2 sections × 150 = 3000/level

export function getAllExercises(): Exercise[] {
  if (_cache) return _cache;

  const exercises: Exercise[] = [];
  const secs: Array<"francophone" | "anglophone"> = ["francophone", "anglophone"];

  // BEPC: 10 generators × 2 sections × 150 each = 3000
  for (const sec of secs) {
    exercises.push(...genLinearEq(sec, exercises.length, N));
    exercises.push(...genPythagoras(sec, exercises.length, N));
    exercises.push(...genFractions(sec, exercises.length, N));
    exercises.push(...genPercentage(sec, exercises.length, N));
    exercises.push(...genStatBasic(sec, exercises.length, N));
    exercises.push(...genArea(sec, exercises.length, N));
    exercises.push(...genPerimeter(sec, exercises.length, N));
    exercises.push(...genRatio(sec, exercises.length, N));
    exercises.push(...genIntegers(sec, exercises.length, N));
    exercises.push(...genLCMGCD(sec, exercises.length, N));
  }

  // Probatoire: 10 generators × 2 sections × 150 each = 3000
  for (const sec of secs) {
    exercises.push(...genQuadratic(sec, exercises.length, N));
    exercises.push(...genTrig(sec, exercises.length, N));
    exercises.push(...genSequence(sec, exercises.length, N));
    exercises.push(...genProbability(sec, exercises.length, N));
    exercises.push(...genFunctions(sec, exercises.length, N));
    exercises.push(...genInequality(sec, exercises.length, N));
    exercises.push(...genSystemEq(sec, exercises.length, N));
    exercises.push(...genLogarithm(sec, exercises.length, N));
    exercises.push(...genPolynomial(sec, exercises.length, N));
    exercises.push(...genArea(sec, exercises.length, N)); // geometry for prob too
  }

  // Baccalauréat: 10 generators × 2 sections × 150 each = 3000
  for (const sec of secs) {
    exercises.push(...genDerivative(sec, exercises.length, N));
    exercises.push(...genIntegral(sec, exercises.length, N));
    exercises.push(...genLimits(sec, exercises.length, N));
    exercises.push(...genComplex(sec, exercises.length, N));
    exercises.push(...genVectors(sec, exercises.length, N));
    exercises.push(...genMatrix(sec, exercises.length, N));
    exercises.push(...genContinuity(sec, exercises.length, N));
    exercises.push(...genExpLog(sec, exercises.length, N));
    exercises.push(...genSeries(sec, exercises.length, N));
    exercises.push(...genSequence(sec, exercises.length, N)); // advanced sequences
  }

  _cache = exercises;
  return exercises;
}
