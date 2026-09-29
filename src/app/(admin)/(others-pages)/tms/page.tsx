import type { Metadata } from "next";
import TmsDashboard from "@/components/tms/TmsDashboard";
import { TmsTransitionProvider, TmsFadeWrapper } from "@/components/tms/TmsTransitionProvider";
import TmsLoadingOverlay from "@/components/tms/TmsLoadingOverlay";
import {
  buildWhere,
  getFilterOptions,
  resolveDefaultSemester,
  getFilteredRows,
  computeKpis,
  bySemester,
  totalStudentsByRegion,
  tutorsByRegion,
  studentAllocationRateByRegion,
  fileConfirmationRateByRegion,
} from "@/lib/tms-data";

export const metadata: Metadata = {
  title: "TMS Dashboard | AIOU Dashboard",
  description: "Tutor allocation summary dashboard, filterable via URL query string",
};

// Same URL-driven interactivity as CMS/EOffice
// (/tms?semester=Spring+2026&region=LAHORE) plus the same transition-overlay
// treatment: filter changes fade the existing dashboard and show an
// animated overlay instead of flashing to a blank loading state.
//
// Next.js 15: searchParams is async — on Next 14 or earlier, drop the
// `await` and change the prop type to a plain object instead of a Promise.
interface TmsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TmsPage({ searchParams }: TmsPageProps) {
  const params = await searchParams;
  const getParam = (key: string, fallback: string = "All") =>
    typeof params[key] === "string" ? (params[key] as string) : fallback;

  const filterOptions = await getFilterOptions();
  // No ?semester= in the URL at all defaults to the latest semester
  // (chronologically, not alphabetically) — falls back to "All" only if the
  // table is somehow empty.
  const semesterDefault = resolveDefaultSemester(filterOptions);

  const current = {
    semester: getParam("semester", semesterDefault),
    region: getParam("region"),
  };

  const where = buildWhere({
    semester: current.semester !== "All" ? current.semester : undefined,
    region: current.region !== "All" ? current.region : undefined,
  });

  const rows = await getFilteredRows(where);
  const kpis = computeKpis(rows);
  const allocatedEnrollments = rows.reduce((s, r) => s + r.allocated_enrollments, 0);
  const unallocatedEnrollments = rows.reduce((s, r) => s + r.unallocated_enrollments, 0);
  const notConfirmedFiles = rows.reduce((s, r) => s + r.not_confirmed_files, 0);
  const unallocatedStudents = rows.reduce((s, r) => s + r.unallocated_students, 0);

  return (
    <TmsTransitionProvider>
      <div className="relative grid grid-cols-12 gap-4 md:gap-6">
        <TmsLoadingOverlay />
        <div className="col-span-12">
          <TmsFadeWrapper>
            <TmsDashboard
              filterOptions={filterOptions}
              current={current}
              semesterDefault={semesterDefault}
              kpis={kpis}
              trend={bySemester(rows)}
              totalsByRegion={totalStudentsByRegion(rows, 15)}
              tutorsByRegion={tutorsByRegion(rows, 15)}
              allocationRateByRegion={studentAllocationRateByRegion(rows, 15)}
              confirmationRateByRegion={fileConfirmationRateByRegion(rows, 15)}
              allocatedEnrollments={allocatedEnrollments}
              unallocatedEnrollments={unallocatedEnrollments}
              notConfirmedFiles={notConfirmedFiles}
              unallocatedStudents={unallocatedStudents}
            />
          </TmsFadeWrapper>
        </div>
      </div>
    </TmsTransitionProvider>
  );
}
