import { Prisma } from "@/generated/fts-client";
import { ftsDb } from "@/lib/prisma";
import {
  OasApplicantFilterOptions,
  OasApplicantKpis,
  SemesterTrendPoint,
  AgeBandPoint,
} from "@/types/oas-applicant";

/**
 * OAS_Applicant_STATS is ~319,000 rows — CMS_STATS/ERP_STATS scale, not
 * TMS/E-Office scale — so every breakdown here is pushed into SQL via
 * Prisma groupBy()/aggregate() rather than fetched whole and reduced in
 * JS. Only small, already-aggregated results ever cross into the React
 * tree.
 */

export interface OasApplicantFilterParams {
  semester?: string;
  region?: string; // province
  program?: string;
}

export function buildWhere(filters: OasApplicantFilterParams): Prisma.OAS_STATSWhereInput {
  const where: Prisma.OAS_STATSWhereInput = {};
  if (filters.semester) where.semester = filters.semester;
  if (filters.region) where.province = filters.region;
  if (filters.program) where.program = filters.program;
  return where;
}

// "Spring-2021" / "Autumn-2026" — split on the hyphen, year first, season
// (Spring before Autumn) as the tiebreaker.
function seasonSort(a: string, b: string): number {
  const seasonOrder: Record<string, number> = { Spring: 0, Autumn: 1 };
  const [seasonA, yearA] = a.split("-");
  const [seasonB, yearB] = b.split("-");
  if (yearA !== yearB) return (yearA ?? "").localeCompare(yearB ?? "");
  return (seasonOrder[seasonA] ?? 0) - (seasonOrder[seasonB] ?? 0);
}

// Filter options always come from the FULL table, not the filtered
// subset, so picking a Region doesn't make other Semesters/Programs
// disappear from their own dropdowns.
export async function getFilterOptions(): Promise<OasApplicantFilterOptions> {
  const [semesterRows, regionRows, programRows] = await Promise.all([
    ftsDb.oAS_STATS.findMany({ distinct: ["semester"], select: { semester: true }, where: { semester: { not: null } } }),
    ftsDb.oAS_STATS.findMany({ distinct: ["province"], select: { province: true }, where: { province: { not: null } } }),
    ftsDb.oAS_STATS.findMany({ distinct: ["program"], select: { program: true }, where: { program: { not: null } } }),
  ]);

  return {
    semesters: semesterRows.map((r) => r.semester as string).sort(seasonSort),
    regions: regionRows.map((r) => r.province as string).sort(),
    programs: programRows.map((r) => r.program as string).sort(),
  };
}

/** Defaults the Semester filter to the most recent semester in the
 * dataset — same convention as every other dashboard here. */
export function resolveDefaultSemester(options: OasApplicantFilterOptions): string {
  return options.semesters.length > 0 ? options.semesters[options.semesters.length - 1] : "All";
}

export async function computeKpis(where: Prisma.OAS_STATSWhereInput): Promise<OasApplicantKpis> {
  const [sums, regionCount, programCount] = await Promise.all([
    ftsDb.oAS_STATS.aggregate({
      where,
      _sum: {
        verified: true,
        submitted: true,
        not_submitted: true,
        objection: true,
        fee_verified_count: true,
        male_count: true,
        female_count: true,
        transgender_count: true,
      },
    }),
    ftsDb.oAS_STATS.findMany({ where, distinct: ["province"], select: { province: true } }),
    ftsDb.oAS_STATS.findMany({ where, distinct: ["program"], select: { program: true } }),
  ]);

  const verified = sums._sum.verified ?? 0;
  const submitted = sums._sum.submitted ?? 0;
  const notSubmitted = sums._sum.not_submitted ?? 0;
  const objection = sums._sum.objection ?? 0;
  const totalApplicants = verified + submitted + notSubmitted + objection;

  return {
    totalApplicants,
    verified,
    submitted,
    notSubmitted,
    objection,
    feeVerified: sums._sum.fee_verified_count ?? 0,
    male: sums._sum.male_count ?? 0,
    female: sums._sum.female_count ?? 0,
    transgender: sums._sum.transgender_count ?? 0,
    verificationRate: totalApplicants ? (verified / totalApplicants) * 100 : 0,
    submissionRate: totalApplicants ? ((submitted + verified) / totalApplicants) * 100 : 0,
    regionCount: regionCount.length,
    programCount: programCount.length,
  };
}

