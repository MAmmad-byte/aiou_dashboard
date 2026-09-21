import React from "react";
import { TmsFilterOptions, TmsFilterValues, TmsKpis } from "@/types/tms";
import { SemesterTrendPoint } from "@/lib/tms-data";
import TmsFilters from "./TmsFilters";
import TmsMetrics from "./TmsMetrics";
import {
  StudentTrendChart,
  TutorTrendChart,
  StudentAllocationDonut,
  FileConfirmationDonut,
  EnrollmentAllocationDonut,
  UtilizationRadialChart,
  TutorsByRegionChart,
  TotalStudentsByRegionChart,
  StudentAllocationRateChart,
  FileConfirmationRateChart,
} from "./TmsCharts";

interface TmsDashboardProps {
  filterOptions: TmsFilterOptions;
  current: TmsFilterValues;
  semesterDefault: string;
  kpis: TmsKpis;
  trend: SemesterTrendPoint[];
  totalsByRegion: [string, number][];
  tutorsByRegion: { region: string; allocated: number; eligible: number }[];
  allocationRateByRegion: [string, number][];
  confirmationRateByRegion: [string, number][];
  allocatedEnrollments: number;
  unallocatedEnrollments: number;
  notConfirmedFiles: number;
  unallocatedStudents: number;
}

export default function TmsDashboard({
  filterOptions,
  current,
  semesterDefault,
  kpis,
  trend,
  totalsByRegion,
  tutorsByRegion,
  allocationRateByRegion,
  confirmationRateByRegion,
  allocatedEnrollments,
  unallocatedEnrollments,
  notConfirmedFiles,
  unallocatedStudents,
}: TmsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            TMS Tutor Allocation Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cohort summary — each row is a Semester × Region batch of tutor/student/file allocation stats
          </p>
        </div>
        <TmsFilters options={filterOptions} current={current} semesterDefault={semesterDefault} />
      </div>

      <TmsMetrics kpis={kpis} />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <StudentTrendChart data={trend} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <UtilizationRadialChart rate={kpis.tutorUtilizationRate} />
        </div>

        <div className="col-span-12 xl:col-span-12">
          <TutorTrendChart data={trend} />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <StudentAllocationDonut allocated={kpis.allocatedStudents} unallocated={unallocatedStudents} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <EnrollmentAllocationDonut allocated={allocatedEnrollments} unallocated={unallocatedEnrollments} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <FileConfirmationDonut confirmed={kpis.confirmedFiles} notConfirmed={notConfirmedFiles} />
        </div>

        <div className="col-span-12">
          <TutorsByRegionChart data={tutorsByRegion} />
        </div>

        <div className="col-span-12">
          <TotalStudentsByRegionChart
            categories={totalsByRegion.map(([k]) => k)}
            values={totalsByRegion.map(([, v]) => v)}
          />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <StudentAllocationRateChart
            categories={allocationRateByRegion.map(([k]) => k)}
            values={allocationRateByRegion.map(([, v]) => v)}
          />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <FileConfirmationRateChart
            categories={confirmationRateByRegion.map(([k]) => k)}
            values={confirmationRateByRegion.map(([, v]) => v)}
          />
        </div>
      </div>
    </div>
  );
}
