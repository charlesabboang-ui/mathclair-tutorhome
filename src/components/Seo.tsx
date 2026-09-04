import { Helmet } from "react-helmet-async";

const SITE = "https://mathclair-tutorhome.lovable.app";
const BRAND = "MathClair";

type Lang = "en" | "fr";

export interface SeoContext {
  /** Topic / lesson / exercise subject, e.g. "Quadratic Equations" */
  subject?: string;
  /** Class or level, e.g. "Form 5", "Terminale C" */
  level?: string;
  /** Exam style, e.g. "BEPC", "Baccalauréat" */
  exam?: string;
}

/** Title + description templates per page, per language. */
const TEMPLATES: Record<
  string,
  Record<Lang, { title: (c: SeoContext) => string; description: (c: SeoContext) => string }>
> = {
  dashboard: {
    en: {
      title: () => `Study Dashboard | ${BRAND}`,
      description: () =>
        "Track your maths progress, streaks and study time. Personalised Cameroonian curriculum dashboard for BEPC, Probatoire and Baccalauréat.",
    },
    fr: {
      title: () => `Tableau de bord | ${BRAND}`,
      description: () =>
        "Suivez vos progrès en maths, vos séries et votre temps d'étude. Tableau de bord du programme camerounais : BEPC, Probatoire, Baccalauréat.",
    },
  },
  tutor: {
    en: {
      title: (c) =>
        c.subject
          ? `${c.subject} — Voice Maths Tutor | ${BRAND}`
          : `Voice Maths Tutor — Clair | ${BRAND}`,
      description: (c) =>
        `Ask Clair, your bilingual voice maths tutor${c.subject ? ` about ${c.subject}` : ""}. Step-by-step Socratic explanations, spoken answers and worked formulas.`,
    },
    fr: {
      title: (c) =>
        c.subject
          ? `${c.subject} — Tuteur vocal de maths | ${BRAND}`
          : `Tuteur vocal de maths — Clair | ${BRAND}`,
      description: (c) =>
        `Posez vos questions à Clair, tuteur vocal bilingue${c.subject ? ` sur ${c.subject}` : ""}. Explications socratiques pas à pas, réponses parlées et formules détaillées.`,
    },
  },
  topics: {
    en: {
      title: (c) => (c.subject ? `${c.subject} Lesson | ${BRAND}` : `Maths Lessons & Topics | ${BRAND}`),
      description: (c) =>
        c.subject
          ? `Learn ${c.subject} step by step${c.level ? ` for ${c.level}` : ""}: definitions, worked examples and practice guided by an AI tutor.`
          : "Browse maths lessons for Junior, Senior and A-Level: algebra, geometry, calculus, probability and more, with guided AI explanations.",
    },
    fr: {
      title: (c) => (c.subject ? `Leçon : ${c.subject} | ${BRAND}` : `Leçons et thèmes de maths | ${BRAND}`),
      description: (c) =>
        c.subject
          ? `Apprenez ${c.subject} pas à pas${c.level ? ` pour ${c.level}` : ""} : définitions, exemples corrigés et exercices guidés par l'IA.`
          : "Parcourez les leçons de maths du premier cycle au niveau A : algèbre, géométrie, analyse, probabilités, avec explications guidées par l'IA.",
    },
  },
  practice: {
    en: {
      title: (c) =>
        `${c.subject ? `${c.subject} Exercises` : "Maths Practice Exercises"}${c.level ? ` — ${c.level}` : ""} | ${BRAND}`,
      description: (c) =>
        `Practise ${c.subject ? c.subject.toLowerCase() : "maths"} with unique AI-generated exercises${c.level ? ` for ${c.level}` : ""}${c.exam ? ` in ${c.exam} style` : ""}, instant marking and full step-by-step solutions.`,
    },
    fr: {
      title: (c) =>
        `${c.subject ? `Exercices : ${c.subject}` : "Exercices de maths"}${c.level ? ` — ${c.level}` : ""} | ${BRAND}`,
      description: (c) =>
        `Entraînez-vous${c.subject ? ` sur ${c.subject.toLowerCase()}` : " en maths"} avec des exercices générés par l'IA${c.level ? ` pour ${c.level}` : ""}${c.exam ? ` de type ${c.exam}` : ""}, correction immédiate et solutions détaillées.`,
    },
  },
  exams: {
    en: {
      title: () => `BEPC, Probatoire & Baccalauréat Maths Prep | ${BRAND}`,
      description: () =>
        "Prepare for Cameroonian maths exams — BEPC, GCE O/A-Level, Probatoire, Baccalauréat and Concours — with 3,000+ exercises and timed mocks.",
    },
    fr: {
      title: () => `Préparation maths BEPC, Probatoire, Baccalauréat | ${BRAND}`,
      description: () =>
        "Préparez les examens camerounais de maths — BEPC, GCE, Probatoire, Baccalauréat et Concours — avec 3 000+ exercices et examens blancs chronométrés.",
    },
  },
  whiteboard: {
    en: {
      title: () => `Maths Whiteboard, Graphs & Geometry | ${BRAND}`,
      description: () =>
        "Draw geometry figures and plot graphs with an interactive whiteboard and GeoGebra tools, then ask the AI tutor to explain your sketch.",
    },
    fr: {
      title: () => `Tableau blanc, graphiques et géométrie | ${BRAND}`,
      description: () =>
        "Tracez des figures géométriques et des courbes avec le tableau interactif et GeoGebra, puis demandez à l'IA d'expliquer votre schéma.",
    },
  },
  olympiade: {
    en: {
      title: () => `Olympiade Maths Plan | ${BRAND}`,
      description: () =>
        "Advanced olympiad-level maths training: hard problems, proof techniques and one-to-one AI coaching for competitive Cameroonian students.",
    },
    fr: {
      title: () => `Plan Olympiade Maths | ${BRAND}`,
      description: () =>
        "Entraînement de niveau olympiade : problèmes difficiles, techniques de démonstration et coaching IA pour les élèves compétiteurs.",
    },
  },
  parent: {
    en: {
      title: () => `Parental Control & Progress Reports | ${BRAND}`,
      description: () =>
        "Follow your child's maths progress, study time and weak areas, and receive WhatsApp progress reports.",
    },
    fr: {
      title: () => `Contrôle parental et rapports | ${BRAND}`,
      description: () =>
        "Suivez les progrès en maths de votre enfant, son temps d'étude et ses lacunes, et recevez des rapports par WhatsApp.",
    },
  },
};

