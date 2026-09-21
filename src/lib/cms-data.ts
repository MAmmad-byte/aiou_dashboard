
import { Prisma } from "@/generated/fts-client";
import { ftsDb } from "@/lib/prisma";
import { CmsStatRow, CmsFilterOptions, CmsKpis, IntakePeriodPoint } from "@/types/cms";

// Re-exported so callers can `import { IntakePeriodPoint } from "@/lib/cms-data"`
// alongside CareerGenderSplit/PaginatedResult below, which actually are
// defined here — keeps all the aggregate result types importable from one
// place instead of some from @/types/cms and some from @/lib/cms-data.
export type { IntakePeriodPoint };

export interface CmsFilterParams {
  year?: string;
  season?: string;
  region?: string;
  career?: string;
  program?: string;
  mode?: string;
}

// "2026 AUTUMN (F)" -> { year: "2026", season: "AUTUMN" }. There's no
// separate year/season column in the table, so year/season filtering goes
// through Student_Intake with startsWith/contains (see buildWhere) and this
// parser is only used client-side, to merge the raw groupBy buckets in
// byIntakePeriod (which still vary by the "(F)/(O)/(SSC/HSSC)" suffix) into
// clean "YYYY SEASON" trend points.
export function parseIntake(intake: string): { year: string; season: string } {
  const match = intake.match(/^(\d{4})\s+(\S+)/);
  return match ? { year: match[1], season: match[2] } : { year: "", season: "" };
}

export function buildWhere(filters: CmsFilterParams): Prisma.CMS_STATSWhereInput {
  const where: Prisma.CMS_STATSWhereInput = {};
  if (filters.region) where.Regiion = filters.region;
  if (filters.career) where.acadCareer = filters.career;
  if (filters.program) where.programTitle = filters.program;
  if (filters.mode) where.Mode = filters.mode;

  if (filters.year && filters.season) {
    where.Student_Intake = { startsWith: `${filters.year} ${filters.season}` };
  } else if (filters.year) {
    where.Student_Intake = { startsWith: filters.year };
  } else if (filters.season) {
    // season alone can't use startsWith (year comes first in the string)
    where.Student_Intake = { contains: ` ${filters.season}` };
  }

  return where;
}

// Filter dropdown options are always built from the FULL table (an empty
// `where`), not the filtered subset, so the dropdowns never shrink out from
// under the user. Each is a small DISTINCT query — cheap once Regiion,
// acadCareer, programTitle, Mode, and Student_Intake are indexed (see the
// @@index entries in prisma/cms-stats.prisma; if you haven't run a migration
// with those yet, these queries still work, just without the index speedup).
export async function getFilterOptions(): Promise<CmsFilterOptions> {
  const [intakeRows, regionRows, careerRows, programRows, modeRows] = await Promise.all([
    ftsDb.cMS_STATS.findMany({ distinct: ["Student_Intake"], select: { Student_Intake: true }, where: { Student_Intake: { not: null } } }),
    ftsDb.cMS_STATS.findMany({ distinct: ["Regiion"], select: { Regiion: true }, where: { Regiion: { not: null } } }),
    ftsDb.cMS_STATS.findMany({ distinct: ["acadCareer"], select: { acadCareer: true }, where: { acadCareer: { not: null } } }),
    ftsDb.cMS_STATS.findMany({ distinct: ["programTitle"], select: { programTitle: true }, where: { programTitle: { not: null } } }),
    ftsDb.cMS_STATS.findMany({ distinct: ["Mode"], select: { Mode: true }, where: { Mode: { not: null } } }),
  ]);

  const years = new Set<string>();
  const seasons = new Set<string>();
  for (const { Student_Intake } of intakeRows) {
    if (!Student_Intake) continue;
    const { year, season } = parseIntake(Student_Intake);
    if (year) years.add(year);
    if (season) seasons.add(season);
  }

  return {
    years: Array.from(years).sort(),
    seasons: Array.from(seasons).sort(),
    regions: regionRows.map((r) => r.Regiion!).sort(),
    careers: careerRows.map((r) => r.acadCareer!).sort(),
    programs: programRows.map((r) => r.programTitle!).sort(),
    modes: modeRows.map((r) => r.Mode!).sort(),
  };
}

/** Defaults the Year filter to the most recent year in the dataset, so a
 * fresh page load aggregates one intake year instead of the full history. */
