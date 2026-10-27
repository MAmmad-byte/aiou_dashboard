// One row = one Semester x Program x Country x Province x District x Tehsil
// cohort from the raw OAS applicant export. "Region" in filter/UI language
// below is always `province` — Pakistan's provinces for domestic
// applicants, and the nearest equivalent (state/region/emirate/etc.) for
// the many overseas students in this dataset.

export interface OasApplicantFilterOptions {
  semesters: string[];
  regions: string[]; // provinces
  programs: string[];
}

export interface OasApplicantFilterValues {
  semester: string;
  region: string;
  program: string;
}

export interface OasApplicantKpis {
  totalApplicants: number;
  verified: number;
  submitted: number;
  notSubmitted: number;
  objection: number;
  feeVerified: number;
  male: number;
  female: number;
  transgender: number;
  verificationRate: number; // verified / totalApplicants * 100
  submissionRate: number; // (submitted + verified) / totalApplicants * 100
  regionCount: number;
  programCount: number;
}

export interface SemesterTrendPoint {
  semester: string;
  verified: number;
  submitted: number;
  notSubmitted: number;
  objection: number;
  totalApplicants: number;
}

export interface AgeBandPoint {
  band: string;
  count: number;
}