const PATHS: Record<string, string> = {
  dashboard: "/",
  tutor: "/tutor",
  topics: "/topics",
  practice: "/practice",
  exams: "/exams",
  whiteboard: "/whiteboard",
  olympiade: "/olympiade",
  parent: "/parent",
};

/** HowTo structured data for lesson/exercise pages. */
function howTo(page: string, lang: Lang, c: SeoContext) {
  if (page !== "topics" && page !== "practice") return null;
  const fr = lang === "fr";
  const subject = c.subject || (fr ? "un problème de maths" : "a maths problem");
  const steps = fr
    ? [
        { name: "Lire et traduire l'énoncé", text: `Identifiez les données, l'inconnue et la question posée dans l'exercice sur ${subject}.` },
        { name: "Choisir la méthode", text: `Sélectionnez la propriété ou la formule adaptée à ${subject}.` },
        { name: "Calculer étape par étape", text: "Effectuez les calculs en justifiant chaque ligne, sans sauter d'étape." },
        { name: "Vérifier la réponse", text: "Contrôlez le résultat (ordre de grandeur, substitution) puis rédigez la conclusion." },
      ]
    : [
        { name: "Read and translate the question", text: `Identify the given data, the unknown and what is asked in the ${subject} exercise.` },
        { name: "Choose the method", text: `Select the property or formula that fits ${subject}.` },
        { name: "Work through it step by step", text: "Carry out the computation, justifying every line without skipping steps." },
        { name: "Check the answer", text: "Verify the result by substitution or estimation, then write the conclusion." },
      ];

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: fr ? `Comment résoudre un exercice sur ${subject}` : `How to solve a ${subject} exercise`,
    inLanguage: fr ? "fr" : "en",
    ...(c.level ? { educationalLevel: c.level } : {}),
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/** FAQPage structured data answering the common questions on each page. */
function faq(page: string, lang: Lang, c: SeoContext) {
  const fr = lang === "fr";
  const subject = c.subject;
  const sets: Record<string, { q: string; a: string }[]> = {
    topics: fr
      ? [
          { q: `Comment réviser ${subject || "un thème de maths"} efficacement ?`, a: "Commencez par la définition et une propriété clé, faites deux exemples corrigés, puis enchaînez avec des exercices générés jusqu'à réussir sans aide." },
          { q: "Les leçons suivent-elles le programme camerounais ?", a: "Oui : les thèmes couvrent le programme anglophone et francophone, du premier cycle au niveau Terminale / A-Level." },
        ]
      : [
          { q: `How do I revise ${subject || "a maths topic"} effectively?`, a: "Start with the definition and one key property, work two solved examples, then keep generating exercises until you can finish them unaided." },
          { q: "Do the lessons follow the Cameroonian syllabus?", a: "Yes — topics cover both the Anglophone and Francophone syllabus, from Junior Secondary to Terminale / A-Level." },
        ],
    practice: fr
      ? [
          { q: "Les exercices sont-ils toujours les mêmes ?", a: "Non. Chaque exercice est généré à la demande selon votre classe, votre thème et la difficulté choisie, donc les questions ne se répètent pas." },
          { q: "Puis-je m'entraîner au format d'examen ?", a: "Oui : choisissez un style d'examen (BEPC, Probatoire, Baccalauréat, GCE O-Level ou A-Level) avant de générer la question." },
          { q: "Comment obtenir l'explication détaillée ?", a: "Après avoir répondu, la correction pas à pas s'affiche ; cliquez sur « Demander à Clair » pour une explication vocale socratique." },
        ]
      : [
          { q: "Are the exercises always the same?", a: "No. Every exercise is generated on demand from your class, topic and chosen difficulty, so questions do not repeat." },
          { q: "Can I practise in exam format?", a: "Yes — pick an exam style (BEPC, Probatoire, Baccalauréat, GCE O-Level or A-Level) before generating the question." },
          { q: "How do I get a full explanation?", a: "After answering, the step-by-step solution appears; tap “Ask Clair” for a spoken Socratic walkthrough." },
        ],
    tutor: fr
      ? [
          { q: "Le tuteur répond-il à la voix ?", a: "Oui : parlez au micro et Clair répond à voix haute en français ou en anglais camerounais, avec les formules affichées." },
          { q: "Puis-je envoyer la photo d'un exercice ?", a: "Oui : téléversez une photo de l'énoncé et Clair l'analyse pour vous guider étape par étape." },
        ]
      : [
          { q: "Does the tutor answer by voice?", a: "Yes — speak into the microphone and Clair replies out loud in Cameroonian English or French, with the formulas rendered on screen." },
          { q: "Can I send a photo of an exercise?", a: "Yes — upload a photo of the question and Clair reads it, then guides you step by step." },
        ],
    exams: fr
      ? [
          { q: "Quels examens sont couverts ?", a: "BEPC, Probatoire, Baccalauréat (A, C, D, E), GCE O-Level et A-Level, ainsi que les concours ENS, ENSET et Polytechnique." },
          { q: "Combien d'exercices sont disponibles ?", a: "Plus de 3 000 exercices, complétés par des questions générées à la demande et des examens blancs chronométrés de 3 heures." },
        ]
      : [
          { q: "Which exams are covered?", a: "BEPC, Probatoire, Baccalauréat (series A, C, D, E), GCE O-Level and A-Level, plus ENS, ENSET and Polytechnique entrance exams." },
          { q: "How many exercises are available?", a: "Over 3,000 exercises, plus on-demand generated questions and 3-hour timed mock papers." },
        ],
  };

  const items = sets[page];
  if (!items) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: fr ? "fr" : "en",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export default function Seo({
  page,
  lang,
  context = {},
}: {
  page: string;
  lang: Lang;
  context?: SeoContext;
}) {
  const tpl = (TEMPLATES[page] || TEMPLATES.dashboard)[lang];
  const title = tpl.title(context).slice(0, 70);
  const description = tpl.description(context).slice(0, 160);
  const url = `${SITE}${PATHS[page] || "/"}`;
  const ld = [howTo(page, lang, context), faq(page, lang, context)].filter(Boolean);

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ld.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}