export function resolveDefaultYear(options: CmsFilterOptions): string {
  return options.years.length > 0 ? options.years[options.years.length - 1] : "All";
}

export async function computeKpis(where: Prisma.CMS_STATSWhereInput): Promise<CmsKpis> {
  const [sums, programCount, regionCount] = await Promise.all([
    ftsDb.cMS_STATS.aggregate({
      where,
      _sum: {
        Total_Enroll: true,
        Active_Enroll: true,
        Discontinue_Enroll: true,
        Total_Enroll_Male: true,
        Total_Enroll_Female: true,
        Total_Enroll_Transgender: true,
      },
    }),
    ftsDb.cMS_STATS.findMany({ where, distinct: ["programTitle"], select: { programTitle: true } }),
    ftsDb.cMS_STATS.findMany({ where, distinct: ["Regiion"], select: { Regiion: true } }),
  ]);

  const totalEnroll = sums._sum.Total_Enroll ?? 0;
  const activeEnroll = sums._sum.Active_Enroll ?? 0;

  return {
    totalEnroll,
    activeEnroll,
    discontinueEnroll: sums._sum.Discontinue_Enroll ?? 0,
    retentionRate: totalEnroll ? (activeEnroll / totalEnroll) * 100 : 0,
    male: sums._sum.Total_Enroll_Male ?? 0,
    female: sums._sum.Total_Enroll_Female ?? 0,
    transgender: sums._sum.Total_Enroll_Transgender ?? 0,
    programCount: programCount.length,
    regionCount: regionCount.length,
  };
}

// Groups by the raw Student_Intake in SQL (SUM per distinct intake string —
// at most ~162 groups regardless of how many of the 85k rows match `where`),
// then merges the "(F)/(O)/(SSC/HSSC)" suffix variants into clean
// "YYYY SEASON" points in JS. The heavy per-row summing happens in the DB;
// only ~162 grouped rows ever reach Node.
export async function byIntakePeriod(where: Prisma.CMS_STATSWhereInput): Promise<IntakePeriodPoint[]> {
  const grouped = await ftsDb.cMS_STATS.groupBy({
    by: ["Student_Intake"],
    where,
    _sum: { Total_Enroll: true, Active_Enroll: true, Discontinue_Enroll: true },
  });

  const map = new Map<string, IntakePeriodPoint>();
  for (const row of grouped) {
    if (!row.Student_Intake) continue;
    const { year, season } = parseIntake(row.Student_Intake);
    if (!year) continue;
    const label = `${year} ${season}`;
    const existing = map.get(label) ?? { label, totalEnroll: 0, activeEnroll: 0, discontinueEnroll: 0 };
    existing.totalEnroll += row._sum.Total_Enroll ?? 0;
    existing.activeEnroll += row._sum.Active_Enroll ?? 0;
    existing.discontinueEnroll += row._sum.Discontinue_Enroll ?? 0;
    map.set(label, existing);
  }

  const seasonOrder: Record<string, number> = { SPRING: 0, AUTUMN: 1 };
  return Array.from(map.values()).sort((a, b) => {
    const [yearA, seasonA] = a.label.split(" ");
    const [yearB, seasonB] = b.label.split(" ");
    if (yearA !== yearB) return yearA.localeCompare(yearB);
    return (seasonOrder[seasonA] ?? 0) - (seasonOrder[seasonB] ?? 0);
  });
}

export async function byCareer(where: Prisma.CMS_STATSWhereInput): Promise<[string, number][]> {
  const rows = await ftsDb.cMS_STATS.groupBy({
    by: ["acadCareer"],
    where,
    _sum: { Total_Enroll: true },
    orderBy: { _sum: { Total_Enroll: "desc" } },
  });
  return rows.filter((r) => r.acadCareer).map((r) => [r.acadCareer as string, r._sum.Total_Enroll ?? 0]);
}

export async function byMode(where: Prisma.CMS_STATSWhereInput): Promise<[string, number][]> {
  const rows = await ftsDb.cMS_STATS.groupBy({
    by: ["Mode"],
    where,
    _sum: { Total_Enroll: true },
    orderBy: { _sum: { Total_Enroll: "desc" } },
  });
  return rows.filter((r) => r.Mode).map((r) => [r.Mode as string, r._sum.Total_Enroll ?? 0]);
}

