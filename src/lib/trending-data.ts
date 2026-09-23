import { Prisma } from "@prisma/client";
import { ftsDb } from "@/lib/prisma";
import {
  TrendingStat,
  TrendingFilterOptions,
  TrendingKpis,
  IntakeTrendPoint,
} from "@/types/trending";

/**
 * PROGRAM_TRENDING_STATS is ~2,475 rows (225 programs x 11 intakes) —
 * closer to TMS_STATS/E_OFFICE_STATS scale than CMS_STATS's 85k, so this
 * fetches the filtered rows with one query and aggregates in plain JS
 * rather than pushing every breakdown into SQL groupBy().
 */

export interface TrendingFilterParams {
  programGroup?: string;
  program?: string;
  intake?: string;
}

export function buildWhere(filters: TrendingFilterParams): Prisma.PROGRAM_TRENDING_STATSWhereInput {
  const where: Prisma.PROGRAM_TRENDING_STATSWhereInput = {};
  if (filters.programGroup) where.program_group = filters.programGroup;
  if (filters.program) where.program_title = filters.program;
  if (filters.intake) where.intake = filters.intake;
  return where;
}

export async function getFilteredRows(where: Prisma.PROGRAM_TRENDING_STATSWhereInput): Promise<TrendingStat[]> {
  const rows = await ftsDb.pROGRAM_TRENDING_STATS.findMany({ where, orderBy: { id: "asc" } });
  return rows
    .filter((r) => r.program_code && r.program_title && r.program_group && r.intake)
    .map((r) => ({
      id: r.id,
      program_code: r.program_code as string,
      program_title: r.program_title as string,
      program_group: r.program_group as string,
      intake: r.intake as string,
      submitted: r.submitted ?? 0,
      not_submitted: r.not_submitted ?? 0,
      total: r.total ?? 0,
      oas_fee_received: r.oas_fee_received ?? 0,
      manual_fee_received: r.manual_fee_received ?? 0,
      verified: r.verified ?? 0,
      objection: r.objection ?? 0,
      pending: r.pending ?? 0,
    }));
}

function seasonSort(a: string, b: string): number {
  const seasonOrder: Record<string, number> = { Spring: 0, Autumn: 1 };
  const [seasonA, yearA] = a.split(" ");
  const [seasonB, yearB] = b.split(" ");
  if (yearA !== yearB) return yearA.localeCompare(yearB);
  return (seasonOrder[seasonA] ?? 0) - (seasonOrder[seasonB] ?? 0);
}

// Filter options come from the FULL table, not the filtered subset. Program
// options are scoped to the selected Program Group (14BH alone still has
// dozens of programs, but far fewer than the full 225).
export async function getFilterOptions(programGroup?: string): Promise<TrendingFilterOptions> {
  const [groupRows, programRows, intakeRows] = await Promise.all([
    ftsDb.pROGRAM_TRENDING_STATS.findMany({ distinct: ["program_group"], select: { program_group: true }, where: { program_group: { not: null } } }),
    ftsDb.pROGRAM_TRENDING_STATS.findMany({
      distinct: ["program_title"],
      select: { program_title: true },
      where: { program_title: { not: null }, ...(programGroup ? { program_group: programGroup } : {}) },
    }),
    ftsDb.pROGRAM_TRENDING_STATS.findMany({ distinct: ["intake"], select: { intake: true }, where: { intake: { not: null } } }),
  ]);

  return {
    programGroups: groupRows.map((r) => r.program_group as string).sort(),
    programs: programRows.map((r) => r.program_title as string).sort(),
    intakes: intakeRows.map((r) => r.intake as string).sort(seasonSort),
  };
}

/** Defaults the Intake filter to the most recent intake (chronologically —
 * "Spring 2026" must outrank "Autumn 2025" even though "A" < "S"). */
export function resolveDefaultIntake(options: TrendingFilterOptions): string {
  return options.intakes.length > 0 ? options.intakes[options.intakes.length - 1] : "All";
}

function sumBy(rows: TrendingStat[], key: keyof TrendingStat): number {
  return rows.reduce((s, r) => s + (Number(r[key]) || 0), 0);
}

