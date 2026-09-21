// import { Prisma } from "@/generated/fts-client";
// import { ftsDb } from "@/lib/prisma";
// import {
//   ErpFilterOptions,
//   ErpKpis,
//   FiscalYearTrendPoint,
//   CampusComparisonPoint,
//   DepartmentFinancials,
// } from "@/types/erp";

// /**
//  * ERP_STATS is ~51k rows — closer to CMS_STATS's 85k than to the
//  * EOffice/TMS tables' few hundred, so this pushes every filter and
//  * breakdown into SQL (WHERE + GROUP BY + ORDER BY + LIMIT) the same way
//  * lib/cms-data.ts does, rather than fetching the matching rows and
//  * reducing them in Node.
//  */

// export interface ErpFilterParams {
//   campus?: string;
//   department?: string;
//   budgetType?: string;
//   fiscalYear?: string;
// }

// export function buildWhere(filters: ErpFilterParams): Prisma.ERP_STATSWhereInput {
//   const where: Prisma.ERP_STATSWhereInput = {};
//   if (filters.campus) where.campus = filters.campus;
//   if (filters.department) where.dept_title = filters.department;
//   if (filters.budgetType) where.budget_type = filters.budgetType;
//   if (filters.fiscalYear) where.fiscal_year = filters.fiscalYear;
//   return where;
// }

// // Campus/BudgetType/FiscalYear options come from the FULL table. Department
// // options are scoped to the selected campus (if any) — Main Campus and a
// // Regional Office don't share department sets, so this keeps the dropdown
// // from listing ~85 departments most of which don't exist under whichever
// // Regional Office is selected.
// export async function getFilterOptions(campus?: string): Promise<ErpFilterOptions> {
//   const [campusRows, deptRows, budgetTypeRows, fiscalYearRows] = await Promise.all([
//     ftsDb.eRP_STATS.findMany({ distinct: ["campus"], select: { campus: true }, where: { campus: { not: null } } }),
//     ftsDb.eRP_STATS.findMany({
//       distinct: ["dept_title"],
//       select: { dept_title: true },
//       where: { dept_title: { not: null }, ...(campus ? { campus } : {}) },
//     }),
//     ftsDb.eRP_STATS.findMany({ distinct: ["budget_type"], select: { budget_type: true }, where: { budget_type: { not: null } } }),
//     ftsDb.eRP_STATS.findMany({ distinct: ["fiscal_year"], select: { fiscal_year: true }, where: { fiscal_year: { not: null } } }),
//   ]);

//   return {
//     campuses: campusRows.map((r) => r.campus as string).sort(),
//     departments: deptRows.map((r) => r.dept_title as string).sort(),
//     budgetTypes: budgetTypeRows.map((r) => r.budget_type as string).sort(),
//     fiscalYears: fiscalYearRows.map((r) => r.fiscal_year as string).sort(),
//   };
// }

// export async function computeKpis(where: Prisma.ERP_STATSWhereInput): Promise<ErpKpis> {
//   const [sums, deptRows, campusRows] = await Promise.all([
//     ftsDb.eRP_STATS.aggregate({
//       where,
//       _sum: { commitment: true, expense: true, balance: true, encumbrance: true, pre_encumbrance: true },
//     }),
//     ftsDb.eRP_STATS.findMany({ where, distinct: ["dept_title"], select: { dept_title: true } }),
//     ftsDb.eRP_STATS.findMany({ where, distinct: ["campus"], select: { campus: true } }),
//   ]);

//   const totalCommitment = sums._sum.commitment ?? 0;
//   const totalExpense = sums._sum.expense ?? 0;

//   return {
//     totalCommitment,
//     totalExpense,
//     totalBalance: sums._sum.balance ?? 0,
//     totalEncumbrance: sums._sum.encumbrance ?? 0,
//     totalPreEncumbrance: sums._sum.pre_encumbrance ?? 0,
//     utilizationRate: totalCommitment ? (totalExpense / totalCommitment) * 100 : 0,
//     departmentCount: deptRows.length,
//     campusCount: campusRows.length,
//   };
// }

// export async function byFiscalYear(where: Prisma.ERP_STATSWhereInput): Promise<FiscalYearTrendPoint[]> {
//   const rows = await ftsDb.eRP_STATS.groupBy({
//     by: ["fiscal_year"],
//     where,
//     _sum: { commitment: true, expense: true, balance: true },
//   });

