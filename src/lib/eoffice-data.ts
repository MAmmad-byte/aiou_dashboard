import { Prisma } from "@prisma/client";
import { ftsDb } from "@/lib/prisma";
import {
  EOfficeStat,
  EOfficeFilterOptions,
  EOfficeKpis,
  DateTrendPoint,
  DepartmentTimeSplit,
} from "@/types/eoffice";

/**
 * E_OFFICE_STATS is a daily per-department snapshot table — at ~400 rows
 * today it's closer in scale to TMS's 294-row allocation table than CMS's
 * 85k-row history, so this fetches the filtered rows with one query and
 * aggregates in plain JS rather than pushing every breakdown into SQL
 * groupBy(). There's currently no date filter in the UI, so this pulls the
 * whole table every time — fine at this size, but worth adding a date
 * bound back (see buildWhere) if the table grows into the tens of
 * thousands of rows.
 */

export interface EOfficeFilterParams {
  department?: string;
}

export function buildWhere(filters: EOfficeFilterParams): Prisma.E_OFFICE_STATSWhereInput {
  const where: Prisma.E_OFFICE_STATSWhereInput = {};
  if (filters.department) where.department_title = filters.department;
  return where;
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getFilteredRows(where: Prisma.E_OFFICE_STATSWhereInput): Promise<EOfficeStat[]> {
  const rows = await ftsDb.e_OFFICE_STATS.findMany({ where, orderBy: { date: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    date: toDateString(r.date),
    department_title: r.department_title,
    department_id: r.department_id,
    total_files: r.total_files,
    total_files_open: r.total_files_open,
    total_files_closed: r.total_files_closed,
    total_pending_files: r.total_pending_files,
    total_normal_files: r.total_normal_files,
    total_urgent_files: r.total_urgent_files,
    total_immediate_files: r.total_immediate_files,
    avg_turnaround_time: r.avg_turnaround_time,
    avg_file_response_time: r.avg_file_response_time,
  }));
}

// Filter options come from the FULL table, not the filtered subset, so the
// department dropdown never shrinks out from under the user as they narrow
// things down. Status/Priority option lists are just the fixed enum values
// the schema supports — no query needed for those.
export async function getFilterOptions(): Promise<EOfficeFilterOptions> {
  const departmentRows = await ftsDb.e_OFFICE_STATS.findMany({
    distinct: ["department_title"],
    select: { department_title: true },
  });

  return {
    departments: departmentRows.map((d) => d.department_title).sort(),
    statuses: ["Open", "Closed", "Pending"],
    priorities: ["Normal", "Urgent", "Immediate"],
  };
}

function sumBy(rows: EOfficeStat[], key: keyof EOfficeStat): number {
  return rows.reduce((s, r) => s + (Number(r[key]) || 0), 0);
}

function weightedAvg(rows: EOfficeStat[], valueKey: keyof EOfficeStat, weightKey: keyof EOfficeStat): number {
  let sw = 0;
  let swv = 0;
  for (const r of rows) {
    const w = Number(r[weightKey]) || 0;
    const v = Number(r[valueKey]) || 0;
    sw += w;
    swv += w * v;
  }
  return sw ? swv / sw : 0;
}

export function computeKpis(rows: EOfficeStat[]): EOfficeKpis {
  const totalFiles = sumBy(rows, "total_files");
  const closedFiles = sumBy(rows, "total_files_closed");

  return {
    totalFiles,
    openFiles: sumBy(rows, "total_files_open"),
    closedFiles,
    pendingFiles: sumBy(rows, "total_pending_files"),
    urgentFiles: sumBy(rows, "total_urgent_files"),
    immediateFiles: sumBy(rows, "total_immediate_files"),
    closureRate: totalFiles ? (closedFiles / totalFiles) * 100 : 0,
    avgTurnaroundTime: weightedAvg(rows, "avg_turnaround_time", "total_files"),
    avgResponseTime: weightedAvg(rows, "avg_file_response_time", "total_files"),
    departmentCount: new Set(rows.map((r) => r.department_title)).size,
  };
}

export function byDate(rows: EOfficeStat[]): DateTrendPoint[] {
  const map = new Map<string, DateTrendPoint>();
  for (const r of rows) {
    const existing = map.get(r.date) ?? { date: r.date, totalFiles: 0, openFiles: 0, closedFiles: 0, pendingFiles: 0 };
    existing.totalFiles += r.total_files;
    existing.openFiles += r.total_files_open;
    existing.closedFiles += r.total_files_closed;
    existing.pendingFiles += r.total_pending_files;
    map.set(r.date, existing);
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function weightedAvgByDepartment(rows: EOfficeStat[], valueKey: keyof EOfficeStat, n?: number): [string, number][] {
  const totals = new Map<string, number>();
  const weights = new Map<string, number>();
  for (const r of rows) {
    const w = r.total_files;
    totals.set(r.department_title, (totals.get(r.department_title) ?? 0) + Number(r[valueKey]) * w);
    weights.set(r.department_title, (weights.get(r.department_title) ?? 0) + w);
  }
  const sorted = Array.from(totals.entries())
    .map(([dept, total]) => {
      const w = weights.get(dept) ?? 0;
      return [dept, w ? Number((total / w).toFixed(1)) : 0] as [string, number];
    })
    .sort((a, b) => b[1] - a[1]);
  return n ? sorted.slice(0, n) : sorted;
}

export function turnaroundByDepartment(rows: EOfficeStat[], n = 15): [string, number][] {
  return weightedAvgByDepartment(rows, "avg_turnaround_time", n);
}

export function responseTimeByDepartment(rows: EOfficeStat[], n = 15): [string, number][] {
  return weightedAvgByDepartment(rows, "avg_file_response_time", n);
}

/** Turnaround vs response time per department — a genuine two-series
 * comparison, capped to the top 10 departments by file volume. */
export function turnaroundVsResponseByDepartment(rows: EOfficeStat[], n = 10): DepartmentTimeSplit[] {
  const volumeByDept = metricByDepartment(rows, "total");
  const turnaround = new Map(weightedAvgByDepartment(rows, "avg_turnaround_time"));
  const response = new Map(weightedAvgByDepartment(rows, "avg_file_response_time"));

  return volumeByDept.slice(0, n).map(([department]) => ({
    department,
    turnaround: turnaround.get(department) ?? 0,
    response: response.get(department) ?? 0,
  }));
}

export function statusBreakdown(rows: EOfficeStat[]): [string, number][] {
  return [
    ["Open", sumBy(rows, "total_files_open")],
    ["Closed", sumBy(rows, "total_files_closed")],
    ["Pending", sumBy(rows, "total_pending_files")],
  ].filter(([, v]) => v > 0) as [string, number][];
}

export function priorityBreakdown(rows: EOfficeStat[]): [string, number][] {
  return [
    ["Normal", sumBy(rows, "total_normal_files")],
    ["Urgent", sumBy(rows, "total_urgent_files")],
    ["Immediate", sumBy(rows, "total_immediate_files")],
  ].filter(([, v]) => v > 0) as [string, number][];
}

// ── Metric lens: the Status/Priority dropdowns don't filter rows out (each
// row already has every status/priority count as its own column) — instead
// they pick which single column stands in for "the" file count wherever a
// specific number is needed (the first KPI card, the department ranking
// chart). "total" is the default, unfiltered view.
export type EOfficeMetric = "total" | "open" | "closed" | "pending" | "normal" | "urgent" | "immediate";

const METRIC_COLUMN: Record<Exclude<EOfficeMetric, "total">, keyof EOfficeStat> = {
  open: "total_files_open",
  closed: "total_files_closed",
  pending: "total_pending_files",
  normal: "total_normal_files",
  urgent: "total_urgent_files",
  immediate: "total_immediate_files",
};

export const METRIC_LABEL: Record<EOfficeMetric, string> = {
  total: "Total Files",
  open: "Open Files",
  closed: "Closed Files",
  pending: "Pending Files",
  normal: "Normal Priority Files",
  urgent: "Urgent Priority Files",
  immediate: "Immediate Priority Files",
};

/** Status and Priority are mutually exclusive lenses — Status wins if
 * somehow both are set (e.g. a hand-edited URL). */
export function resolveMetric(status: string, priority: string): EOfficeMetric {
  const s = status.toLowerCase();
  if (s === "open" || s === "closed" || s === "pending") return s as EOfficeMetric;
  const p = priority.toLowerCase();
  if (p === "normal" || p === "urgent" || p === "immediate") return p as EOfficeMetric;
  return "total";
}

function metricValue(row: EOfficeStat, metric: EOfficeMetric): number {
  if (metric === "total") return row.total_files;
  return Number(row[METRIC_COLUMN[metric]]) || 0;
}

export function metricTotal(rows: EOfficeStat[], metric: EOfficeMetric): number {
  return rows.reduce((s, r) => s + metricValue(r, metric), 0);
}

export function metricByDepartment(rows: EOfficeStat[], metric: EOfficeMetric, n?: number): [string, number][] {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.department_title, (map.get(r.department_title) ?? 0) + metricValue(r, metric));
  }
  const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  return n ? sorted.slice(0, n) : sorted;
}
