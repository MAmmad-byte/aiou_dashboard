import React from "react";
import { AdmissionsFilterOptions, AdmissionsFilterValues, AdmissionsKpis } from "@/types/admissions";
import { SemesterTrendPoint, CareerFreshContinuingPoint, RegionFreshContinuingPoint } from "@/lib/admissions-data";
import AdmissionsFilters from "./AdmissionsFilters";
import AdmissionsMetrics from "./AdmissionsMetrics";
import {
  ApplicationsTrendChart,
  GenderDonutChart,
  FreshVsContinuingDonutChart,
  ModeDonutChart,
  StudentsByCareerChart,
  StudentsByCampusChart,
  StudentsByProvinceChart,
  AvgCoursesByCareerChart,
  FreshVsContinuingByCareerChart,
  FreshVsContinuingByRegionChart,
} from "./AdmissionsCharts";

interface AdmissionsDashboardProps {
  filterOptions: AdmissionsFilterOptions;
  current: AdmissionsFilterValues;
  semesterDefault: string;
  kpis: AdmissionsKpis;
  trend: SemesterTrendPoint[];
  gender: [string, number][];
  freshVsContinuing: [string, number][];
  mode: [string, number][];
  byCareer: [string, number][];
  byCampus: [string, number][];
  byProvince: [string, number][];
  avgCoursesByCareer: [string, number][];
  freshVsContinuingByCareer: CareerFreshContinuingPoint[];
  freshVsContinuingByRegion: RegionFreshContinuingPoint[];
}

export default function AdmissionsDashboard({
  filterOptions,
  current,
  semesterDefault,
  kpis,
  trend,
  gender,
  freshVsContinuing,
  mode,
  byCareer,
  byCampus,
  byProvince,
  avgCoursesByCareer,
  freshVsContinuingByCareer,
  freshVsContinuingByRegion,
}: AdmissionsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Admissions Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {kpis.totalStudents.toLocaleString()} students across {kpis.campusCount} campus
            {kpis.campusCount === 1 ? "" : "es"} and {kpis.careerCount} academic career
            {kpis.careerCount === 1 ? "" : "s"}
          </p>
        </div>
        <AdmissionsFilters options={filterOptions} current={current} semesterDefault={semesterDefault} />
      </div>

      <AdmissionsMetrics kpis={kpis} />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <ApplicationsTrendChart data={trend} />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <GenderDonutChart data={gender} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <FreshVsContinuingDonutChart data={freshVsContinuing} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <ModeDonutChart data={mode} />
        </div>

        <div className="col-span-12">
          <StudentsByCareerChart categories={byCareer.map(([k]) => k)} values={byCareer.map(([, v]) => v)} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <StudentsByCampusChart categories={byCampus.map(([k]) => k)} values={byCampus.map(([, v]) => v)} />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <StudentsByProvinceChart categories={byProvince.map(([k]) => k)} values={byProvince.map(([, v]) => v)} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <AvgCoursesByCareerChart
            categories={avgCoursesByCareer.map(([k]) => k)}
            values={avgCoursesByCareer.map(([, v]) => v)}
          />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <FreshVsContinuingByCareerChart data={freshVsContinuingByCareer} />
        </div>

        <div className="col-span-12">
          <FreshVsContinuingByRegionChart data={freshVsContinuingByRegion} />
        </div>
      </div>
    </div>
  );
}
