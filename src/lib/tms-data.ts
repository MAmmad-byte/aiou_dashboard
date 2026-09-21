import { Prisma } from "@/generated/fts-client";
import { ftsDb } from "@/lib/prisma";
import { TmsStat, TmsFilterOptions, TmsKpis, SemesterTrendPoint } from "@/types/tms";

// Re-exported so callers can `import { SemesterTrendPoint } from "@/lib/tms-data"`
// — matches how TmsDashboard.tsx and TmsCharts.tsx actually import it,
// keeping all the aggregate result types importable from this one module.
export type { SemesterTrendPoint };

/**
 * TMS_STATS is a Semester x Region snapshot table — ~294 rows (matching the
 * dummy dataset's 49 regions x 6 semesters), so this fetches the filtered
 * rows with one query and aggregates in plain JS, same approach as
 * lib/eoffice-data.ts. If this table grows dramatically (many more
 * semesters or a much finer region breakdown), revisit the way
 * lib/cms-data.ts pushes grouping into SQL instead.
 */

export interface TmsFilterParams {
  semester?: string;
  region?: string;
}

export function buildWhere(filters: TmsFilterParams): Prisma.TMS_STATSWhereInput {
  const where: Prisma.TMS_STATSWhereInput = {};
  if (filters.semester) where.semester = filters.semester;
  if (filters.region) where.region = filters.region;
  return where;
}

export async function getFilteredRows(where: Prisma.TMS_STATSWhereInput): Promise<TmsStat[]> {
  const rows = await ftsDb.tMS_STATS.findMany({ where, orderBy: { id: "asc" } });
  return rows
    .filter((r) => r.semester && r.region) // rows with no semester/region can't be charted meaningfully
    .map((r) => ({
      id: r.id,
      semester: r.semester as string,
      region: r.region as string,
      allocated_tutors: r.allocated_tutors ?? 0,
      total_eligible_tutors: r.total_eligible_tutors ?? 0,
      allocated_enrollments: r.allocated_enrollments ?? 0,
      unallocated_enrollments: r.unallocated_enrollments ?? 0,
      confirmed_files: r.confirmed_files ?? 0,
      not_confirmed_files: r.not_confirmed_files ?? 0,
      allocated_students: r.allocated_students ?? 0,
      unallocated_students: r.unallocated_students ?? 0,
      total_students: r.total_students ?? 0,
    }));
}

// Filter options come from the FULL table, not the filtered subset, so the
// dropdowns never shrink out from under the user.
export async function getFilterOptions(): Promise<TmsFilterOptions> {
  const [semesterRows, regionRows] = await Promise.all([
    ftsDb.tMS_STATS.findMany({ distinct: ["semester"], select: { semester: true }, where: { semester: { not: null } } }),
    ftsDb.tMS_STATS.findMany({ distinct: ["region"], select: { region: true }, where: { region: { not: null } } }),
  ]);

  const seasonOrder: Record<string, number> = { Spring: 0, Autumn: 1 };
  const semesters = (semesterRows.map((r) => r.semester as string)).sort((a, b) => {
    const [seasonA, yearA] = a.split(" ");
    const [seasonB, yearB] = b.split(" ");
    if (yearA !== yearB) return yearA.localeCompare(yearB);
    return (seasonOrder[seasonA] ?? 0) - (seasonOrder[seasonB] ?? 0);
  });

  return {
    semesters,
    regions: regionRows.map((r) => r.region as string).sort(),
  };
}

/** Defaults the Semester filter to the most recent semester (chronologically,
 * not alphabetically — "Spring 2026" needs to outrank "Autumn 2025" even
 * though "A" < "S"). */
export function resolveDefaultSemester(options: TmsFilterOptions): string {
  return options.semesters.length > 0 ? options.semesters[options.semesters.length - 1] : "All";
}

export function computeKpis(rows: TmsStat[]): TmsKpis {
  const totalStudents = rows.reduce((s, r) => s + r.total_students, 0);
  const allocatedStudents = rows.reduce((s, r) => s + r.allocated_students, 0);
  const allocatedTutors = rows.reduce((s, r) => s + r.allocated_tutors, 0);
  const eligibleTutors = rows.reduce((s, r) => s + r.total_eligible_tutors, 0);
  const confirmedFiles = rows.reduce((s, r) => s + r.confirmed_files, 0);

  return {
    totalStudents,
    allocatedStudents,
    allocatedTutors,
    eligibleTutors,
    studentAllocationRate: totalStudents ? (allocatedStudents / totalStudents) * 100 : 0,
    tutorUtilizationRate: eligibleTutors ? (allocatedTutors / eligibleTutors) * 100 : 0,
    confirmedFiles,
    regionCount: new Set(rows.map((r) => r.region)).size,
  };
}

