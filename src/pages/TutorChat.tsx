import { useState, useRef, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";

interface Message {
  id: number;
  role: "user" | "tutor";
  text: string;
  loading?: boolean;
}

function formatMathText(text: string) {
  return text.split("\n").map((ln, i) => {
    const t = ln.trim();
    if (!t) return null;
    if (t.startsWith("→") || /^Step\s*\d+/i.test(t) || /^Étape\s*\d+/i.test(t)) {
      return <div key={i} className="math-block">{t}</div>;
    }
    return <p key={i} className="my-0.5">{t}</p>;
  });
}

interface TopicEntry {
  keys: string[];
  en: string;
  fr: string;
}

const TOPICS: TopicEntry[] = [
  {
    keys: ["quadrat", "2nd degré", "second degré", "ax²", "ax2"],
    en: "Great question! Let me explain quadratic equations step by step.\n\nA quadratic equation has the form ax² + bx + c = 0\n\nStep 1: Identify coefficients a, b, and c\nStep 2: Calculate the discriminant Δ = b² − 4ac\nStep 3: If Δ > 0: two real solutions x = (−b ± √Δ) / 2a\n→ If Δ = 0: one double root x = −b / 2a\n→ If Δ < 0: no real solutions\n\nExample: Solve 2x² − 5x + 3 = 0\n→ a=2, b=−5, c=3\n→ Δ = 25 − 24 = 1\n→ x₁ = (5+1)/4 = 3/2\n→ x₂ = (5−1)/4 = 1\n\nWould you like to practice with more examples?",
    fr: "Excellente question ! Voici les équations du 2nd degré pas à pas.\n\nUne équation quadratique a la forme ax² + bx + c = 0\n\nÉtape 1: Identifier les coefficients a, b et c\nÉtape 2: Calculer le discriminant Δ = b² − 4ac\nÉtape 3: Si Δ > 0 : deux solutions réelles x = (−b ± √Δ) / 2a\n→ Si Δ = 0 : une racine double x = −b / 2a\n→ Si Δ < 0 : pas de solutions réelles\n\nExemple : Résoudre 2x² − 5x + 3 = 0\n→ a=2, b=−5, c=3\n→ Δ = 25 − 24 = 1\n→ x₁ = (5+1)/4 = 3/2\n→ x₂ = (5−1)/4 = 1",
  },
  {
    keys: ["pythag", "hypotenuse", "right triangle", "triangle rectangle"],
    en: "The Pythagorean theorem is fundamental!\n\nFor a right triangle with legs a, b and hypotenuse c:\n→ a² + b² = c²\n\nStep 1: Identify the right angle (90°)\nStep 2: The hypotenuse is opposite the right angle\nStep 3: Apply the formula\n\nExample: AC=6, BC=8, ∠C=90°\n→ AB² = 36 + 64 = 100\n→ AB = √100 = 10 cm\n\nThis is a 3-4-5 triple scaled by 2!",
    fr: "Le théorème de Pythagore est fondamental !\n\nPour un triangle rectangle de côtés a, b et hypoténuse c :\n→ a² + b² = c²\n\nÉtape 1: Identifier l'angle droit (90°)\nÉtape 2: L'hypoténuse est opposée à l'angle droit\nÉtape 3: Appliquer la formule\n\nExemple : AC=6, BC=8, ∠C=90°\n→ AB² = 36 + 64 = 100\n→ AB = √100 = 10 cm",
  },
  {
    keys: ["deriv", "différent", "differentiat", "f'(x)", "taux de variation"],
    en: "Differentiation is key in calculus!\n\nThe derivative f'(x) measures the rate of change.\n\nBasic rules:\n→ d/dx(xⁿ) = n·xⁿ⁻¹\n→ d/dx(constant) = 0\n→ d/dx(sin x) = cos x\n→ d/dx(eˣ) = eˣ\n\nExample: f(x) = 3x⁴ − 2x² + 5x − 1\n→ f'(x) = 12x³ − 4x + 5\n\nChain rule: d/dx[f(g(x))] = f'(g(x))·g'(x)",
    fr: "La dérivation est essentielle en analyse !\n\nLa dérivée f'(x) mesure le taux de variation.\n\nRègles de base :\n→ d/dx(xⁿ) = n·xⁿ⁻¹\n→ d/dx(constante) = 0\n→ d/dx(sin x) = cos x\n→ d/dx(eˣ) = eˣ\n\nExemple : f(x) = 3x⁴ − 2x² + 5x − 1\n→ f'(x) = 12x³ − 4x + 5\n\nRègle de la chaîne : d/dx[f(g(x))] = f'(g(x))·g'(x)",
  },
  {
    keys: ["probab", "chance", "dé", "dice", "événement", "outcome"],
    en: "Probability measures how likely an event is!\n\nP(event) = favorable outcomes / total outcomes\n\nExample: Rolling a fair die, P(even) = ?\n→ Total: {1,2,3,4,5,6} = 6\n→ Even: {2,4,6} = 3\n→ P(even) = 3/6 = 1/2\n\nKey rules:\n→ 0 ≤ P(A) ≤ 1\n→ P(A') = 1 − P(A)\n→ P(A∪B) = P(A) + P(B) − P(A∩B)\n→ P(A∩B) = P(A)·P(B|A)",
    fr: "La probabilité mesure la chance qu'un événement se produise !\n\nP(événement) = cas favorables / cas possibles\n\nExemple : Lancer un dé, P(pair) = ?\n→ Total : {1,2,3,4,5,6} = 6\n→ Pairs : {2,4,6} = 3\n→ P(pair) = 3/6 = 1/2\n\nRègles clés :\n→ 0 ≤ P(A) ≤ 1\n→ P(A') = 1 − P(A)\n→ P(A∪B) = P(A) + P(B) − P(A∩B)",
  },
  {
    keys: ["integr", "intégr", "primitiv", "antideriv", "∫"],
    en: "Integration is the reverse of differentiation!\n\n∫xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ −1)\n\nExample: ∫₀² (x² + 1)dx\nStep 1: F(x) = x³/3 + x\nStep 2: F(2) − F(0) = (8/3 + 2) − 0 = 14/3 ≈ 4.67\n\nCommon integrals:\n→ ∫sin x dx = −cos x + C\n→ ∫eˣ dx = eˣ + C\n→ ∫1/x dx = ln|x| + C",
    fr: "L'intégration est l'inverse de la dérivation !\n\n∫xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ −1)\n\nExemple : ∫₀² (x² + 1)dx\nÉtape 1: F(x) = x³/3 + x\nÉtape 2: F(2) − F(0) = (8/3 + 2) − 0 = 14/3 ≈ 4,67\n\nIntégrales courantes :\n→ ∫sin x dx = −cos x + C\n→ ∫eˣ dx = eˣ + C\n→ ∫1/x dx = ln|x| + C",
  },
  {
    keys: ["trigo", "sin", "cos", "tan", "cosinus", "sinus", "tangent"],
    en: "Trigonometry connects angles to side ratios!\n\nIn a right triangle:\n→ sin θ = opposite / hypotenuse\n→ cos θ = adjacent / hypotenuse\n→ tan θ = opposite / adjacent\n\nKey values:\n→ sin 30° = 1/2, cos 30° = √3/2\n→ sin 45° = √2/2, cos 45° = √2/2\n→ sin 60° = √3/2, cos 60° = 1/2\n\nIdentity: sin²θ + cos²θ = 1\n\nExample: Find the height of a building 50m away at angle 35°\n→ h = 50 × tan 35° ≈ 35.01 m",
    fr: "La trigonométrie relie angles et rapports de côtés !\n\nDans un triangle rectangle :\n→ sin θ = opposé / hypoténuse\n→ cos θ = adjacent / hypoténuse\n→ tan θ = opposé / adjacent\n\nValeurs clés :\n→ sin 30° = 1/2, cos 30° = √3/2\n→ sin 45° = √2/2, cos 45° = √2/2\n→ sin 60° = √3/2, cos 60° = 1/2\n\nIdentité : sin²θ + cos²θ = 1",
  },
  {
    keys: ["simultaneous", "système", "system of equation", "linear system", "substitut", "eliminat"],
    en: "Simultaneous equations — two equations, two unknowns!\n\nMethods:\n→ Substitution: Solve one equation for a variable, plug into the other\n→ Elimination: Add/subtract equations to remove a variable\n\nExample: 2x + y = 7, x − y = 2\nStep 1 (Elimination): Add both equations\n→ 3x = 9 → x = 3\nStep 2: Substitute x = 3 into x − y = 2\n→ 3 − y = 2 → y = 1\n→ Solution: x = 3, y = 1",
    fr: "Système d'équations — deux équations, deux inconnues !\n\nMéthodes :\n→ Substitution : Résoudre une équation pour une variable\n→ Élimination : Ajouter/soustraire pour éliminer une variable\n\nExemple : 2x + y = 7, x − y = 2\nÉtape 1 (Élimination) : Additionner\n→ 3x = 9 → x = 3\nÉtape 2 : Substituer x = 3 dans x − y = 2\n→ 3 − y = 2 → y = 1\n→ Solution : x = 3, y = 1",
  },
  {
    keys: ["fraction", "numerat", "denominat", "simplif"],
    en: "Fractions are ratios of two numbers!\n\nOperations:\n→ a/b + c/d = (ad + bc) / bd\n→ a/b × c/d = ac / bd\n→ a/b ÷ c/d = a/b × d/c\n\nSimplify by finding GCD:\n→ 12/18: GCD(12,18) = 6\n→ 12/18 = 2/3\n\nExample: 3/4 + 2/5\n→ = (15 + 8) / 20 = 23/20 = 1 3/20",
    fr: "Les fractions sont des rapports de deux nombres !\n\nOpérations :\n→ a/b + c/d = (ad + bc) / bd\n→ a/b × c/d = ac / bd\n→ a/b ÷ c/d = a/b × d/c\n\nSimplifier par le PGCD :\n→ 12/18 : PGCD(12,18) = 6\n→ 12/18 = 2/3\n\nExemple : 3/4 + 2/5\n→ = (15 + 8) / 20 = 23/20",
  },
  {
    keys: ["percent", "pourcent", "%", "increase", "decrease", "augment", "diminut"],
    en: "Percentages express parts per hundred!\n\n→ x% of N = (x/100) × N\n→ Percentage increase = ((New − Old) / Old) × 100\n→ Percentage decrease = ((Old − New) / Old) × 100\n\nExample: Price goes from 5000 FCFA to 6500 FCFA\n→ Increase = (6500 − 5000) / 5000 × 100 = 30%\n\nDiscount: 20% off 8000 FCFA\n→ Discount = 0.20 × 8000 = 1600\n→ Final = 8000 − 1600 = 6400 FCFA",
    fr: "Les pourcentages expriment des parties sur cent !\n\n→ x% de N = (x/100) × N\n→ Augmentation en % = ((Nouveau − Ancien) / Ancien) × 100\n→ Diminution en % = ((Ancien − Nouveau) / Ancien) × 100\n\nExemple : Prix passe de 5000 FCFA à 6500 FCFA\n→ Augmentation = (6500 − 5000) / 5000 × 100 = 30%\n\nRemise : 20% sur 8000 FCFA\n→ Remise = 0,20 × 8000 = 1600\n→ Final = 8000 − 1600 = 6400 FCFA",
  },
  {
    keys: ["matrix", "matric", "determinant", "inverse matrix"],
    en: "Matrices are rectangular arrays of numbers!\n\nFor a 2×2 matrix A = [[a,b],[c,d]]:\n→ det(A) = ad − bc\n→ A⁻¹ = (1/det) × [[d,−b],[−c,a]]\n\nMultiplication: (AB)ᵢⱼ = Σ Aᵢₖ × Bₖⱼ\n\nExample: A = [[2,3],[1,4]]\n→ det(A) = 2×4 − 3×1 = 5\n→ A⁻¹ = (1/5)[[4,−3],[−1,2]]",
    fr: "Les matrices sont des tableaux rectangulaires de nombres !\n\nPour une matrice 2×2 A = [[a,b],[c,d]] :\n→ det(A) = ad − bc\n→ A⁻¹ = (1/det) × [[d,−b],[−c,a]]\n\nMultiplication : (AB)ᵢⱼ = Σ Aᵢₖ × Bₖⱼ\n\nExemple : A = [[2,3],[1,4]]\n→ det(A) = 2×4 − 3×1 = 5\n→ A⁻¹ = (1/5)[[4,−3],[−1,2]]",
  },
  {
    keys: ["log", "logarith", "ln", "exponent", "puissance", "power"],
    en: "Logarithms are the inverse of exponentiation!\n\n→ logₐ(x) = y means aʸ = x\n→ ln(x) = logₑ(x)\n\nKey properties:\n→ log(ab) = log a + log b\n→ log(a/b) = log a − log b\n→ log(aⁿ) = n·log a\n→ log 1 = 0, log a = 1 (base a)\n\nExample: Solve 2ˣ = 32\n→ x = log₂(32) = log₂(2⁵) = 5",
    fr: "Les logarithmes sont l'inverse de l'exponentiation !\n\n→ logₐ(x) = y signifie aʸ = x\n→ ln(x) = logₑ(x)\n\nPropriétés clés :\n→ log(ab) = log a + log b\n→ log(a/b) = log a − log b\n→ log(aⁿ) = n·log a\n\nExemple : Résoudre 2ˣ = 32\n→ x = log₂(32) = log₂(2⁵) = 5",
  },
  {
    keys: ["sequence", "suite", "arithmetic", "geometric", "géométrique", "series", "série"],
    en: "Sequences & Series!\n\nArithmetic sequence: aₙ = a₁ + (n−1)d\n→ Sum: Sₙ = n/2 × (2a₁ + (n−1)d)\n\nGeometric sequence: aₙ = a₁ × rⁿ⁻¹\n→ Sum: Sₙ = a₁(1 − rⁿ)/(1 − r) for r ≠ 1\n→ Infinite sum (|r| < 1): S∞ = a₁/(1 − r)\n\nExample: 2, 6, 18, 54… (geometric, r=3)\n→ a₅ = 2 × 3⁴ = 162\n→ S₅ = 2(1−243)/(1−3) = 242",
    fr: "Suites et Séries !\n\nSuite arithmétique : aₙ = a₁ + (n−1)r\n→ Somme : Sₙ = n/2 × (2a₁ + (n−1)r)\n\nSuite géométrique : aₙ = a₁ × qⁿ⁻¹\n→ Somme : Sₙ = a₁(1 − qⁿ)/(1 − q)\n→ Somme infinie (|q| < 1) : S∞ = a₁/(1 − q)\n\nExemple : 2, 6, 18, 54… (géom., q=3)\n→ a₅ = 2 × 3⁴ = 162",
  },
  {
    keys: ["circle", "cercle", "rayon", "radius", "circumference", "périmètre", "arc", "sector"],
    en: "Circle properties!\n\n→ Circumference = 2πr\n→ Area = πr²\n→ Arc length = (θ/360°) × 2πr\n→ Sector area = (θ/360°) × πr²\n\nCircle theorems:\n→ Angle at center = 2 × angle at circumference\n→ Angles in same segment are equal\n→ Angle in semicircle = 90°\n\nExample: Circle with r = 7 cm\n→ C = 2π(7) = 14π ≈ 43.98 cm\n→ A = π(49) ≈ 153.94 cm²",
    fr: "Propriétés du cercle !\n\n→ Périmètre = 2πr\n→ Aire = πr²\n→ Longueur d'arc = (θ/360°) × 2πr\n→ Aire du secteur = (θ/360°) × πr²\n\nExemple : Cercle de rayon r = 7 cm\n→ C = 2π(7) = 14π ≈ 43,98 cm\n→ A = π(49) ≈ 153,94 cm²",
  },
  {
    keys: ["triangle", "angle", "somme des angles", "sum of angle"],
    en: "Triangle properties are essential!\n\nThe sum of angles in a triangle = 180°\n\nTypes of triangles:\n→ Equilateral: all sides & angles equal (60° each)\n→ Isosceles: two sides equal, two base angles equal\n→ Scalene: all sides different\n\nArea = ½ × base × height\n\nExample: Triangle with angles 50° and 70°\n→ Third angle = 180° − 50° − 70° = 60°",
    fr: "Les propriétés des triangles sont essentielles !\n\nLa somme des angles d'un triangle = 180°\n\nTypes de triangles :\n→ Équilatéral : tous les côtés et angles égaux (60° chacun)\n→ Isocèle : deux côtés égaux\n→ Scalène : tous les côtés différents\n\nAire = ½ × base × hauteur\n\nExemple : Triangle avec angles 50° et 70°\n→ Troisième angle = 180° − 50° − 70° = 60°",
  },
  {
    keys: ["equation", "solve", "résoudre", "solution", "root", "racine", "x ="],
    en: "Let me help you solve equations!\n\nLinear: ax + b = 0 → x = −b/a\n\nExample: 3x + 7 = 22\nStep 1: 3x = 22 − 7 = 15\nStep 2: x = 15/3 = 5\n\nWith fractions: (2x−1)/3 = 5\nStep 1: 2x − 1 = 15\nStep 2: 2x = 16\nStep 3: x = 8\n\nAlways verify by substituting back!\n→ (2(8)−1)/3 = 15/3 = 5 ✓",
    fr: "Résolvons des équations !\n\nLinéaire : ax + b = 0 → x = −b/a\n\nExemple : 3x + 7 = 22\nÉtape 1: 3x = 22 − 7 = 15\nÉtape 2: x = 15/3 = 5\n\nAvec fractions : (2x−1)/3 = 5\nÉtape 1: 2x − 1 = 15\nÉtape 2: 2x = 16\nÉtape 3: x = 8\n\nToujours vérifier !\n→ (2(8)−1)/3 = 15/3 = 5 ✓",
  },
  {
    keys: ["limit", "limite", "lim", "tend", "approach", "infini"],
    en: "Limits describe behavior as x approaches a value!\n\n→ lim(x→a) f(x) = L means f(x) gets close to L\n\nKey limits:\n→ lim(x→0) sin(x)/x = 1\n→ lim(x→∞) (1 + 1/x)ˣ = e\n→ lim(x→0) (eˣ − 1)/x = 1\n\nExample: lim(x→2) (x² − 4)/(x − 2)\n→ Factor: (x+2)(x−2)/(x−2) = x + 2\n→ = 2 + 2 = 4",
    fr: "Les limites décrivent le comportement quand x tend vers une valeur !\n\n→ lim(x→a) f(x) = L signifie que f(x) s'approche de L\n\nLimites clés :\n→ lim(x→0) sin(x)/x = 1\n→ lim(x→∞) (1 + 1/x)ˣ = e\n\nExemple : lim(x→2) (x² − 4)/(x − 2)\n→ Factoriser : (x+2)(x−2)/(x−2) = x + 2\n→ = 2 + 2 = 4",
  },
  {
    keys: ["area", "volume", "surface", "aire", "perimetre", "perimeter", "cube", "sphere", "cylinder", "cylindre", "cone"],
    en: "Areas & Volumes!\n\nRectangle: A = l × w, P = 2(l+w)\nCircle: A = πr², C = 2πr\nTriangle: A = ½bh\n\n3D Shapes:\n→ Cube: V = a³, SA = 6a²\n→ Sphere: V = 4/3 πr³, SA = 4πr²\n→ Cylinder: V = πr²h, SA = 2πr(r+h)\n→ Cone: V = 1/3 πr²h\n\nExample: Cylinder r=3, h=10\n→ V = π(9)(10) = 90π ≈ 282.74 cm³",
    fr: "Aires et Volumes !\n\nRectangle : A = l × L, P = 2(l+L)\nCercle : A = πr², C = 2πr\nTriangle : A = ½bh\n\nFormes 3D :\n→ Cube : V = a³, S = 6a²\n→ Sphère : V = 4/3 πr³, S = 4πr²\n→ Cylindre : V = πr²h, S = 2πr(r+h)\n→ Cône : V = 1/3 πr²h\n\nExemple : Cylindre r=3, h=10\n→ V = π(9)(10) = 90π ≈ 282,74 cm³",
  },
  {
    keys: ["vector", "vecteur", "scalar", "dot product", "cross product", "magnitude"],
    en: "Vectors have both magnitude and direction!\n\n→ |v| = √(x² + y²)\n→ v₁ · v₂ = x₁x₂ + y₁y₂ (dot product)\n→ Unit vector: û = v/|v|\n\nExample: A(1,2), B(4,6)\n→ AB = (3, 4)\n→ |AB| = √(9+16) = 5\n\nTwo vectors are perpendicular if v₁ · v₂ = 0",
    fr: "Les vecteurs ont une norme et une direction !\n\n→ |v| = √(x² + y²)\n→ v₁ · v₂ = x₁x₂ + y₁y₂ (produit scalaire)\n→ Vecteur unitaire : û = v/|v|\n\nExemple : A(1,2), B(4,6)\n→ AB = (3, 4)\n→ |AB| = √(9+16) = 5",
  },
  {
    keys: ["complex", "nombre complexe", "imagin", "i²", "modulus", "argument"],
    en: "Complex numbers: z = a + bi where i² = −1\n\n→ Modulus: |z| = √(a² + b²)\n→ Argument: θ = arctan(b/a)\n→ Conjugate: z̄ = a − bi\n\nOperations:\n→ (a+bi)(c+di) = (ac−bd) + (ad+bc)i\n→ z · z̄ = a² + b²\n\nExample: z₁ = 3+4i, z₂ = 1−2i\n→ z₁ + z₂ = 4 + 2i\n→ z₁ × z₂ = 11−2i",
    fr: "Nombres complexes : z = a + bi où i² = −1\n\n→ Module : |z| = √(a² + b²)\n→ Argument : θ = arctan(b/a)\n→ Conjugué : z̄ = a − bi\n\nOpérations :\n→ (a+bi)(c+di) = (ac−bd) + (ad+bc)i\n\nExemple : z₁ = 3+4i, z₂ = 1−2i\n→ z₁ + z₂ = 4 + 2i\n→ z₁ × z₂ = 11−2i",
  },
  {
    keys: ["stat", "mean", "median", "mode", "moyenne", "médiane", "écart", "variance", "standard deviation"],
    en: "Statistics — analyzing data!\n\n→ Mean (x̄) = Σxᵢ / n\n→ Median: middle value when sorted\n→ Mode: most frequent value\n→ Variance: σ² = Σ(xᵢ − x̄)² / n\n→ Standard deviation: σ = √variance\n\nExample: Data = {2, 4, 4, 5, 7, 8}\n→ Mean = 30/6 = 5\n→ Median = (4+5)/2 = 4.5\n→ Mode = 4",
    fr: "Statistiques — analyser les données !\n\n→ Moyenne (x̄) = Σxᵢ / n\n→ Médiane : valeur du milieu une fois trié\n→ Mode : valeur la plus fréquente\n→ Variance : σ² = Σ(xᵢ − x̄)² / n\n→ Écart-type : σ = √variance\n\nExemple : Données = {2, 4, 4, 5, 7, 8}\n→ Moyenne = 30/6 = 5\n→ Médiane = (4+5)/2 = 4,5\n→ Mode = 4",
  },
  {
    keys: ["factor", "expand", "développ", "factori", "identity", "identité", "a+b", "(a+b)²", "remarkable"],
    en: "Factoring & Expanding!\n\nRemarkable identities:\n→ (a + b)² = a² + 2ab + b²\n→ (a − b)² = a² − 2ab + b²\n→ (a + b)(a − b) = a² − b²\n→ (a + b)³ = a³ + 3a²b + 3ab² + b³\n\nExample: Factor x² − 9\n→ = x² − 3² = (x+3)(x−3)\n\nFactor 2x² + 5x − 3\n→ = (2x − 1)(x + 3)",
    fr: "Factorisation et Développement !\n\nIdentités remarquables :\n→ (a + b)² = a² + 2ab + b²\n→ (a − b)² = a² − 2ab + b²\n→ (a + b)(a − b) = a² − b²\n\nExemple : Factoriser x² − 9\n→ = x² − 3² = (x+3)(x−3)",
  },
  {
    keys: ["inequality", "inéquat", "inégalité", "interval", "sign"],
    en: "Inequalities!\n\nSolving: same as equations BUT flip the sign when multiplying/dividing by negative!\n\nExample: −2x + 3 > 7\nStep 1: −2x > 4\nStep 2: x < −2 (flip!)\n→ Solution: x ∈ (−∞, −2)\n\nSign table method for products:\n→ Study each factor's sign separately\n→ Multiply signs to get the product's sign",
    fr: "Inéquations !\n\nRésolution : comme les équations MAIS on inverse le signe quand on multiplie/divise par un négatif !\n\nExemple : −2x + 3 > 7\nÉtape 1: −2x > 4\nÉtape 2: x < −2 (inverser !)\n→ Solution : x ∈ (−∞, −2)",
  },
  {
    keys: ["function", "fonction", "graph", "domain", "range", "courbe", "domaine"],
    en: "Functions & Graphs!\n\n→ Domain: all valid input values\n→ Range: all possible output values\n→ f(x) = 0 gives x-intercepts\n→ f(0) gives the y-intercept\n\nStudying a function:\nStep 1: Find the domain\nStep 2: Calculate f'(x) for variations\nStep 3: Find critical points (f'(x) = 0)\nStep 4: Determine increasing/decreasing intervals\n\nExample: f(x) = x² − 4x + 3\n→ f'(x) = 2x − 4 = 0 → x = 2 (minimum)\n→ f(2) = −1",
    fr: "Fonctions et Courbes !\n\n→ Domaine : toutes les valeurs valides\n→ Image : toutes les sorties possibles\n→ f(x) = 0 donne les racines\n\nÉtude de fonction :\nÉtape 1: Domaine de définition\nÉtape 2: Calculer f'(x)\nÉtape 3: Points critiques\nÉtape 4: Croissance/décroissance\n\nExemple : f(x) = x² − 4x + 3\n→ f'(x) = 2x − 4 = 0 → x = 2 (minimum)\n→ f(2) = −1",
  },
  {
    keys: ["ratio", "proportion", "direct", "inverse", "proportionnel"],
    en: "Ratios & Proportions!\n\n→ Direct proportion: y = kx\n→ Inverse proportion: y = k/x\n\nExample: 3 workers paint in 6 hours. How long for 2?\n→ Inverse: 3 × 6 = 2 × t → t = 9 hours\n\nDividing in ratio: Share 15000 FCFA in 2:3\n→ First = (2/5) × 15000 = 6000 FCFA\n→ Second = (3/5) × 15000 = 9000 FCFA",
    fr: "Rapports et Proportions !\n\n→ Proportionnalité directe : y = kx\n→ Proportionnalité inverse : y = k/x\n\nExemple : 3 ouvriers peignent en 6h. Combien pour 2 ?\n→ Inverse : 3 × 6 = 2 × t → t = 9 heures\n\nPartager 15000 FCFA en ratio 2:3\n→ Premier = 6000 FCFA\n→ Deuxième = 9000 FCFA",
  },
  {
    keys: ["set", "ensemble", "union", "intersect", "venn", "subset"],
    en: "Set Theory!\n\n→ Union: A ∪ B (in A or B)\n→ Intersection: A ∩ B (in both)\n→ Complement: A' (not in A)\n\nn(A ∪ B) = n(A) + n(B) − n(A ∩ B)\n\nExample: A = {1,2,3,4}, B = {3,4,5,6}\n→ A ∪ B = {1,2,3,4,5,6}\n→ A ∩ B = {3,4}",
    fr: "Théorie des Ensembles !\n\n→ Union : A ∪ B\n→ Intersection : A ∩ B\n→ Complémentaire : A'\n\nn(A ∪ B) = n(A) + n(B) − n(A ∩ B)\n\nExemple : A = {1,2,3,4}, B = {3,4,5,6}\n→ A ∪ B = {1,2,3,4,5,6}\n→ A ∩ B = {3,4}",
  },
  {
    keys: ["hello", "hi", "bonjour", "salut", "hey", "help", "aide", "start"],
    en: "Hello! 👋 I'm Clair, your math tutor!\n\nI can help with:\n→ Algebra (equations, factoring, functions)\n→ Geometry (triangles, circles, areas & volumes)\n→ Calculus (limits, derivatives, integrals)\n→ Statistics & Probability\n→ Trigonometry\n→ Sequences, Vectors, Complex Numbers\n\nJust type your question or use voice! Try:\n→ \"How to solve quadratic equations?\"\n→ \"Explain trigonometry\"\n→ \"What is a derivative?\"",
    fr: "Bonjour ! 👋 Je suis Clair, votre tuteur en maths !\n\nJe peux aider avec :\n→ Algèbre (équations, factorisation, fonctions)\n→ Géométrie (triangles, cercles, aires & volumes)\n→ Analyse (limites, dérivées, intégrales)\n→ Statistiques & Probabilités\n→ Trigonométrie\n→ Suites, Vecteurs, Nombres Complexes\n\nTapez votre question ou utilisez la voix !",
  },
  {
    keys: ["thank", "merci", "thanks", "good", "great", "super", "bravo", "excellent", "perfect", "parfait", "bien"],
    en: "You're welcome! 😊 Keep practicing!\n\n→ The more you practice, the better you get!\n→ Don't hesitate to ask more questions\n\nWhat would you like to explore next?",
    fr: "De rien ! 😊 Continuez à pratiquer !\n\n→ Plus vous pratiquez, meilleur vous devenez !\n→ N'hésitez pas à poser d'autres questions\n\nQue voulez-vous explorer ensuite ?",
  },
];

function getSmartResponse(text: string, lang: "en" | "fr"): string {
  const lower = text.toLowerCase();

  for (const topic of TOPICS) {
    if (topic.keys.some((k) => lower.includes(k))) {
      return topic[lang];
    }
  }

  // Try to evaluate simple math expressions
  const exprMatch = text.match(/^[\d\s+\-*/().^]+$/);
  if (exprMatch) {
    try {
      const safe = text.replace(/\^/g, "**");
      const result = Function(`"use strict"; return (${safe})`)();
      if (typeof result === "number" && isFinite(result)) {
        return lang === "fr"
          ? `Le résultat de ${text} est :\n→ ${result}\n\nVoulez-vous que je vous explique les étapes ?`
          : `The result of ${text} is:\n→ ${result}\n\nWould you like me to explain the steps?`;
      }
    } catch {}
  }

  // Detect math-like input with numbers and operators
  if (/\d/.test(lower) && (lower.includes("+") || lower.includes("-") || lower.includes("×") || lower.includes("="))) {
    return lang === "fr"
      ? `Analysons ce problème ensemble !\n\nÉtape 1: Identifier les données : "${text.substring(0, 50)}"\nÉtape 2: Déterminer l'opération demandée\nÉtape 3: Appliquer la méthode appropriée\n→ Vérifier le résultat\n\nPrécisez le sujet (algèbre, géométrie, calcul) pour une aide plus détaillée !`
      : `Let's analyze this problem together!\n\nStep 1: Identify the given data: "${text.substring(0, 50)}"\nStep 2: Determine the required operation\nStep 3: Apply the appropriate method\n→ Verify the result\n\nSpecify the topic (algebra, geometry, calculus) for more detailed help!`;
  }

  return lang === "fr"
    ? `Bonne question ! Je suis prêt à vous aider avec "${text.substring(0, 40)}".\n\nPour mieux vous guider, essayez de préciser :\n→ Le sujet : algèbre, géométrie, analyse, statistiques ?\n→ Le niveau : BEPC, Probatoire, ou Baccalauréat ?\n→ Un exemple concret ou un exercice\n\nJe suis là pour expliquer pas à pas ! 📐`
    : `Good question! I'm ready to help with "${text.substring(0, 40)}".\n\nTo guide you better, try specifying:\n→ The topic: algebra, geometry, calculus, statistics?\n→ The level: BEPC, Probatoire, or Baccalauréat?\n→ A specific example or exercise\n\nI'm here to explain step by step! 📐`;
}

export default function TutorChat() {
  const { lang, tutorMsg, user, fr } = useApp();
  const [msgs, setMsgs] = useState<Message[]>([{
    id: 0, role: "tutor",
    text: fr
      ? `Bonjour ${user?.name?.split(" ")[0] || ""} ! 🎓 Je suis Clair, votre tuteur en mathématiques avec conversation vocale. Posez votre question par texte ou par voix !`
      : `Hello ${user?.name?.split(" ")[0] || ""}! 🎓 I'm Clair, your math tutor with voice-to-voice chat. Ask any question by text or voice!`,
  }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [rec, setRec] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [level, setLevel] = useState(user?.level?.toLowerCase().replace(" ", "") || "form5");
  const [topic, setTopic] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<any>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { if (tutorMsg) setInput(tutorMsg); }, [tutorMsg]);

  function speak(text: string) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    setSpeaking(true);
    const clean = text.replace(/→/g, "").replace(/[→∫∑√Δ]/g, "").replace(/\n+/g, ". ").substring(0, 600);
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = fr ? "fr-FR" : "en-GB";
    u.rate = 0.88;
    const voices = speechSynthesis.getVoices();
    const v = voices.find((v) =>
      fr ? v.lang.startsWith("fr") : v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Samantha"))
    );
    if (v) u.voice = v;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    speechSynthesis.speak(u);
  }

  function send(txt?: string) {
    const text = (txt || input).trim();
    if (!text || busy) return;
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";

    const id = Date.now();
    setMsgs((m) => [...m, { id, role: "user", text }, { id: id + 1, role: "tutor", text: "", loading: true }]);
    setBusy(true);

    // Simulate AI response with smart matching
    setTimeout(() => {
      const reply = getSmartResponse(text, lang);
      setMsgs((m) => m.filter((x) => !x.loading).concat({ id: id + 2, role: "tutor", text: reply }));
      setBusy(false);
      speak(reply); // Voice-to-voice: auto-speak response
    }, 1200);
  }

  function toggleMic() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert(fr ? "Utilisez Chrome pour la voix." : "Use Chrome for voice.");
      return;
    }
    if (rec) {
      recRef.current?.stop();
      setRec(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r = new SR();
    r.lang = fr ? "fr-FR" : "en-GB";
    r.interimResults = true;
    r.onresult = (e: any) => {
      let final = "", interim = "";
      for (let x = e.resultIndex; x < e.results.length; x++) {
        if (e.results[x].isFinal) final += e.results[x][0].transcript;
        else interim += e.results[x][0].transcript;
      }
      setInput(final || interim);
    };
    r.onend = () => {
      setRec(false);
      setInput((v) => {
        if (v.trim()) setTimeout(() => send(v), 50);
        return v;
      });
    };
    r.onerror = () => setRec(false);
    r.start();
    recRef.current = r;
    setRec(true);
  }

  const QUICK = fr
    ? ["Comment résoudre une équation du 2nd degré ?", "Théorème de Pythagore", "Qu'est-ce que la dérivée ?", "Exemple de probabilité"]
    : ["How do I solve quadratic equations?", "Explain the Pythagorean theorem", "What is differentiation?", "Show a probability example"];

  const status = busy ? (fr ? "⏳ Réfléchit…" : "⏳ Thinking…")
    : speaking ? (fr ? "🔊 Parle…" : "🔊 Speaking…")
    : (fr ? "En ligne • Voix-à-Voix" : "Online • Voice-to-Voice");

  return (
    <div className="absolute inset-0 flex gap-3 overflow-hidden p-3">
      {/* Chat panel */}
      <div className="flex-1 min-w-0 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-border">
          <div className="w-9 h-9 rounded-full flex-shrink-0 relative bg-gradient-to-br from-secondary to-emerald flex items-center justify-center text-base">
            🤖
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${busy ? "bg-primary" : "bg-emerald"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Clair — AI Math Tutor</p>
            <p className="text-[0.69rem] text-muted-foreground">{status}</p>
          </div>
          {speaking && (
            <button onClick={() => { speechSynthesis.cancel(); setSpeaking(false); }}
              className="px-3 py-1 rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bold cursor-pointer border-none">
              ⏹ Stop
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-3">
          {msgs.map((m) => {
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`msg-enter flex gap-2 ${isUser ? "self-end flex-row-reverse" : "self-start"}`} style={{ maxWidth: "88%" }}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                  isUser ? "bg-gradient-to-br from-primary to-destructive" : "bg-gradient-to-br from-secondary to-emerald"
                }`}>
                  {isUser ? "🧑" : "🤖"}
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className={`px-3.5 py-2.5 text-sm leading-relaxed min-w-0 break-words ${
                    isUser ? "rounded-[13px_4px_13px_13px] bg-secondary" : "rounded-[4px_13px_13px_13px] bg-muted"
                  }`}>
                    {m.loading ? (
                      <div className="flex gap-1">
                        {[1, 2, 3].map((d) => (
                          <span key={d} className={`w-2 h-2 rounded-full bg-muted-foreground inline-block dot-${d}`} />
                        ))}
                      </div>
                    ) : m.role === "tutor" ? formatMathText(m.text) : <p>{m.text}</p>}
                  </div>
                  {m.role === "tutor" && !m.loading && (
                    <button onClick={() => speak(m.text)}
                      className="self-start bg-transparent border border-border text-muted-foreground rounded-full px-2.5 py-0.5 text-[0.70rem] cursor-pointer hover:bg-muted transition-colors">
                      🔊 {fr ? "Écouter" : "Listen"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Voice indicator */}
        {rec && (
          <div className="flex items-center gap-2 px-3 py-1.5 mx-3 bg-destructive/10 border border-destructive/30 rounded-full text-xs text-destructive flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-destructive inline-block voice-blink" />
            {fr ? "J'écoute… parlez" : "Listening… speak now"}
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0 border-t border-border">
          <button onClick={toggleMic}
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-base cursor-pointer transition-all ${
              rec ? "border-2 border-destructive bg-destructive/10 text-destructive" : "border border-border bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>🎤</button>
          <textarea ref={taRef} value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px"; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={fr ? "Posez votre question…" : "Ask any math question…"}
            rows={1}
            className="flex-1 bg-muted border border-border rounded-xl py-2.5 px-3 text-foreground text-sm resize-none outline-none min-h-[38px] max-h-[110px] leading-relaxed focus:border-secondary/50 transition-colors" />
          <button onClick={() => send()} disabled={busy}
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-base border-none cursor-pointer transition-all ${
              busy ? "bg-muted-foreground/50 text-foreground cursor-not-allowed opacity-50" : "bg-secondary text-secondary-foreground hover:brightness-110"
            }`}>➤</button>
        </div>
      </div>

      {/* Side panel - hidden on mobile */}
      <div className="hidden lg:flex w-[280px] flex-shrink-0 flex-col gap-3 overflow-y-auto min-h-0">
        <div className="bg-card border border-border rounded-xl p-3.5 flex-shrink-0">
          <p className="font-display text-sm mb-2.5">📚 {fr ? "Sujet & Niveau" : "Topic & Level"}</p>
          <select value={topic} onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg py-2 px-2.5 text-foreground text-sm outline-none mb-2 font-body">
            <option value="">{fr ? "— Choisir un sujet —" : "— Choose a topic —"}</option>
            <optgroup label="Algebra"><option>Quadratic Equations</option><option>Simultaneous Equations</option><option>Functions & Graphs</option></optgroup>
            <optgroup label="Geometry"><option>Triangles & Pythagoras</option><option>Circle Theorems</option><option>Trigonometry</option></optgroup>
            <optgroup label="Calculus"><option>Differentiation</option><option>Integration</option></optgroup>
            <optgroup label="Statistics"><option>Probability</option><option>Data & Statistics</option></optgroup>
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg py-2 px-2.5 text-foreground text-sm outline-none font-body">
            <option value="form1">Form 1 / 6ème</option>
            <option value="form3">Form 3 / 4ème</option>
            <option value="form5">Form 5 / 3ème (BEPC)</option>
            <option value="probatoire">Probatoire / 1ère</option>
            <option value="terminale">Terminale / Upper Sixth (Bac)</option>
          </select>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex-shrink-0">
          <p className="font-display text-sm mb-2.5">💡 {fr ? "Questions rapides" : "Quick Starters"}</p>
          <div className="flex flex-col gap-1.5">
            {QUICK.map((q) => (
              <button key={q} onClick={() => send(q)}
                className="text-left bg-muted border border-border rounded-lg px-2.5 py-2 text-xs text-muted2 cursor-pointer w-full font-body transition-all hover:bg-secondary/10 hover:text-foreground">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
