import React from "react";
import { OasStat, OasFilterOptions, OasFilterValues, OasKpis } from "@/types/oas";
import { SemesterTrendPoint } from "@/lib/oas-data";
import OasFilters from "./OasFilters";
import OasMetrics from "./OasMetrics";
import {
  SemesterTrendChart,
  GenderDonutChart,
  ProgramBarChart,
  ProvinceBarChart,
  RegionBarChart,
  AgeBandBarChart,
} from "./OasCharts";

interface OasDashboardProps {
  filterOptions: OasFilterOptions;
  current: OasFilterValues;
  countryDefault: string;
  kpis: OasKpis;
  semesterTrend: SemesterTrendPoint[];
  byProgram: [string, number][];
  byProvince: [string, number][];
  byRegion: [string, number][];
  byAgeBand: [string, number][];
  records: OasStat[];
}

export default function OasDashboard({
  filterOptions,
  current,
  countryDefault,
  kpis,
  semesterTrend,
  byProgram,
  byProvince,
  byRegion,
  byAgeBand,
  records,
}: OasDashboardProps) {
  const topRecords = [...records].sort((a, b) => b.total_enrolled - a.total_enrolled).slice(0, 15);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            OAS Admissions Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cohort summary — each row is a Semester × Province × Region × Program × Age Band batch
          </p>
        </div>
        <OasFilters options={filterOptions} current={current} countryDefault={countryDefault} />
      </div>

      <OasMetrics kpis={kpis} />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-7">
          <SemesterTrendChart data={semesterTrend} />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <GenderDonutChart male={kpis.male} female={kpis.female} />
        </div>
        <div className="col-span-12">
          <ProgramBarChart
            categories={byProgram.map(([k]) => k)}
            values={byProgram.map(([, v]) => v)}
          />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <ProvinceBarChart
            categories={byProvince.map(([k]) => k)}
            values={byProvince.map(([, v]) => v)}
          />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <RegionBarChart
            categories={byRegion.map(([k]) => k)}
            values={byRegion.map(([, v]) => v)}
          />
        </div>
        <div className="col-span-12">
          <AgeBandBarChart
            categories={byAgeBand.map(([k]) => k)}
            values={byAgeBand.map(([, v]) => v)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          Cohort Records
        </h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Top {topRecords.length} of {records.length} filtered rows, by enrollment
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {[
                  "Semester",
                  "Province",
                  "Region",
                  "Program",
                  "Age Band",
                  "Applications",
                  "Male",
                  "Female",
                  "Enrolled",
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
                  <td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-400">
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
                      {r.province}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {r.region}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {r.program}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {r.age_band}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {r.total_applications_received.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {r.male_enrolled.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {r.female_enrolled.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                      {r.total_enrolled.toLocaleString()}
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