export function bySemester(rows: TmsStat[]): SemesterTrendPoint[] {
  const seasonOrder: Record<string, number> = { Spring: 0, Autumn: 1 };
  const semesters = Array.from(new Set(rows.map((r) => r.semester))).sort((a, b) => {
    const [seasonA, yearA] = a.split(" ");
    const [seasonB, yearB] = b.split(" ");
    if (yearA !== yearB) return yearA.localeCompare(yearB);
    return (seasonOrder[seasonA] ?? 0) - (seasonOrder[seasonB] ?? 0);
  });

  return semesters.map((semester) => {
    const subset = rows.filter((r) => r.semester === semester);
    return {
      semester,
      totalStudents: subset.reduce((s, r) => s + r.total_students, 0),
      allocatedStudents: subset.reduce((s, r) => s + r.allocated_students, 0),
      unallocatedStudents: subset.reduce((s, r) => s + r.unallocated_students, 0),
      allocatedTutors: subset.reduce((s, r) => s + r.allocated_tutors, 0),
      eligibleTutors: subset.reduce((s, r) => s + r.total_eligible_tutors, 0),
    };
  });
}

function groupSum(rows: TmsStat[], valueKey: keyof TmsStat): [string, number][] {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    map.set(r.region, (map.get(r.region) ?? 0) + Number(r[valueKey]));
  });
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

export function totalStudentsByRegion(rows: TmsStat[], n = 15) {
  return groupSum(rows, "total_students").slice(0, n);
}

/** Allocated vs eligible tutors per region — a genuine two-series comparison,
 * capped to the top 15 regions by eligible tutor pool size. */
export function tutorsByRegion(rows: TmsStat[], n = 15): { region: string; allocated: number; eligible: number }[] {
  const allocated = new Map<string, number>();
  const eligible = new Map<string, number>();
  rows.forEach((r) => {
    allocated.set(r.region, (allocated.get(r.region) ?? 0) + r.allocated_tutors);
    eligible.set(r.region, (eligible.get(r.region) ?? 0) + r.total_eligible_tutors);
  });
  return Array.from(eligible.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([region, eligibleCount]) => ({ region, allocated: allocated.get(region) ?? 0, eligible: eligibleCount }));
}

/** Student allocation rate (%) per region, weighted by that region's own
 * total students — ranks regions by how thoroughly they've allocated their
 * students, not by raw volume. */
export function studentAllocationRateByRegion(rows: TmsStat[], n = 15): [string, number][] {
  const totals = new Map<string, number>();
  const allocated = new Map<string, number>();
  rows.forEach((r) => {
    totals.set(r.region, (totals.get(r.region) ?? 0) + r.total_students);
    allocated.set(r.region, (allocated.get(r.region) ?? 0) + r.allocated_students);
  });
  return Array.from(totals.entries())
    .map(([region, total]) => [region, total ? Number(((allocated.get(region)! / total) * 100).toFixed(1)) : 0] as [string, number])
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

/** File confirmation rate (%) per region, sorted ascending so the regions
 * that most need attention (lowest confirmation rate) show first. */
export function fileConfirmationRateByRegion(rows: TmsStat[], n = 15): [string, number][] {
  const confirmed = new Map<string, number>();
  const notConfirmed = new Map<string, number>();
  rows.forEach((r) => {
    confirmed.set(r.region, (confirmed.get(r.region) ?? 0) + r.confirmed_files);
    notConfirmed.set(r.region, (notConfirmed.get(r.region) ?? 0) + r.not_confirmed_files);
  });
  return Array.from(confirmed.keys())
    .map((region) => {
      const c = confirmed.get(region) ?? 0;
      const nc = notConfirmed.get(region) ?? 0;
      const total = c + nc;
      return [region, total ? Number(((c / total) * 100).toFixed(1)) : 100] as [string, number];
    })
    .sort((a, b) => a[1] - b[1])
    .slice(0, n);
}
