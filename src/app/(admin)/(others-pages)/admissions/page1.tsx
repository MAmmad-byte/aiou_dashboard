import type { Metadata } from "next";
import AdmissionsDashboard from "@/components/admissions/AdmissionsDashboard";
import { AdmissionsTransitionProvider, AdmissionsFadeWrapper } from "@/components/admissions/AdmissionsTransitionProvider";
import AdmissionsLoadingOverlay from "@/components/admissions/AdmissionsLoadingOverlay";
import {
  buildWhere,
  getFilterOptions,
  resolveDefaultSemester,
  getFilteredRows,
  computeKpis,
  bySemester,
  genderBreakdown,
  freshVsContinuing,
  modeBreakdown,
  byAcadCareer,
  byCampus,
  byProvince,
  avgCoursesByCareer,
  freshVsContinuingByCareer,
  freshVsContinuingByRegion,
} from "@/lib/admissions-data";

export const metadata: Metadata = {
  title: "Admissions Dashboard | AIOU Dashboard",
  description: "University-wide admissions summary, filterable via URL query string",
};

// Same URL-driven interactivity and loading treatment as the other
// dashboards (/admissions?semester=2026+Spring&mode=Face+to+Face).
//
// Next.js 15: searchParams is async — on Next 14 or earlier, drop the
// `await` and change the prop type to a plain object instead of a Promise.
interface AdmissionsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdmissionsPage({ searchParams }: AdmissionsPageProps) {
  const params = await searchParams;
  const getParam = (key: string, fallback: string = "All") =>
    typeof params[key] === "string" ? (params[key] as string) : fallback;

  const filterOptions = await getFilterOptions();
  // No ?semester= in the URL at all defaults to the latest semester
  // (falls back to "All" only if the table is somehow empty) — this
  // mirrors the Year/Country/Intake default pattern on the other
  // dashboards. Explicitly setting ?semester=All still shows everything.
  const semesterDefault = resolveDefaultSemester(filterOptions);

  const current = {
    semester: getParam("semester", semesterDefault),
    mode: getParam("mode"),
    acadCareer: getParam("acadCareer"),
    campus: getParam("campus"),
  };

  const where = buildWhere({
    semester: current.semester !== "All" ? current.semester : undefined,
    mode: current.mode !== "All" ? current.mode : undefined,
    acadCareer: current.acadCareer !== "All" ? current.acadCareer : undefined,
    campus: current.campus !== "All" ? current.campus : undefined,
  });

  const rows = await getFilteredRows(where);
  const kpis = computeKpis(rows);

  return (
    <AdmissionsTransitionProvider>
      <div className="relative grid grid-cols-12 gap-4 md:gap-6">
        <AdmissionsLoadingOverlay />
        <div className="col-span-12">
          <AdmissionsFadeWrapper>
            <AdmissionsDashboard
              filterOptions={filterOptions}
              current={current}
              semesterDefault={semesterDefault}
              kpis={kpis}
              trend={bySemester(rows)}
              gender={genderBreakdown(rows)}
              freshVsContinuing={freshVsContinuing(rows)}
              mode={modeBreakdown(rows)}
              byCareer={byAcadCareer(rows)}
              byCampus={byCampus(rows, 15)}
              byProvince={byProvince(rows, 15)}
              avgCoursesByCareer={avgCoursesByCareer(rows)}
              freshVsContinuingByCareer={freshVsContinuingByCareer(rows)}
              freshVsContinuingByRegion={freshVsContinuingByRegion(rows, 20)}
            />
          </AdmissionsFadeWrapper>
        </div>
      </div>
    </AdmissionsTransitionProvider>
  );
}