export async function bySemester(where: Prisma.OAS_STATSWhereInput): Promise<SemesterTrendPoint[]> {
  const rows = await ftsDb.oAS_STATS.groupBy({
    by: ["semester"],
    where,
    _sum: { verified: true, submitted: true, not_submitted: true, objection: true },
  });

  return rows
    .filter((r) => r.semester)
    .map((r) => {
      const verified = r._sum.verified ?? 0;
      const submitted = r._sum.submitted ?? 0;
      const notSubmitted = r._sum.not_submitted ?? 0;
      const objection = r._sum.objection ?? 0;
      return {
        semester: r.semester as string,
        verified,
        submitted,
        notSubmitted,
        objection,
        totalApplicants: verified + submitted + notSubmitted + objection,
      };
    })
    .sort((a, b) => seasonSort(a.semester, b.semester));
}

/** Top N regions (provinces) by total applicants — SQL groupBy + sum, then
 * sorted and sliced in JS since Prisma can't order by a computed sum
 * directly in the groupBy call itself. */
export async function byRegionTop(where: Prisma.OAS_STATSWhereInput, n = 15): Promise<[string, number][]> {
  const rows = await ftsDb.oAS_STATS.groupBy({
    by: ["province"],
    where,
    _sum: { verified: true, submitted: true, not_submitted: true, objection: true },
  });
  return rows
    .filter((r) => r.province)
    .map((r) => [r.province as string, (r._sum.verified ?? 0) + (r._sum.submitted ?? 0) + (r._sum.not_submitted ?? 0) + (r._sum.objection ?? 0)] as [string, number])
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

/** Top N programs by total applicants, respecting whatever Semester/Region
 * filter is already active — same "scope the breakdown to the current
 * filter" pattern used for ERP's account breakdown and Admissions'
 * campus/province breakdowns. */
export async function byProgramTop(where: Prisma.OAS_STATSWhereInput, n = 15): Promise<[string, number][]> {
  const rows = await ftsDb.oAS_STATS.groupBy({
    by: ["program"],
    where,
    _sum: { verified: true, submitted: true, not_submitted: true, objection: true },
  });
  return rows
    .filter((r) => r.program)
    .map((r) => [r.program as string, (r._sum.verified ?? 0) + (r._sum.submitted ?? 0) + (r._sum.not_submitted ?? 0) + (r._sum.objection ?? 0)] as [string, number])
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

export async function genderBreakdown(where: Prisma.OAS_STATSWhereInput): Promise<[string, number][]> {
  const sums = await ftsDb.oAS_STATS.aggregate({
    where,
    _sum: { male_count: true, female_count: true, transgender_count: true },
  });
  const entries: [string, number][] = [
    ["Male", sums._sum.male_count ?? 0],
    ["Female", sums._sum.female_count ?? 0],
    ["Transgender", sums._sum.transgender_count ?? 0],
  ];
  return entries.filter(([, v]) => v > 0);
}

export async function statusBreakdown(kpis: OasApplicantKpis): Promise<[string, number][]> {
  const entries: [string, number][] = [
    ["Verified", kpis.verified],
    ["Submitted", kpis.submitted],
    ["Not Submitted", kpis.notSubmitted],
    ["Under Objection", kpis.objection],
  ];
  return entries.filter(([, v]) => v > 0);
}

export async function ageBandBreakdown(where: Prisma.OAS_STATSWhereInput): Promise<AgeBandPoint[]> {
  const sums = await ftsDb.oAS_STATS.aggregate({
    where,
    _sum: {
      count_under_18: true,
      count_18_30: true,
      count_30_40: true,
      count_40_50: true,
      count_above_50: true,
    },
  });
  return [
    { band: "Under 18", count: sums._sum.count_under_18 ?? 0 },
    { band: "18–30", count: sums._sum.count_18_30 ?? 0 },
    { band: "30–40", count: sums._sum.count_30_40 ?? 0 },
    { band: "40–50", count: sums._sum.count_40_50 ?? 0 },
    { band: "Above 50", count: sums._sum.count_above_50 ?? 0 },
  ];
}

/** Bonus insight beyond the three required filters — this export also
 * carries overseas applicants across 93 countries, which is worth
 * surfacing even though Country isn't one of the three filters asked for. */
export async function byCountryTop(where: Prisma.OAS_STATSWhereInput, n = 10): Promise<[string, number][]> {
  const rows = await ftsDb.oAS_STATS.groupBy({
    by: ["country"],
    where: { ...where, country: { not: "Pakistan" } },
    _sum: { verified: true, submitted: true, not_submitted: true, objection: true },
  });
  return rows
    .filter((r) => r.country)
    .map((r) => [r.country as string, (r._sum.verified ?? 0) + (r._sum.submitted ?? 0) + (r._sum.not_submitted ?? 0) + (r._sum.objection ?? 0)] as [string, number])
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}
