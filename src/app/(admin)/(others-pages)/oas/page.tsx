import type { Metadata } from "next";
import TrendingDashboard from "@/components/oas/TrendingDashboard";
import { TrendingTransitionProvider, TrendingFadeWrapper } from "@/components/oas/TrendingTransitionProvider";
import TrendingLoadingOverlay from "@/components/oas/TrendingLoadingOverlay";
import {
  buildWhere,
  getFilterOptions,
  resolveDefaultIntake,
  getFilteredRows,
  computeKpis,
  byIntake,
  byProgramGroup,
  topProgramsBySubmitted,
  feeChannelBreakdown,
  statusBreakdown,
  submissionByProgramGroup,
  verificationRateByProgramGroup,
} from "@/lib/oas-data";

export const metadata: Metadata = {
  title: "Program Trending Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "OAS admissions application funnel by program, filterable via URL query string",
};

// Same URL-driven interactivity and loading treatment as the other
// dashboards (/program-trending?programGroup=16BH&intake=Autumn+2026).
//
// Next.js 15: searchParams is async — on Next 14 or earlier, drop the
// `await` and change the prop type to a plain object instead of a Promise.
interface TrendingPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProgramTrendingPage({ searchParams }: TrendingPageProps) {
  const params = await searchParams;
  const getParam = (key: string, fallback: string = "All") =>
    typeof params[key] === "string" ? (params[key] as string) : fallback;

  const current = {
    programGroup: getParam("programGroup"),
    program: getParam("program"),
    intake: "All", // resolved below once we know the default
  };

  const filterOptions = await getFilterOptions(current.programGroup !== "All" ? current.programGroup : undefined);
  // No ?intake= in the URL at all defaults to the latest intake in the
  // dataset (falls back to "All" only if the table is somehow empty).
  const intakeDefault = resolveDefaultIntake(filterOptions);
  current.intake = getParam("intake", intakeDefault);

  const where = buildWhere({
    programGroup: current.programGroup !== "All" ? current.programGroup : undefined,
    program: current.program !== "All" ? current.program : undefined,
    intake: current.intake !== "All" ? current.intake : undefined,
  });

  const rows = await getFilteredRows(where);
  const kpis = computeKpis(rows);

  // With a Program Group selected, show a much fuller program-wise
  // breakdown (up to 40) instead of the generic "top 15 overall" — a
  // career like 16BH has ~118 programs, and 15 wasn't nearly enough to
  // represent "the programs that fall under this career."
  const programChartLimit = current.programGroup !== "All" ? 40 : 15;

  return (
    <TrendingTransitionProvider>
      <div className="relative grid grid-cols-12 gap-4 md:gap-6">
        <TrendingLoadingOverlay />
        <div className="col-span-12">
          <TrendingFadeWrapper>
            <TrendingDashboard
              filterOptions={filterOptions}
              current={current}
              intakeDefault={intakeDefault}
              kpis={kpis}
              trend={byIntake(rows)}
              feeChannel={feeChannelBreakdown(rows)}
              statusBreakdown={statusBreakdown(rows)}
              byProgramGroup={byProgramGroup(rows)}
              submissionByGroup={submissionByProgramGroup(rows)}
              topPrograms={topProgramsBySubmitted(rows, programChartLimit)}
              verificationRateByGroup={verificationRateByProgramGroup(rows)}
            />
          </TrendingFadeWrapper>
        </div>
      </div>
    </TrendingTransitionProvider>
  );
}
