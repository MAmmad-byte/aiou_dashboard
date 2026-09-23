import { Prisma } from "@/generated/fts-client";
import { ftsDb } from "@/lib/prisma";
import {
  AdmissionsStat,
  AdmissionsFilterOptions,
  AdmissionsKpis,
  SemesterTrendPoint,
  CareerFreshContinuingPoint,
  RegionFreshContinuingPoint,
} from "@/types/admissions";

// Re-exported so callers can `import { SemesterTrendPoint, ... } from
// "@/lib/admissions-data"` — matches how AdmissionsCharts.tsx actually
// imports these (same fix as lib/tms-data.ts / lib/erp-data.ts needed).
export type { SemesterTrendPoint, CareerFreshContinuingPoint, RegionFreshContinuingPoint };

export interface AdmissionsFilterParams {
  semester?: string;
  mode?: string;
  acadCareer?: string;
  campus?: string;
}

export function buildWhere(filters: AdmissionsFilterParams): Prisma.Admissions_STATSWhereInput {
  const where: Prisma.Admissions_STATSWhereInput = {};
  if (filters.semester) where.semester = filters.semester;
  if (filters.mode) where.mode = filters.mode;
  if (filters.acadCareer) where.acad_career = filters.acadCareer;
  if (filters.campus) where.campus = filters.campus;
  return where;
}

export async function getFilteredRows(where: Prisma.Admissions_STATSWhereInput): Promise<AdmissionsStat[]> {
  const rows = await ftsDb.admissions_STATS.findMany({ where, orderBy: { id: "asc" } });
  return rows
    .filter((r) => r.semester && r.acad_career && r.campus)
    .map((r) => ({
      id: r.id,
      semester: r.semester as string,
      mode: r.mode ?? "Unknown",
      acad_career: r.acad_career as string,
      program: r.program ?? "Unknown",
      campus: r.campus as string,
      province: r.province ?? "Unknown",
      program_status: r.program_status ?? "Unknown",
      admit_type: r.admit_type ?? "Unknown",
      total_students: r.total_students ?? 0,
      male: r.male ?? 0,
      female: r.female ?? 0,
      transgender: r.transgender ?? 0,
      fresh_admits: r.fresh_admits ?? 0,
      continuing_students: r.continuing_students ?? 0,
      total_course_enrollments: r.total_course_enrollments ?? 0,
    }));
}

function seasonSort(a: string, b: string): number {
  const seasonOrder: Record<string, number> = { Spring: 0, Autumn: 1 };
  const [seasonA, yearA] = a.split(" ");
  const [seasonB, yearB] = b.split(" ");
  if (yearA !== yearB) return (yearA ?? "").localeCompare(yearB ?? "");
  return (seasonOrder[seasonA] ?? 0) - (seasonOrder[seasonB] ?? 0);
}

// Filter options come from the FULL table, not the filtered subset, so the
// dropdowns never shrink out from under the user.
export async function getFilterOptions(): Promise<AdmissionsFilterOptions> {
  const [semesterRows, modeRows, careerRows, campusRows] = await Promise.all([
    ftsDb.admissions_STATS.findMany({ distinct: ["semester"], select: { semester: true }, where: { semester: { not: null } } }),
    ftsDb.admissions_STATS.findMany({ distinct: ["mode"], select: { mode: true }, where: { mode: { not: null } } }),
    ftsDb.admissions_STATS.findMany({ distinct: ["acad_career"], select: { acad_career: true }, where: { acad_career: { not: null } } }),
    ftsDb.admissions_STATS.findMany({ distinct: ["campus"], select: { campus: true }, where: { campus: { not: null } } }),
  ]);

  return {
    semesters: semesterRows.map((r) => r.semester as string).sort(seasonSort),
    modes: modeRows.map((r) => r.mode as string).sort(),
    acadCareers: careerRows.map((r) => r.acad_career as string).sort(),
    campuses: campusRows.map((r) => r.campus as string).sort(),
  };
}

/** Defaults the Semester filter to the most recent semester (chronologically).
 * Falls back to "All" if the table is somehow empty. With only one semester
 * currently loaded, this just resolves to that one — the filter and default
 * logic don't need special-casing as more semesters get added later. */
export function resolveDefaultSemester(options: AdmissionsFilterOptions): string {
  return options.semesters.length > 0 ? options.semesters[options.semesters.length - 1] : "All";
}

function sumBy(rows: AdmissionsStat[], key: keyof AdmissionsStat): number {
  return rows.reduce((s, r) => s + (Number(r[key]) || 0), 0);
}

export function computeKpis(rows: AdmissionsStat[]): AdmissionsKpis {
  const totalStudents = sumBy(rows, "total_students");
  const totalCourseEnrollments = sumBy(rows, "total_course_enrollments");

  return {
    totalStudents,
    male: sumBy(rows, "male"),
    female: sumBy(rows, "female"),
    transgender: sumBy(rows, "transgender"),
    freshAdmits: sumBy(rows, "fresh_admits"),
    continuingStudents: sumBy(rows, "continuing_students"),
    avgCoursesPerStudent: totalStudents ? Number((totalCourseEnrollments / totalStudents).toFixed(1)) : 0,
    campusCount: new Set(rows.map((r) => r.campus)).size,
    careerCount: new Set(rows.map((r) => r.acad_career)).size,
  };
}

