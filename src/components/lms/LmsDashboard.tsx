import React from "react";
import { LmsStat, LmsFilterOptions, LmsFilterValues, LmsKpis } from "@/types/lms";
import { SemesterTrendPoint } from "@/lib/lms-data";
import LmsFilters from "./LmsFilters";
import LmsMetrics from "./LmsMetrics";
import {
  StudentsEnrollmentTrendChart,
  EngagementTrendChart,
  WorkshopTrendChart,
  CountryDonutChart,
  ProgramBarChart,
  RegionBarChart,
  CoursesByProgramChart,
  AvgQuizAttemptsChart,
  AvgAssignmentsChart,
} from "./LmsCharts";

interface LmsDashboardProps {
  filterOptions: LmsFilterOptions;
  current: LmsFilterValues;
  countryDefault: string;
  kpis: LmsKpis;
  semesterTrend: SemesterTrendPoint[];
  byCountry: [string, number][];
  byProgramStudents: [string, number][];
  byRegionStudents: [string, number][];
  byProgramCourses: [string, number][];
  avgQuizAttempts: [string, number][];
  avgAssignments: [string, number][];
  records: LmsStat[];
}

export default function LmsDashboard({
  filterOptions,
  current,
  countryDefault,
  kpis,
  semesterTrend,
  byCountry,
  byProgramStudents,
  byRegionStudents,
  byProgramCourses,
  avgQuizAttempts,
  avgAssignments,
  records,
}: LmsDashboardProps) {
  const topRecords = [...records]
    .sort((a, b) => b.total_no_of_students - a.total_no_of_students)
    .slice(0, 15);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            LMS Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cohort summary — each row is a Semester × Program × Country × Region batch
          </p>
        </div>
        <LmsFilters options={filterOptions} current={current} countryDefault={countryDefault} />
      </div>

      <LmsMetrics kpis={kpis} />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <StudentsEnrollmentTrendChart data={semesterTrend} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <CountryDonutChart data={byCountry} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <EngagementTrendChart data={semesterTrend} />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <WorkshopTrendChart data={semesterTrend} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <ProgramBarChart
            categories={byProgramStudents.map(([k]) => k)}
            values={byProgramStudents.map(([, v]) => v)}
          />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <CoursesByProgramChart
            categories={byProgramCourses.map(([k]) => k)}
            values={byProgramCourses.map(([, v]) => v)}
          />
        </div>

        <div className="col-span-12">
          <RegionBarChart
            categories={byRegionStudents.map(([k]) => k)}
            values={byRegionStudents.map(([, v]) => v)}
          />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <AvgQuizAttemptsChart
            categories={avgQuizAttempts.map(([k]) => k)}
            values={avgQuizAttempts.map(([, v]) => v)}
          />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <AvgAssignmentsChart
            categories={avgAssignments.map(([k]) => k)}
            values={avgAssignments.map(([, v]) => v)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          Cohort Records
        </h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Top {topRecords.length} of {records.length} filtered rows, by student count
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {[
                  "Semester",
                  "Program",
                  "Country",
                  "Region",
                  "Students",
                  "Enrollment",
                  "Assignments",
                  "Workshops",
                  "Quiz Attempted",
                  "Courses",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-6 text-center text-sm text-gray-400">
                    No records match the current filters
                  </td>
                </tr>
              ) : (
                topRecords.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {r.semester}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {r.program}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {r.country}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {r.region}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                      {r.total_no_of_students.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {r.total_enrollment.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {r.no_of_assignments_submitted.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {r.total_workshops.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {r.total_quiz_attempt.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {r.total_courses.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