//   return rows
//     .filter((r) => r.fiscal_year)
//     .map((r) => ({
//       fiscalYear: r.fiscal_year as string,
//       commitment: r._sum.commitment ?? 0,
//       expense: r._sum.expense ?? 0,
//       balance: r._sum.balance ?? 0,
//     }))
//     .sort((a, b) => a.fiscalYear.localeCompare(b.fiscalYear));
// }

// export async function byBudgetType(where: Prisma.ERP_STATSWhereInput): Promise<[string, number][]> {
//   const rows = await ftsDb.eRP_STATS.groupBy({
//     by: ["budget_type"],
//     where,
//     _sum: { commitment: true },
//     orderBy: { _sum: { commitment: "desc" } },
//   });
//   return rows.filter((r) => r.budget_type).map((r) => [r.budget_type as string, r._sum.commitment ?? 0]);
// }

// /** Top departments by commitment — respects the Campus filter, so this is
//  * effectively "top departments within the selected campus". Computed in SQL
//  * with ORDER BY + LIMIT, not by pulling every department and slicing in JS. */
// export async function byDepartmentTop(where: Prisma.ERP_STATSWhereInput, n = 15): Promise<[string, number][]> {
//   const rows = await ftsDb.eRP_STATS.groupBy({
//     by: ["dept_title"],
//     where,
//     _sum: { commitment: true },
//     orderBy: { _sum: { commitment: "desc" } },
//     take: n,
//   });
//   return rows.filter((r) => r.dept_title).map((r) => [r.dept_title as string, r._sum.commitment ?? 0]);
// }

// /** Top accounts by expense — respects Campus + Department, so this is the
//  * "detail of account in graphical form" view: pick a department, this chart
//  * becomes that department's account-level expense breakdown. */
// export async function byAccountTop(where: Prisma.ERP_STATSWhereInput, n = 15): Promise<[string, number][]> {
//   const rows = await ftsDb.eRP_STATS.groupBy({
//     by: ["account_title"],
//     where,
//     _sum: { expense: true },
//     orderBy: { _sum: { expense: "desc" } },
//     take: n,
//   });
//   return rows.filter((r) => r.account_title).map((r) => [r.account_title as string, r._sum.expense ?? 0]);
// }

// /** Expense vs Commitment per campus — a genuine two-series comparison,
//  * capped to the top 15 campuses by commitment. */
// export async function campusComparison(where: Prisma.ERP_STATSWhereInput, n = 15): Promise<CampusComparisonPoint[]> {
//   const rows = await ftsDb.eRP_STATS.groupBy({
//     by: ["campus"],
//     where,
//     _sum: { commitment: true, expense: true },
//     orderBy: { _sum: { commitment: "desc" } },
//     take: n,
//   });
//   return rows
//     .filter((r) => r.campus)
//     .map((r) => ({ campus: r.campus as string, commitment: r._sum.commitment ?? 0, expense: r._sum.expense ?? 0 }));
// }

// /** Commitment / Expense / Balance per department — top 10 departments by
//  * commitment, for a three-series comparison chart. */
// export async function departmentFinancials(where: Prisma.ERP_STATSWhereInput, n = 10): Promise<DepartmentFinancials[]> {
//   const rows = await ftsDb.eRP_STATS.groupBy({
//     by: ["dept_title"],
//     where,
//     _sum: { commitment: true, expense: true, balance: true },
//     orderBy: { _sum: { commitment: "desc" } },
//     take: n,
//   });
//   return rows
//     .filter((r) => r.dept_title)
//     .map((r) => ({
//       department: r.dept_title as string,
//       commitment: r._sum.commitment ?? 0,
//       expense: r._sum.expense ?? 0,
//       balance: r._sum.balance ?? 0,
//     }));
// }

// /** Utilization rate (%) per campus, ranked descending. Division isn't
//  * expressible in a single SQL aggregate through Prisma, but with at most a
//  * few dozen campuses returned, computing the ratio client-side afterward is
//  * negligible — same approach as CMS's discontinuationRateByCareer. */
// export async function utilizationRateByCampus(where: Prisma.ERP_STATSWhereInput, n = 15): Promise<[string, number][]> {
//   const rows = await ftsDb.eRP_STATS.groupBy({
//     by: ["campus"],
//     where,
//     _sum: { commitment: true, expense: true },
//   });
//   return rows
//     .filter((r) => r.campus)
//     .map((r) => {
//       const commitment = r._sum.commitment ?? 0;
//       const expense = r._sum.expense ?? 0;
//       return [r.campus as string, commitment ? Number(((expense / commitment) * 100).toFixed(1)) : 0] as [string, number];
//     })
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, n);
// }
import { Prisma } from "@/generated/fts-client";
import { ftsDb } from "@/lib/prisma";
import {
  ErpFilterOptions,
  ErpKpis,
  FiscalYearTrendPoint,
  CampusComparisonPoint,
  DepartmentFinancials,
} from "@/types/erp";

