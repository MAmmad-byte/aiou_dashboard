import oasDummyData from "@/data/oas-dummy-data.json";
import { OasStat, OasFilterOptions, OasKpis } from "@/types/oas";

/**
 * Loads the dummy OAS dataset (parsed from your CSV template). Swap this out
 * for a real query once the table is populated, e.g.:
 *   const rows = await ftsDb.oas_admissions.findMany();
 */
export function getAllOasData(): OasStat[] {
  return oasDummyData as OasStat[];
}

export interface OasFilterParams {
  country?: string;
  semester?: string;
  province?: string;
  region?: string;
  program?: string;
  ageBand?: string;
}

export function filterOasData(data: OasStat[], filters: OasFilterParams): OasStat[] {
  return data.filter(
    (row) =>
      (!filters.country || row.country === filters.country) &&
      (!filters.semester || row.semester === filters.semester) &&
      (!filters.province || row.province === filters.province) &&
      (!filters.region || row.region === filters.region) &&
      (!filters.program || row.program === filters.program) &&
      (!filters.ageBand || row.age_band === filters.ageBand)
  );
}

// Filter dropdown options are always built from the full dataset (not the
// filtered subset) so the dropdowns never shrink out from under the user.
export function getFilterOptions(data: OasStat[]): OasFilterOptions {
  const uniq = (key: keyof OasStat) =>
    Array.from(new Set(data.map((d) => String(d[key])))).sort();

  return {
    countries: uniq("country"),
    semesters: uniq("semester"),
    provinces: uniq("province"),
    regions: uniq("region"),
    programs: uniq("program"),
    ageBands: uniq("age_band"),
  };
}

/** The country dropdown defaults to Pakistan rather than "All" — falls back
 * to "All" only if Pakistan isn't actually present in the dataset. */
export const DEFAULT_COUNTRY = "Pakistan";

export function resolveDefaultCountry(options: OasFilterOptions): string {
  return options.countries.includes(DEFAULT_COUNTRY) ? DEFAULT_COUNTRY : "All";
}

export function computeKpis(rows: OasStat[]): OasKpis {
  const totalApplications = rows.reduce((s, r) => s + r.total_applications_received, 0);
  const totalEnrolled = rows.reduce((s, r) => s + r.total_enrolled, 0);
  const male = rows.reduce((s, r) => s + r.male_enrolled, 0);
  const female = rows.reduce((s, r) => s + r.female_enrolled, 0);
  const programs = new Set(rows.map((r) => r.program)).size;
  const enrollmentRate = totalApplications ? (totalEnrolled / totalApplications) * 100 : 0;

  return { totalApplications, totalEnrolled, male, female, programs, enrollmentRate };
}

function groupSum(
  rows: OasStat[],
  key: "program" | "province" | "region" | "age_band",
  valueKey: "total_applications_received" | "total_enrolled"
): [string, number][] {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const k = r[key];
    map.set(k, (map.get(k) ?? 0) + r[valueKey]);
  });
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

export function byProgram(rows: OasStat[]) {
  return groupSum(rows, "program", "total_applications_received");
}

export function byProvince(rows: OasStat[]) {
  return groupSum(rows, "province", "total_enrolled");
}

export function byRegion(rows: OasStat[]) {
  return groupSum(rows, "region", "total_enrolled");
}

export function byAgeBand(rows: OasStat[]): [string, number][] {
  const order = ["Below 20", "20-30", "Above 30"];
  const grouped = new Map(groupSum(rows, "age_band", "total_enrolled"));
  return order.filter((band) => grouped.has(band)).map((band) => [band, grouped.get(band)!]);
}

export interface SemesterTrendPoint {
  semester: string;
  applications: number;
  enrolled: number;
}

export function bySemester(rows: OasStat[]): SemesterTrendPoint[] {
  const semesters = Array.from(new Set(rows.map((r) => r.semester))).sort();
  return semesters.map((semester) => {
    const subset = rows.filter((r) => r.semester === semester);
    return {
      semester,
      applications: subset.reduce((s, r) => s + r.total_applications_received, 0),
      enrolled: subset.reduce((s, r) => s + r.total_enrolled, 0),
    };
  });
}
