import type { Metadata } from "next";
import LmsDashboard from "@/components/lms/LmsDashboard";
import {
  getAllLmsData,
  filterLmsData,
  getFilterOptions,
  resolveDefaultCountry,
  computeKpis,
  bySemester,
  byCountryEnrollment,
  byProgramStudents,
  byRegionStudents,
  byProgramCourses,
  avgPerStudentByProgram,
} from "@/lib/lms-data";

export const metadata: Metadata = {
  title: "LMS Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "Learning management summary dashboard, filterable via URL query string",
};

// Same interactivity as the OAS dashboard: every filter lives in the URL
// (/lms?semester=Autumn+2026&program=BS+Computer+Science&region=Lahore+Region),
// so filtered views are shareable, bookmarkable, and survive back/forward.
//
// Next.js 15: searchParams is async — if you're on Next 14 or earlier, drop
// the `await` and change the prop type to a plain object instead of a Promise.
interface LmsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LmsPage({ searchParams }: LmsPageProps) {
  const params = await searchParams;
  const getParam = (key: string, fallback: string = "All") =>
    typeof params[key] === "string" ? (params[key] as string) : fallback;

  const allData = getAllLmsData();
  const filterOptions = getFilterOptions(allData);
  // No ?country= in the URL at all defaults to Pakistan (falls back to "All"
  // only if Pakistan isn't actually present) — every other filter defaults
  // to "All" as usual.
  const countryDefault = resolveDefaultCountry(filterOptions);

  const current = {
    country: getParam("country", countryDefault),
    semester: getParam("semester"),
    program: getParam("program"),
    region: getParam("region"),
  };

  const filtered = filterLmsData(allData, {
    country: current.country !== "All" ? current.country : undefined,
    semester: current.semester !== "All" ? current.semester : undefined,
    program: current.program !== "All" ? current.program : undefined,
    region: current.region !== "All" ? current.region : undefined,
  });

  const kpis = computeKpis(filtered);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <LmsDashboard
          filterOptions={filterOptions}
          current={current}
          countryDefault={countryDefault}
          kpis={kpis}
          semesterTrend={bySemester(filtered)}
          byCountry={byCountryEnrollment(filtered)}
          byProgramStudents={byProgramStudents(filtered)}
          byRegionStudents={byRegionStudents(filtered)}
          byProgramCourses={byProgramCourses(filtered)}
          avgQuizAttempts={avgPerStudentByProgram(filtered, "total_quiz_attempt")}
          avgAssignments={avgPerStudentByProgram(filtered, "no_of_assignments_submitted")}
          records={filtered}
        />
      </div>
    </div>
  );
}
