import lmsDummyData from "@/data/lms-dummy-data.json";
import { LmsStat, LmsFilterOptions, LmsKpis } from "@/types/lms";

/**
 * Loads the dummy LMS dataset (parsed from your CSV template). Swap this out
 * for a real query once the table is populated, e.g.:
 *   const rows = await ftsDb.lms_stats.findMany();
 */
export function getAllLmsData(): LmsStat[] {
  return lmsDummyData as LmsStat[];
}

export interface LmsFilterParams {
  country?: string;
  semester?: string;
  program?: string;
  region?: string;
}

export function filterLmsData(data: LmsStat[], filters: LmsFilterParams): LmsStat[] {
  return data.filter(
    (row) =>
      (!filters.country || row.country === filters.country) &&
      (!filters.semester || row.semester === filters.semester) &&
      (!filters.program || row.program === filters.program) &&
      (!filters.region || row.region === filters.region)
  );
}

// Filter dropdown options are always built from the full dataset (not the
// filtered subset) so the dropdowns never shrink out from under the user.
export function getFilterOptions(data: LmsStat[]): LmsFilterOptions {
  const uniq = (key: keyof LmsStat) =>
    Array.from(new Set(data.map((d) => String(d[key])))).sort();

  return {
    countries: uniq("country"),
    semesters: uniq("semester"),
    programs: uniq("program"),
    regions: uniq("region"),
  };
}

/** The country dropdown defaults to Pakistan rather than "All" — falls back
 * to "All" only if Pakistan isn't actually present in the dataset. */
export const DEFAULT_COUNTRY = "Pakistan";

export function resolveDefaultCountry(options: LmsFilterOptions): string {
  return options.countries.includes(DEFAULT_COUNTRY) ? DEFAULT_COUNTRY : "All";
}

export function computeKpis(rows: LmsStat[]): LmsKpis {
  return {
    totalStudents: rows.reduce((s, r) => s + r.total_no_of_students, 0),
    totalEnrollment: rows.reduce((s, r) => s + r.total_enrollment, 0),
    assignmentsSubmitted: rows.reduce((s, r) => s + r.no_of_assignments_submitted, 0),
    totalWorkshops: rows.reduce((s, r) => s + r.total_workshops, 0),
    quizConducted: rows.reduce((s, r) => s + r.total_quiz_conducted, 0),
    quizAttempted: rows.reduce((s, r) => s + r.total_quiz_attempt, 0),
    totalCourses: rows.reduce((s, r) => s + r.total_courses, 0),
    workshopBatches: rows.reduce((s, r) => s + r.total_workshop_batches, 0),
  };
}

type GroupKey = "program" | "region" | "country" | "semester";
type NumericKey =
  | "total_no_of_students"
  | "total_enrollment"
  | "no_of_assignments_submitted"
  | "total_workshops"
  | "total_quiz_conducted"
  | "total_quiz_attempt"
  | "total_courses"
  | "total_workshop_batches";

function groupSum(rows: LmsStat[], key: GroupKey, valueKey: NumericKey): [string, number][] {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const k = r[key];
    map.set(k, (map.get(k) ?? 0) + r[valueKey]);
  });
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

export function byProgramStudents(rows: LmsStat[]) {
  return groupSum(rows, "program", "total_no_of_students");
}
export function byRegionStudents(rows: LmsStat[]) {
  return groupSum(rows, "region", "total_no_of_students");
}
export function byProgramCourses(rows: LmsStat[]) {
  return groupSum(rows, "program", "total_courses");
}
export function byCountryEnrollment(rows: LmsStat[]) {
  return groupSum(rows, "country", "total_enrollment");
}

/** Weighted per-student average of a numeric field, grouped by program —
 * e.g. average quiz attempts or assignments submitted per student, which is
 * a more honest comparison across programs than the raw totals. */
export function avgPerStudentByProgram(rows: LmsStat[], valueKey: NumericKey): [string, number][] {
  const totals = new Map<string, number>();
  const students = new Map<string, number>();
  rows.forEach((r) => {
    totals.set(r.program, (totals.get(r.program) ?? 0) + r[valueKey]);
    students.set(r.program, (students.get(r.program) ?? 0) + r.total_no_of_students);
  });
  return Array.from(totals.entries())
    .map(([p, total]) => [p, Number((total / (students.get(p) || 1)).toFixed(1))] as [string, number])
    .sort((a, b) => b[1] - a[1]);
}

export interface SemesterTrendPoint {
  semester: string;
  students: number;
  enrollment: number;
  assignments: number;
  quizAttempted: number;
  workshops: number;
  workshopBatches: number;
}

export function bySemester(rows: LmsStat[]): SemesterTrendPoint[] {
  const semesters = Array.from(new Set(rows.map((r) => r.semester))).sort();
  return semesters.map((semester) => {
    const subset = rows.filter((r) => r.semester === semester);
    return {
      semester,
      students: subset.reduce((s, r) => s + r.total_no_of_students, 0),
      enrollment: subset.reduce((s, r) => s + r.total_enrollment, 0),
      assignments: subset.reduce((s, r) => s + r.no_of_assignments_submitted, 0),
      quizAttempted: subset.reduce((s, r) => s + r.total_quiz_attempt, 0),
      workshops: subset.reduce((s, r) => s + r.total_workshops, 0),
      workshopBatches: subset.reduce((s, r) => s + r.total_workshop_batches, 0),
    };
  });
}
