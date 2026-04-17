export type AnswerType = "text" | "textarea" | "yesno" | "dropdown"

export interface FieldConfig {
  enabled: boolean
  required: boolean
}

export interface CustomQuestion {
  id: string
  question: string
  answerType: AnswerType
  options?: string[] // only for answerType === "dropdown"
  required: boolean
}

export interface FormConfig {
  fields: Record<string, FieldConfig>
  customQuestions: CustomQuestion[]
}

export interface FieldDef {
  key: string
  label: string
  section: string
  alwaysOn?: boolean
  hint?: string
}

export const FORM_SECTIONS = [
  "About you",
  "Your lifestyle",
  "Other animals",
  "About this adoption",
  "Vet reference",
] as const

export const FIELD_DEFS: FieldDef[] = [
  // About you
  { key: "applicantName",    label: "Full name",                          section: "About you", alwaysOn: true },
  { key: "applicantEmail",   label: "Email address",                      section: "About you", alwaysOn: true },
  { key: "applicantPhone",   label: "Phone number",                       section: "About you" },
  { key: "applicantAddress", label: "Full address",                       section: "About you" },
  { key: "householdType",    label: "Type of accommodation",              section: "About you" },
  { key: "rentOrOwn",        label: "Do you own or rent?",                section: "About you" },
  { key: "landlordPermission", label: "Landlord permission (if renting)", section: "About you", hint: "Shown when applicant selects 'Renting'" },
  { key: "hasGarden",        label: "Do you have a garden?",              section: "About you" },
  { key: "gardenFencedType", label: "Is the garden fenced?",              section: "About you", hint: "Shown when applicant answers Yes to garden" },
  { key: "numberOfAdults",   label: "Number of adults in household",      section: "About you" },
  { key: "hasChildren",      label: "Children in household & their ages", section: "About you" },
  // Your lifestyle
  { key: "hoursAwayPerDay",       label: "Hours away from home per day",      section: "Your lifestyle" },
  { key: "activityLevel",         label: "How active is your lifestyle?",      section: "Your lifestyle" },
  { key: "experienceLevel",       label: "Previous experience with pets",      section: "Your lifestyle" },
  { key: "previousPets",          label: "What pets have you had?",            section: "Your lifestyle", hint: "Shown for previous/current owners" },
  { key: "petExperienceHistory",  label: "What happened to your previous pets?", section: "Your lifestyle", hint: "Shown for previous/current owners" },
  // Other animals
  { key: "hasOtherPets",               label: "Do you currently have other pets?",       section: "Other animals" },
  { key: "currentPetsLivedWithOthers", label: "Have your current pets lived with others?", section: "Other animals", hint: "Shown when applicant has other pets" },
  // About this adoption
  { key: "whyAdopt",            label: "Why do you want to adopt this animal?",           section: "About this adoption", alwaysOn: true },
  { key: "animalSleepLocation", label: "Where will the animal sleep?",                    section: "About this adoption" },
  { key: "animalTimeLocation",  label: "Where will the animal spend most of their time?", section: "About this adoption" },
  { key: "primaryCarer",        label: "Who will be the primary carer?",                  section: "About this adoption" },
  { key: "behaviouralIssuesPlan", label: "Plan for behavioural issues",                   section: "About this adoption" },
  { key: "cannotKeepPlan",      label: "Plan if you can no longer keep the animal",       section: "About this adoption" },
  // Vet reference
  { key: "hasVet",    label: "Do you currently use a vet?",              section: "Vet reference" },
  { key: "vetDetails", label: "Vet name, practice & phone",              section: "Vet reference", hint: "Shown when applicant answers Yes" },
]

export const DEFAULT_FIELD_CONFIG: Record<string, FieldConfig> = {
  applicantPhone:              { enabled: true, required: true },
  applicantAddress:            { enabled: true, required: false },
  householdType:               { enabled: true, required: false },
  rentOrOwn:                   { enabled: true, required: false },
  landlordPermission:          { enabled: true, required: false },
  hasGarden:                   { enabled: true, required: false },
  gardenFencedType:            { enabled: true, required: false },
  numberOfAdults:              { enabled: true, required: false },
  hasChildren:                 { enabled: true, required: false },
  hoursAwayPerDay:             { enabled: true, required: false },
  activityLevel:               { enabled: true, required: false },
  experienceLevel:             { enabled: true, required: false },
  previousPets:                { enabled: true, required: false },
  petExperienceHistory:        { enabled: true, required: false },
  hasOtherPets:                { enabled: true, required: false },
  currentPetsLivedWithOthers:  { enabled: true, required: false },
  animalSleepLocation:         { enabled: true, required: false },
  animalTimeLocation:          { enabled: true, required: false },
  primaryCarer:                { enabled: true, required: false },
  behaviouralIssuesPlan:       { enabled: true, required: false },
  cannotKeepPlan:              { enabled: true, required: false },
  hasVet:                      { enabled: true, required: false },
  vetDetails:                  { enabled: true, required: false },
}

export const DEFAULT_FORM_CONFIG: FormConfig = {
  fields: DEFAULT_FIELD_CONFIG,
  customQuestions: [],
}

export function mergeWithDefaults(saved: Partial<FormConfig> | null): FormConfig {
  if (!saved) return DEFAULT_FORM_CONFIG
  return {
    fields: { ...DEFAULT_FIELD_CONFIG, ...(saved.fields ?? {}) },
    customQuestions: saved.customQuestions ?? [],
  }
}

export function fieldEnabled(config: FormConfig, key: string): boolean {
  const def = FIELD_DEFS.find(f => f.key === key)
  if (def?.alwaysOn) return true
  return config.fields[key]?.enabled ?? DEFAULT_FIELD_CONFIG[key]?.enabled ?? true
}

export function fieldRequired(config: FormConfig, key: string): boolean {
  const def = FIELD_DEFS.find(f => f.key === key)
  if (def?.alwaysOn) return true
  return config.fields[key]?.required ?? DEFAULT_FIELD_CONFIG[key]?.required ?? false
}
