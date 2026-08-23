export type DemoApplicationQuestion = {
  id: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
};

export type DemoApplicationForm = {
  slug: string;
  title: string;
  projectTitle: string;
  introduction: string;
  estimatedMinutes: number;
  questions: DemoApplicationQuestion[];
};

export const demoApplicationForms: DemoApplicationForm[] = [
  {
    slug: "edge-ai-readiness",
    title: "Edge AI project readiness questionnaire",
    projectTitle: "Edge AI for Electric-Vehicle Battery Health",
    introduction: "A short staging questionnaire covering time-series work, embedded systems and responsible validation.",
    estimatedMinutes: 6,
    questions: [
      { id: "experience", label: "Describe one relevant project, course or experiment.", type: "textarea", placeholder: "State your role, method and result." },
      { id: "track", label: "Which workstream interests you most?", type: "select", options: ["Signal processing", "Machine learning", "Embedded deployment", "Experimental validation"] },
      { id: "baseline", label: "What would you verify before trusting a battery-health model?", type: "textarea", placeholder: "Mention evidence, uncertainty or failure cases." },
    ],
  },
  {
    slug: "geospatial-validation",
    title: "Geospatial validation questionnaire",
    projectTitle: "InSAR-Assisted Landslide Early-Warning Prototype",
    introduction: "A staging form for applicants interested in GIS, uncertainty and field-facing engineering evidence.",
    estimatedMinutes: 7,
    questions: [
      { id: "tools", label: "Which GIS or geospatial tools have you used?", type: "text", placeholder: "For example: QGIS, GeoPandas, SNAP or Earth Engine" },
      { id: "role", label: "Choose your preferred contribution.", type: "select", options: ["Data preparation", "Risk modelling", "Map interface", "Field validation"] },
      { id: "limits", label: "How would you communicate an uncertain risk score to an engineer?", type: "textarea", placeholder: "Explain the decision context and limitations." },
    ],
  },
  {
    slug: "research-software-practice",
    title: "Research software and provenance questionnaire",
    projectTitle: "Knowledge Graph for Indian Scientific Literature",
    introduction: "A staging form about reproducibility, bilingual retrieval and evidence-backed software work.",
    estimatedMinutes: 6,
    questions: [
      { id: "portfolio", label: "Share a relevant repository or describe a software project.", type: "textarea", placeholder: "You may enter NA and describe coursework instead." },
      { id: "focus", label: "Select a preferred research area.", type: "select", options: ["NLP extraction", "Knowledge graphs", "Information retrieval", "Evaluation and provenance"] },
      { id: "reproducibility", label: "Name two steps that make a research pipeline reproducible.", type: "textarea", placeholder: "Think about data, code, environments or evaluation." },
    ],
  },
  {
    slug: "accessible-speech-research",
    title: "Accessible speech research questionnaire",
    projectTitle: "Hindi-English Speech Interface for Accessible Campus Services",
    introduction: "A staging questionnaire covering accessibility, bilingual interaction and responsible user research.",
    estimatedMinutes: 7,
    questions: [
      { id: "motivation", label: "Why are you interested in accessible campus interfaces?", type: "textarea", placeholder: "Connect your answer to a user need or prior experience." },
      { id: "track", label: "Select the workstream you prefer.", type: "select", options: ["Speech/NLP", "Accessible frontend", "User research", "Evaluation"] },
      { id: "fallback", label: "What fallback should be available when speech recognition fails?", type: "textarea", placeholder: "Describe an inclusive alternative interaction." },
    ],
  },
];

export function getDemoApplicationForm(slug: string) {
  return demoApplicationForms.find((form) => form.slug === slug);
}

export function isApplicationFormReference(value: string) {
  if (value === "NA") return true;
  if (demoApplicationForms.some((form) => value === `/demo-forms/${form.slug}`)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "forms.gle" || (url.hostname === "docs.google.com" && url.pathname.startsWith("/forms/")));
  } catch {
    return false;
  }
}

export function isQuestionnaireResponseReference(value: string) {
  const demoMatch = value.match(/^\/demo-forms\/([a-z0-9-]+)(?:\?[a-zA-Z0-9&=_-]+)?$/);
  if (demoMatch && demoApplicationForms.some((form) => form.slug === demoMatch[1])) return true;
  return value !== "NA" && isApplicationFormReference(value);
}
