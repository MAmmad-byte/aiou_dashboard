// One row = one Semester x Province x Region x Program x Age Band cohort,
// matching the AIOU_Full_Breakdown CSV template (grand-total rollup rows
// from the CSV — "ALL PROVINCES" / "ALL REGIONS" / "TOTAL (All Programs)" /
// "ALL AGES" — are excluded from the dummy data since the dashboard derives
// the same totals itself by summing the detail rows).

export interface OasStat {
  id: number;
  semester: string;
  country: string;
  province: string;
  region: string;
  program: string;
  age_band: string;
  total_applications_received: number;
  male_enrolled: number;
  female_enrolled: number;
  total_enrolled: number;
}

export interface OasFilterValues {
  country: string;
  semester: string;
  province: string;
  region: string;
  program: string;
  ageBand: string;
}

export interface OasFilterOptions {
  countries: string[];
  semesters: string[];
  provinces: string[];
  regions: string[];
  programs: string[];
  ageBands: string[];
}

export interface OasKpis {
  totalApplications: number;
  totalEnrolled: number;
  male: number;
  female: number;
  programs: number;
  enrollmentRate: number;
}
