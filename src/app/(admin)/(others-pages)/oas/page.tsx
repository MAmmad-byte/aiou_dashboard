import type { Metadata } from "next";
import OasDashboard from "@/components/oas/OasDashboard";
import {
  getAllOasData,
  filterOasData,
  getFilterOptions,
  resolveDefaultCountry,
  computeKpis,
  byProgram,
  byProvince,
  byRegion,
  byAgeBand,
  bySemester,
} from "@/lib/oas-data";

export const metadata: Metadata = {
  title: "OAS Admissions Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "Admissions summary dashboard, filterable via URL query string",
};

// Filters live entirely in the URL: /oas?semester=Autumn+2026&province=Punjab
// Bookmark or share a link and the filtered view comes back exactly as left.
//
// Next.js 15: searchParams is async — if you're on Next 14 or earlier, drop
// the `await` and change the prop type to a plain object instead of a Promise.
interface OasPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OasPage({ searchParams }: OasPageProps) {
  const params = await searchParams;
  const getParam = (key: string, fallback: string = "All") =>
    typeof params[key] === "string" ? (params[key] as string) : fallback;

  const allData = getAllOasData();
  const filterOptions = getFilterOptions(allData);
  // With no ?country= in the URL at all, default to Pakistan (falling back
  // to "All" only if Pakistan isn't actually present in the dataset) — every
  // other filter defaults to "All" as usual.
  const countryDefault = resolveDefaultCountry(filterOptions);

  const current = {
    country: getParam("country", countryDefault),
    semester: getParam("semester"),
    province: getParam("province"),
    region: getParam("region"),
    program: getParam("program"),
    ageBand: getParam("ageBand"),
  };

  const filtered = filterOasData(allData, {
    country: current.country !== "All" ? current.country : undefined,
    semester: current.semester !== "All" ? current.semester : undefined,
    province: current.province !== "All" ? current.province : undefined,
    region: current.region !== "All" ? current.region : undefined,
    program: current.program !== "All" ? current.program : undefined,
    ageBand: current.ageBand !== "All" ? current.ageBand : undefined,
  });

  const kpis = computeKpis(filtered);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <OasDashboard
          filterOptions={filterOptions}
          current={current}
          countryDefault={countryDefault}
          kpis={kpis}
          semesterTrend={bySemester(filtered)}
          byProgram={byProgram(filtered)}
          byProvince={byProvince(filtered)}
          byRegion={byRegion(filtered)}
          byAgeBand={byAgeBand(filtered)}
          records={filtered}
        />
      </div>
    </div>
  );
}
