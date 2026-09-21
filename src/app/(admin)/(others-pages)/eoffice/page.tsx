import type { Metadata } from "next";
import EOfficeDashboard from "@/components/eoffice/EOfficeDashboard";
import { EOfficeTransitionProvider, EOfficeFadeWrapper } from "@/components/eoffice/EOfficeTransitionProvider";
import EOfficeLoadingOverlay from "@/components/eoffice/EOfficeLoadingOverlay";
import {
  buildWhere,
  getFilterOptions,
  getFilteredRows,
  computeKpis,
  statusBreakdown,
  priorityBreakdown,
  turnaroundByDepartment,
  responseTimeByDepartment,
  turnaroundVsResponseByDepartment,
  resolveMetric,
  metricTotal,
  metricByDepartment,
  METRIC_LABEL,
} from "@/lib/eoffice-data";

export const metadata: Metadata = {
  title: "E-Office Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "E-Office file allocation dashboard, filterable via URL query string",
};

// URL-driven filters (/eoffice?department=IT&status=Open) plus the same
// transition-overlay treatment as CMS/TMS. Status and Priority don't filter
// rows (see lib/eoffice-data.ts) — they pick which column the primary KPI
// card and the department ranking chart key off of.
//
// Next.js 15: searchParams is async — on Next 14 or earlier, drop the
// `await` and change the prop type to a plain object instead of a Promise.
interface EOfficePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EOfficePage({ searchParams }: EOfficePageProps) {
  const params = await searchParams;
  const getParam = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "All");

  const filterOptions = await getFilterOptions();

  const current = {
    department: getParam("department"),
    status: getParam("status"),
    priority: getParam("priority"),
  };

  const where = buildWhere({
    department: current.department !== "All" ? current.department : undefined,
  });

  const rows = await getFilteredRows(where);
  const kpis = computeKpis(rows);

  const metric = resolveMetric(current.status, current.priority);
  const metricLabel = METRIC_LABEL[metric];
  const metricValue = metricTotal(rows, metric);
  const metricDeptBreakdown = metricByDepartment(rows, metric, 15);

  return (
    <EOfficeTransitionProvider>
      <div className="relative grid grid-cols-12 gap-4 md:gap-6">
        <EOfficeLoadingOverlay />
        <div className="col-span-12">
          <EOfficeFadeWrapper>
            <EOfficeDashboard
              filterOptions={filterOptions}
              current={current}
              kpis={kpis}
              metricLabel={metricLabel}
              metricValue={metricValue}
              metricByDepartment={metricDeptBreakdown}
              statusBreakdown={statusBreakdown(rows)}
              priorityBreakdown={priorityBreakdown(rows)}
              turnaroundByDepartment={turnaroundByDepartment(rows, 15)}
              responseTimeByDepartment={responseTimeByDepartment(rows, 15)}
              turnaroundVsResponse={turnaroundVsResponseByDepartment(rows, 10)}
            />
          </EOfficeFadeWrapper>
        </div>
      </div>
    </EOfficeTransitionProvider>
  );
}
