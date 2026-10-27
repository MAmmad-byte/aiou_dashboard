// Human-readable labels for every raw field in OAS_Applicant_STATS — used
// across KPI cards, chart legends/axes, and tooltips so nothing on the
// dashboard shows a raw SCREAMING_SNAKE_CASE column name.

export const FIELD_LABELS = {
  semester: "Semester",
  program: "Program",
  country: "Country",
  province: "Region",
  district: "District",
  tehsil: "Tehsil",
  verified: "Verified",
  not_submitted: "Not Submitted",
  objection: "Under Objection",
  submitted: "Submitted",
  male_count: "Male",
  female_count: "Female",
  transgender_count: "Transgender",
  count_under_18: "Under 18",
  count_18_30: "18–30",
  count_30_40: "30–40",
  count_40_50: "40–50",
  count_above_50: "Above 50",
  fee_verified_count: "Fee Verified",
  total_applicants: "Total Applicants",
} as const;

// One-line description of what each status/metric actually means, shown as
// chart subtitles or tooltip footers so "Objection" etc. aren't left to be
// guessed at.
export const FIELD_DESCRIPTIONS: Record<string, string> = {
  verified: "Application reviewed and confirmed",
  not_submitted: "Started but never submitted",
  objection: "Submitted, but flagged with an objection to resolve",
  submitted: "Submitted and awaiting review",
  fee_verified_count: "Admission fee payment confirmed",
};

export const STATUS_COLORS: Record<string, string> = {
  Verified: "#12B76A",
  Submitted: "#465FFF",
  "Not Submitted": "#98A2B3",
  "Under Objection": "#F79009",
};

export const GENDER_COLORS: Record<string, string> = {
  Male: "#465FFF",
  Female: "#EC4899",
  Transgender: "#F79009",
};

export const AGE_BAND_ORDER = ["Under 18", "18–30", "30–40", "40–50", "Above 50"];
