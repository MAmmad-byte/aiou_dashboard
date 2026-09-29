import type { Metadata } from "next";
import ErpDashboard from "@/components/erp/ErpDashboard";
import { ErpTransitionProvider, ErpFadeWrapper } from "@/components/erp/ErpTransitionProvider";
import ErpLoadingOverlay from "@/components/erp/ErpLoadingOverlay";
import {
  buildWhere,
  getFilterOptions,
  computeKpis,
  byFiscalYear,
  byBudgetType,
  byDepartmentTop,
  byAccountTop,
  campusComparison,
  departmentFinancials,
  utilizationRateByCampus,
} from "@/lib/erp-data";

export const metadata: Metadata = {
  title: "ERP Budget Dashboard | AIOU Dashboard",
  description: "Departmental budget dashboard, filterable via URL query string",
};

// Same URL-driven interactivity as before
// (/erp?campus=Main+Campus&department=Registrar+Department) — the
// difference now is every one of these reads runs as a SQL query
// (WHERE + GROUP BY + LIMIT/OFFSET) against ERP_STATS instead of scanning
// an in-memory array, so there's no ~51k-row dataset sitting in server
// memory at all anymore.
//
// Next.js 15: searchParams is async — on Next 14 or earlier, drop the
// `await` and change the prop type to a plain object instead of a Promise.
interface ErpPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ErpPage({ searchParams }: ErpPageProps) {
  const params = await searchParams;
  const getParam = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "All");

  const current = {
    campus: getParam("campus"),
    department: getParam("department"),
    budgetType: getParam("budgetType"),
    fiscalYear: getParam("fiscalYear"),
  };

  const filterOptions = await getFilterOptions(current.campus !== "All" ? current.campus : undefined);

  const where = buildWhere({
    campus: current.campus !== "All" ? current.campus : undefined,
    department: current.department !== "All" ? current.department : undefined,
    budgetType: current.budgetType !== "All" ? current.budgetType : undefined,
    fiscalYear: current.fiscalYear !== "All" ? current.fiscalYear : undefined,
  });

  // Every chart/KPI query runs in parallel — they're independent SQL
  // statements, so there's no reason to await them one at a time.
  const [kpis, trend, budgetType, topDepartments, topAccounts, campusData, deptFinancials, utilByCampus] =
    await Promise.all([
      computeKpis(where),
      byFiscalYear(where),
      byBudgetType(where),
      byDepartmentTop(where, 15),
      byAccountTop(where, 15),
      campusComparison(where, 15),
      departmentFinancials(where, 10),
      utilizationRateByCampus(where, 15),
    ]);

  return (
    <ErpTransitionProvider>
      <div className="relative grid grid-cols-12 gap-4 md:gap-6">
        <ErpLoadingOverlay />
        <div className="col-span-12">
          <ErpFadeWrapper>
            <ErpDashboard
              filterOptions={filterOptions}
              current={current}
              kpis={kpis}
              trend={trend}
              campusComparison={campusData}
              budgetType={budgetType}
              topDepartments={topDepartments}
              topAccounts={topAccounts}
              departmentFinancials={deptFinancials}
              utilizationByCampus={utilByCampus}
            />
          </ErpFadeWrapper>
        </div>
      </div>
    </ErpTransitionProvider>
  );
}