export function computeKpis(rows: TrendingStat[]): TrendingKpis {
  const totalSubmitted = sumBy(rows, "submitted");
  const totalVerified = sumBy(rows, "verified");
  const totalApplications = sumBy(rows, "total");

  return {
    totalApplications,
    totalSubmitted,
    totalNotSubmitted: sumBy(rows, "not_submitted"),
    totalFeeReceived: sumBy(rows, "oas_fee_received") + sumBy(rows, "manual_fee_received"),
    totalVerified,
    totalObjection: sumBy(rows, "objection"),
    totalPending: sumBy(rows, "pending"),
    submissionRate: totalApplications ? (totalSubmitted / totalApplications) * 100 : 0,
    verificationRate: totalSubmitted ? (totalVerified / totalSubmitted) * 100 : 0,
    programCount: new Set(rows.map((r) => r.program_title)).size,
  };
}

export function byIntake(rows: TrendingStat[]): IntakeTrendPoint[] {
  const intakes = Array.from(new Set(rows.map((r) => r.intake))).sort(seasonSort);
  return intakes.map((intake) => {
    const subset = rows.filter((r) => r.intake === intake);
    return {
      intake,
      submitted: sumBy(subset, "submitted"),
      total: sumBy(subset, "total"),
      verified: sumBy(subset, "verified"),
      pending: sumBy(subset, "pending"),
    };
  });
}

function groupSum(rows: TrendingStat[], key: "program_group" | "program_title", valueKey: keyof TrendingStat, n?: number): [string, number][] {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r[key], (map.get(r[key]) ?? 0) + Number(r[valueKey] || 0));
  }
  const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  return n ? sorted.slice(0, n) : sorted;
}

export function byProgramGroup(rows: TrendingStat[]): [string, number][] {
  return groupSum(rows, "program_group", "total");
}

export function topProgramsBySubmitted(rows: TrendingStat[], n = 15): [string, number][] {
  return groupSum(rows, "program_title", "submitted", n);
}

export function feeChannelBreakdown(rows: TrendingStat[]): [string, number][] {
  return [
    ["OAS (Online)", sumBy(rows, "oas_fee_received")],
    ["Manual", sumBy(rows, "manual_fee_received")],
  ].filter(([, v]) => v > 0) as [string, number][];
}

export function statusBreakdown(rows: TrendingStat[]): [string, number][] {
  return [
    ["Verified", sumBy(rows, "verified")],
    ["Objection", sumBy(rows, "objection")],
    ["Pending", sumBy(rows, "pending")],
  ].filter(([, v]) => v > 0) as [string, number][];
}

/** Submitted vs Not Submitted per program group — a genuine two-series
 * comparison, ranked by total volume. */
export function submissionByProgramGroup(rows: TrendingStat[]): { group: string; submitted: number; notSubmitted: number }[] {
  const submitted = new Map<string, number>();
  const notSubmitted = new Map<string, number>();
  for (const r of rows) {
    submitted.set(r.program_group, (submitted.get(r.program_group) ?? 0) + r.submitted);
    notSubmitted.set(r.program_group, (notSubmitted.get(r.program_group) ?? 0) + r.not_submitted);
  }
  return Array.from(submitted.keys())
    .map((group) => ({ group, submitted: submitted.get(group) ?? 0, notSubmitted: notSubmitted.get(group) ?? 0 }))
    .sort((a, b) => b.submitted + b.notSubmitted - (a.submitted + a.notSubmitted));
}

/** Verification rate (%) per program group, ranked descending. */
export function verificationRateByProgramGroup(rows: TrendingStat[]): [string, number][] {
  const submitted = new Map<string, number>();
  const verified = new Map<string, number>();
  for (const r of rows) {
    submitted.set(r.program_group, (submitted.get(r.program_group) ?? 0) + r.submitted);
    verified.set(r.program_group, (verified.get(r.program_group) ?? 0) + r.verified);
  }
  return Array.from(submitted.entries())
    .map(([group, s]) => [group, s ? Number(((verified.get(group)! / s) * 100).toFixed(1)) : 0] as [string, number])
    .sort((a, b) => b[1] - a[1]);
}
