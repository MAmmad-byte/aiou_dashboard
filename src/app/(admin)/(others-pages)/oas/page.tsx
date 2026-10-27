import type { Metadata } from "next";
import OasApplicantDashboard from "@/components/oas/OasApplicantDashboard";
import { OasApplicantTransitionProvider, OasApplicantFadeWrapper } from "@/components/oas/OasApplicantTransitionProvider";
import OasApplicantLoadingOverlay from "@/components/oas/OasApplicantLoadingOverlay";
import {
  buildWhere,
  getFilterOptions,
  resolveDefaultSemester,
  computeKpis,
  bySemester,
  statusBreakdown,
  genderBreakdown,
  ageBandBreakdown,
  byRegionTop,
  byProgramTop,
  byCountryTop,
} from "@/lib/oas-applicant-data";

export const metadata: Metadata = {
  title: "OAS Applicants | AIOU Dashboard",
  description: "OAS applicant funnel by semester, region, and program — filterable via URL query string",
};

// /oas-applicants?semester=Autumn-2026&region=Punjab&program=B.ED%20(1.5%20YEAR)
//
// Next.js 15: searchParams is async — on Next 14 or earlier, drop the
// `await` and change the prop type to a plain object instead of a Promise.
interface OasApplicantsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OasApplicantsPage({ searchParams }: OasApplicantsPageProps) {
  const params = await searchParams;
  const getParam = (key: string, fallback: string = "All") =>
    typeof params[key] === "string" ? (params[key] as string) : fallback;

  const filterOptions = await getFilterOptions();
  // No ?semester= in the URL at all defaults to the latest semester
  // (falls back to "All" only if the table is somehow empty) — same
  // convention as every other dashboard here. Explicitly setting
  // ?semester=All still shows everything.
  const semesterDefault = resolveDefaultSemester(filterOptions);

  const current = {
    semester: getParam("semester", semesterDefault),
    region: getParam("region"),
    program: getParam("program"),
  };

  const where = buildWhere({
    semester: current.semester !== "All" ? current.semester : undefined,
    region: current.region !== "All" ? current.region : undefined,
    program: current.program !== "All" ? current.program : undefined,
  });

  const kpis = await computeKpis(where);

  const [trend, status, gender, ageBands, byRegion, byProgram, byCountry] = await Promise.all([
    bySemester(where),
    statusBreakdown(kpis),
    genderBreakdown(where),
    ageBandBreakdown(where),
    byRegionTop(where, 15),
    // A selected Region narrows programs enough that a higher limit is
    // still readable — same "widen the breakdown once a filter narrows
    // the rest" pattern used for Program Trending's program-group scoping.
    byProgramTop(where, current.region !== "All" ? 25 : 15),
    byCountryTop(where, 10),
  ]);

  return (
    <OasApplicantTransitionProvider>
      <div className="relative grid grid-cols-12 gap-4 md:gap-6">
        <OasApplicantLoadingOverlay />
        <div className="col-span-12">
          <OasApplicantFadeWrapper>
            <OasApplicantDashboard
              filterOptions={filterOptions}
              current={current}
              semesterDefault={semesterDefault}
              kpis={kpis}
              trend={trend}
              statusBreakdown={status}
              gender={gender}
              ageBands={ageBands}
              byRegion={byRegion}
              byProgram={byProgram}
              byCountry={byCountry}
            />
          </OasApplicantFadeWrapper>
        </div>
      </div>
    </OasApplicantTransitionProvider>
  );
}
