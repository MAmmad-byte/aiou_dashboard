import type { Metadata } from "next";
import CmsDashboard from "@/components/cms/CmsDashboard";
import { CmsTransitionProvider, CmsFadeWrapper } from "@/components/cms/CmsTransitionProvider";
import CmsLoadingOverlay from "@/components/cms/CmsLoadingOverlay";
import {
  buildWhere,
  getFilterOptions,
  resolveDefaultYear,
  computeKpis,
  byIntakePeriod,
  byCareer,
  byMode,
  byRegionTop,
  byProgramTop,
  genderByCareer,
  discontinuationRateByCareer,
  countRows,
} from "@/lib/cms-data";

export const metadata: Metadata = {
  title: "CMS Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "Admissions & enrollment summary dashboard, filterable via URL query string",
};

// Same URL-driven interactivity as before
// (/cms?year=2025&region=LAHORE+REGION&career=16BH&page=2) — the difference
// now is every one of these reads runs as a SQL query (WHERE + GROUP BY +
// LIMIT/OFFSET) against CMS_STATS instead of scanning an in-memory array, so
// there's no 85k-row dataset sitting in server memory at all anymore.
//
// Next.js 15: searchParams is async — on Next 14 or earlier, drop the
// `await` and change the prop type to a plain object instead of a Promise.
interface CmsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CmsPage({ searchParams }: CmsPageProps) {
  const params = await searchParams;
  const getParam = (key: string, fallback: string = "All") =>
    typeof params[key] === "string" ? (params[key] as string) : fallback;

  const filterOptions = await getFilterOptions();
  // No ?year= in the URL at all defaults to the latest year in the dataset
  // (falls back to "All" only if the table is somehow empty).
  const yearDefault = resolveDefaultYear(filterOptions);

  const current = {
    year: getParam("year", yearDefault),
    season: getParam("season"),
    region: getParam("region"),
    career: getParam("career"),
    program: getParam("program"),
    mode: getParam("mode"),
  };

  const where = buildWhere({
    year: current.year !== "All" ? current.year : undefined,
    season: current.season !== "All" ? current.season : undefined,
    region: current.region !== "All" ? current.region : undefined,
    career: current.career !== "All" ? current.career : undefined,
    program: current.program !== "All" ? current.program : undefined,
    mode: current.mode !== "All" ? current.mode : undefined,
  });

  // Every chart/KPI query runs in parallel — they're independent SQL
  // statements, so there's no reason to await them one at a time.
  const [kpis, trend, career, mode, topPrograms, topRegions, genderCareer, discontinuationRate, totalRows] =
    await Promise.all([
      computeKpis(where),
      byIntakePeriod(where),
      byCareer(where),
      byMode(where),
      byProgramTop(where, 15),
      byRegionTop(where, 15),
      genderByCareer(where),
      discontinuationRateByCareer(where),
      countRows(where),
    ]);

  return (
    <CmsTransitionProvider>
      <div className="relative grid grid-cols-12 gap-4 md:gap-6">
        <CmsLoadingOverlay />
        <div className="col-span-12">
          <CmsFadeWrapper>
            <CmsDashboard
              filterOptions={filterOptions}
              current={current}
              yearDefault={yearDefault}
              kpis={kpis}
              trend={trend}
              byCareer={career}
              byMode={mode}
              topPrograms={topPrograms}
              topRegions={topRegions}
              genderByCareer={genderCareer}
              discontinuationRate={discontinuationRate}
              transgender={kpis.transgender}
              totalRows={totalRows}
            />
          </CmsFadeWrapper>
        </div>
      </div>
    </CmsTransitionProvider>
  );
}