export function bySemester(rows: AdmissionsStat[]): SemesterTrendPoint[] {
  const semesters = Array.from(new Set(rows.map((r) => r.semester))).sort(seasonSort);
  return semesters.map((semester) => {
    const subset = rows.filter((r) => r.semester === semester);
    return {
      semester,
      totalStudents: sumBy(subset, "total_students"),
      freshAdmits: sumBy(subset, "fresh_admits"),
      continuingStudents: sumBy(subset, "continuing_students"),
    };
  });
}

function groupSum(rows: AdmissionsStat[], key: "acad_career" | "campus" | "province" | "mode", valueKey: keyof AdmissionsStat, n?: number): [string, number][] {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r[key], (map.get(r[key]) ?? 0) + Number(r[valueKey] || 0));
  }
  const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  return n ? sorted.slice(0, n) : sorted;
}

export function byAcadCareer(rows: AdmissionsStat[]): [string, number][] {
  return groupSum(rows, "acad_career", "total_students");
}

export function byCampus(rows: AdmissionsStat[], n = 15): [string, number][] {
  return groupSum(rows, "campus", "total_students", n);
}

export function byProvince(rows: AdmissionsStat[], n = 15): [string, number][] {
  return groupSum(rows, "province", "total_students", n);
}

export function genderBreakdown(rows: AdmissionsStat[]): [string, number][] {
  const entries: [string, number][] = [
    ["Male", sumBy(rows, "male")],
    ["Female", sumBy(rows, "female")],
    ["Transgender", sumBy(rows, "transgender")],
  ];
  return entries.filter(([, v]) => v > 0);
}

export function freshVsContinuing(rows: AdmissionsStat[]): [string, number][] {
  const entries: [string, number][] = [
    ["Fresh Admits", sumBy(rows, "fresh_admits")],
    ["Continuing", sumBy(rows, "continuing_students")],
  ];
  return entries.filter(([, v]) => v > 0);
}

export function modeBreakdown(rows: AdmissionsStat[]): [string, number][] {
  return groupSum(rows, "mode", "total_students");
}

/** Avg course enrollments per student, per academic career — a derived
 * per-student rate, not a raw total, so a small career doesn't look
 * artificially low next to a large one. */
export function avgCoursesByCareer(rows: AdmissionsStat[]): [string, number][] {
  const totals = new Map<string, number>();
  const students = new Map<string, number>();
  for (const r of rows) {
    totals.set(r.acad_career, (totals.get(r.acad_career) ?? 0) + r.total_course_enrollments);
    students.set(r.acad_career, (students.get(r.acad_career) ?? 0) + r.total_students);
  }
  return Array.from(totals.entries())
    .map(([career, total]) => {
      const s = students.get(career) ?? 0;
      return [career, s ? Number((total / s).toFixed(1)) : 0] as [string, number];
    })
    .sort((a, b) => b[1] - a[1]);
}

/** Fresh vs Continuing per academic career — a genuine two-series
 * comparison, ranked by total volume. */
export function freshVsContinuingByCareer(rows: AdmissionsStat[]): CareerFreshContinuingPoint[] {
  const fresh = new Map<string, number>();
  const continuing = new Map<string, number>();
  for (const r of rows) {
    fresh.set(r.acad_career, (fresh.get(r.acad_career) ?? 0) + r.fresh_admits);
    continuing.set(r.acad_career, (continuing.get(r.acad_career) ?? 0) + r.continuing_students);
  }
  return Array.from(fresh.keys())
    .map((career) => ({ career, fresh: fresh.get(career) ?? 0, continuing: continuing.get(career) ?? 0 }))
    .sort((a, b) => b.fresh + b.continuing - (a.fresh + a.continuing));
}

/** Fresh vs Continuing per region (campus) — same idea as
 * freshVsContinuingByCareer, capped to the top N regions by volume since
 * there are 49+ campuses and an uncapped chart would be unreadable even at
 * full page width. */
export function freshVsContinuingByRegion(rows: AdmissionsStat[], n = 20): RegionFreshContinuingPoint[] {
  const fresh = new Map<string, number>();
  const continuing = new Map<string, number>();
  for (const r of rows) {
    fresh.set(r.campus, (fresh.get(r.campus) ?? 0) + r.fresh_admits);
    continuing.set(r.campus, (continuing.get(r.campus) ?? 0) + r.continuing_students);
  }
  return Array.from(fresh.keys())
    .map((region) => ({ region, fresh: fresh.get(region) ?? 0, continuing: continuing.get(region) ?? 0 }))
    .sort((a, b) => b.fresh + b.continuing - (a.fresh + a.continuing))
    .slice(0, n);
}