// Re-exported so callers can `import { FiscalYearTrendPoint, ... } from
// "@/lib/erp-data"` — matches how ErpCharts.tsx and ErpDashboard.tsx
// actually import these, keeping all the aggregate result types
// importable from this one module (these are the *types*, distinct from
// the same-named functions campusComparison() and departmentFinancials()
// also exported below).
export type { FiscalYearTrendPoint, CampusComparisonPoint, DepartmentFinancials };

/**
 * ERP_STATS is ~51k rows — closer to CMS_STATS's 85k than to the
 * EOffice/TMS tables' few hundred, so this pushes every filter and
 * breakdown into SQL (WHERE + GROUP BY + ORDER BY + LIMIT) the same way
 * lib/cms-data.ts does, rather than fetching the matching rows and
 * reducing them in Node.
 */

export interface ErpFilterParams {
  campus?: string;
  department?: string;
  budgetType?: string;
  fiscalYear?: string;
}

export function buildWhere(filters: ErpFilterParams): Prisma.ERP_STATSWhereInput {
  const where: Prisma.ERP_STATSWhereInput = {};
  if (filters.campus) where.campus = filters.campus;
  if (filters.department) where.dept_title = filters.department;
  if (filters.budgetType) where.budget_type = filters.budgetType;
  if (filters.fiscalYear) where.fiscal_year = filters.fiscalYear;
  return where;
}

// Campus/BudgetType/FiscalYear options come from the FULL table. Department
// options are scoped to the selected campus (if any) — Main Campus and a
// Regional Office don't share department sets, so this keeps the dropdown
// from listing ~85 departments most of which don't exist under whichever
// Regional Office is selected.
export async function getFilterOptions(campus?: string): Promise<ErpFilterOptions> {
  const [campusRows, deptRows, budgetTypeRows, fiscalYearRows] = await Promise.all([
    ftsDb.eRP_STATS.findMany({ distinct: ["campus"], select: { campus: true }, where: { campus: { not: null } } }),
    ftsDb.eRP_STATS.findMany({
      distinct: ["dept_title"],
      select: { dept_title: true },
      where: { dept_title: { not: null }, ...(campus ? { campus } : {}) },
    }),
    ftsDb.eRP_STATS.findMany({ distinct: ["budget_type"], select: { budget_type: true }, where: { budget_type: { not: null } } }),
    ftsDb.eRP_STATS.findMany({ distinct: ["fiscal_year"], select: { fiscal_year: true }, where: { fiscal_year: { not: null } } }),
  ]);

  return {
    campuses: campusRows.map((r) => r.campus as string).sort(),
    departments: deptRows.map((r) => r.dept_title as string).sort(),
    budgetTypes: budgetTypeRows.map((r) => r.budget_type as string).sort(),
    fiscalYears: fiscalYearRows.map((r) => r.fiscal_year as string).sort(),
  };
}

export async function computeKpis(where: Prisma.ERP_STATSWhereInput): Promise<ErpKpis> {
  const [sums, deptRows, campusRows] = await Promise.all([
    ftsDb.eRP_STATS.aggregate({
      where,
      _sum: { commitment: true, expense: true, balance: true, encumbrance: true, pre_encumbrance: true },
    }),
    ftsDb.eRP_STATS.findMany({ where, distinct: ["dept_title"], select: { dept_title: true } }),
    ftsDb.eRP_STATS.findMany({ where, distinct: ["campus"], select: { campus: true } }),
  ]);

  const totalCommitment = sums._sum.commitment ?? 0;
  const totalExpense = sums._sum.expense ?? 0;

  return {
    totalCommitment,
    totalExpense,
    totalBalance: sums._sum.balance ?? 0,
    totalEncumbrance: sums._sum.encumbrance ?? 0,
    totalPreEncumbrance: sums._sum.pre_encumbrance ?? 0,
    utilizationRate: totalCommitment ? (totalExpense / totalCommitment) * 100 : 0,
    departmentCount: deptRows.length,
    campusCount: campusRows.length,
  };
}