// Top-N is computed in SQL (orderBy + take), not by pulling every group and
// slicing in JS — the DB only ever sends back the 15 rows we actually chart.
export async function byRegionTop(where: Prisma.CMS_STATSWhereInput, n = 15): Promise<[string, number][]> {
  const rows = await ftsDb.cMS_STATS.groupBy({
    by: ["Regiion"],
    where,
    _sum: { Total_Enroll: true },
    orderBy: { _sum: { Total_Enroll: "desc" } },
    take: n,
  });
  return rows.filter((r) => r.Regiion).map((r) => [r.Regiion as string, r._sum.Total_Enroll ?? 0]);
}

export async function byProgramTop(where: Prisma.CMS_STATSWhereInput, n = 15): Promise<[string, number][]> {
  const rows = await ftsDb.cMS_STATS.groupBy({
    by: ["programTitle"],
    where,
    _sum: { Total_Enroll: true },
    orderBy: { _sum: { Total_Enroll: "desc" } },
    take: n,
  });
  return rows.filter((r) => r.programTitle).map((r) => [r.programTitle as string, r._sum.Total_Enroll ?? 0]);
}

export interface CareerGenderSplit {
  career: string;
  male: number;
  female: number;
}

export async function genderByCareer(where: Prisma.CMS_STATSWhereInput): Promise<CareerGenderSplit[]> {
  const rows = await ftsDb.cMS_STATS.groupBy({
    by: ["acadCareer"],
    where,
    _sum: { Total_Enroll: true, Total_Enroll_Male: true, Total_Enroll_Female: true },
    orderBy: { _sum: { Total_Enroll: "desc" } },
    take: 10,
  });
  return rows
    .filter((r) => r.acadCareer)
    .map((r) => ({
      career: r.acadCareer as string,
      male: r._sum.Total_Enroll_Male ?? 0,
      female: r._sum.Total_Enroll_Female ?? 0,
    }));
}

/** Discontinuation rate (%) per career — division isn't expressible in a
 * single SQL aggregate through Prisma, but with only ~10 career groups
 * returned, computing the ratio client-side afterward is negligible. */
export async function discontinuationRateByCareer(where: Prisma.CMS_STATSWhereInput): Promise<[string, number][]> {
  const rows = await ftsDb.cMS_STATS.groupBy({
    by: ["acadCareer"],
    where,
    _sum: { Total_Enroll: true, Discontinue_Enroll: true },
  });
  return rows
    .filter((r) => r.acadCareer)
    .map((r) => {
      const total = r._sum.Total_Enroll ?? 0;
      const discontinued = r._sum.Discontinue_Enroll ?? 0;
      return [r.acadCareer as string, total ? Number(((discontinued / total) * 100).toFixed(1)) : 0] as [string, number];
    })
    .sort((a, b) => b[1] - a[1]);
}

export interface PaginatedResult {
  rows: CmsStatRow[];
  page: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
}

/** Just the count matching the current filters — used for the "N cohort
 * rows" subtitle now that the records table itself has been removed from
 * the page. Cheaper than getPaginatedRows() below, which still exists if
 * you want to bring a table back later (e.g. on a dedicated /cms/records
 * page), but there's no reason to pay for the LIMIT/OFFSET row fetch just
 * to display a number. */
export async function countRows(where: Prisma.CMS_STATSWhereInput): Promise<number> {
  return ftsDb.cMS_STATS.count({ where });
}

// True DB-level pagination — COUNT + LIMIT/OFFSET, never loads more than
// `pageSize` rows into Node for the table view.
export async function getPaginatedRows(
  where: Prisma.CMS_STATSWhereInput,
  page: number,
  pageSize = 25
): Promise<PaginatedResult> {
  const totalRows = await ftsDb.cMS_STATS.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const rows = await ftsDb.cMS_STATS.findMany({
    where,
    orderBy: { Total_Enroll: "desc" },
    skip: (safePage - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      Student_Intake: true,
      Regiion: true,
      acadCareer: true,
      programTitle: true,
      Mode: true,
      Total_Enroll: true,
      Total_Enroll_Male: true,
      Total_Enroll_Female: true,
      Active_Enroll: true,
      Discontinue_Enroll: true,
    },
  });

  return { rows, page: safePage, pageSize, totalRows, totalPages };
}