export async function byFiscalYear(where: Prisma.ERP_STATSWhereInput): Promise<FiscalYearTrendPoint[]> {
  const rows = await ftsDb.eRP_STATS.groupBy({
    by: ["fiscal_year"],
    where,
    _sum: { commitment: true, expense: true, balance: true },
  });

  return rows
    .filter((r) => r.fiscal_year)
    .map((r) => ({
      fiscalYear: r.fiscal_year as string,
      commitment: r._sum.commitment ?? 0,
      expense: r._sum.expense ?? 0,
      balance: r._sum.balance ?? 0,
    }))
    .sort((a, b) => a.fiscalYear.localeCompare(b.fiscalYear));
}

export async function byBudgetType(where: Prisma.ERP_STATSWhereInput): Promise<[string, number][]> {
  const rows = await ftsDb.eRP_STATS.groupBy({
    by: ["budget_type"],
    where,
    _sum: { commitment: true },
    orderBy: { _sum: { commitment: "desc" } },
  });
  return rows.filter((r) => r.budget_type).map((r) => [r.budget_type as string, r._sum.commitment ?? 0]);
}

/** Top departments by commitment — respects the Campus filter, so this is
 * effectively "top departments within the selected campus". Computed in SQL
 * with ORDER BY + LIMIT, not by pulling every department and slicing in JS. */
export async function byDepartmentTop(where: Prisma.ERP_STATSWhereInput, n = 15): Promise<[string, number][]> {
  const rows = await ftsDb.eRP_STATS.groupBy({
    by: ["dept_title"],
    where,
    _sum: { commitment: true },
    orderBy: { _sum: { commitment: "desc" } },
    take: n,
  });
  return rows.filter((r) => r.dept_title).map((r) => [r.dept_title as string, r._sum.commitment ?? 0]);
}

/** Top accounts by expense — respects Campus + Department, so this is the
 * "detail of account in graphical form" view: pick a department, this chart
 * becomes that department's account-level expense breakdown. */
export async function byAccountTop(where: Prisma.ERP_STATSWhereInput, n = 15): Promise<[string, number][]> {
  const rows = await ftsDb.eRP_STATS.groupBy({
    by: ["account_title"],
    where,
    _sum: { expense: true },
    orderBy: { _sum: { expense: "desc" } },
    take: n,
  });
  return rows.filter((r) => r.account_title).map((r) => [r.account_title as string, r._sum.expense ?? 0]);
}

/** Expense vs Commitment per campus — a genuine two-series comparison,
 * capped to the top 15 campuses by commitment. */
export async function campusComparison(where: Prisma.ERP_STATSWhereInput, n = 15): Promise<CampusComparisonPoint[]> {
  const rows = await ftsDb.eRP_STATS.groupBy({
    by: ["campus"],
    where,
    _sum: { commitment: true, expense: true },
    orderBy: { _sum: { commitment: "desc" } },
    take: n,
  });
  return rows
    .filter((r) => r.campus)
    .map((r) => ({ campus: r.campus as string, commitment: r._sum.commitment ?? 0, expense: r._sum.expense ?? 0 }));
}

/** Commitment / Expense / Balance per department — top 10 departments by
 * commitment, for a three-series comparison chart. */
export async function departmentFinancials(where: Prisma.ERP_STATSWhereInput, n = 10): Promise<DepartmentFinancials[]> {
  const rows = await ftsDb.eRP_STATS.groupBy({
    by: ["dept_title"],
    where,
    _sum: { commitment: true, expense: true, balance: true },
    orderBy: { _sum: { commitment: "desc" } },
    take: n,
  });
  return rows
    .filter((r) => r.dept_title)
    .map((r) => ({
      department: r.dept_title as string,
      commitment: r._sum.commitment ?? 0,
      expense: r._sum.expense ?? 0,
      balance: r._sum.balance ?? 0,
    }));
}

/** Utilization rate (%) per campus, ranked descending. Division isn't
 * expressible in a single SQL aggregate through Prisma, but with at most a
 * few dozen campuses returned, computing the ratio client-side afterward is
 * negligible — same approach as CMS's discontinuationRateByCareer. */
export async function utilizationRateByCampus(where: Prisma.ERP_STATSWhereInput, n = 15): Promise<[string, number][]> {
  const rows = await ftsDb.eRP_STATS.groupBy({
    by: ["campus"],
    where,
    _sum: { commitment: true, expense: true },
  });
  return rows
    .filter((r) => r.campus)
    .map((r) => {
      const commitment = r._sum.commitment ?? 0;
      const expense = r._sum.expense ?? 0;
      return [r.campus as string, commitment ? Number(((expense / commitment) * 100).toFixed(1)) : 0] as [string, number];
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}