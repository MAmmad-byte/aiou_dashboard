import React from "react";
import { CmsFilterOptions, CmsFilterValues, CmsKpis } from "@/types/cms";
import { IntakePeriodPoint, CareerGenderSplit } from "@/lib/cms-data";
import CmsFilters from "./CmsFilters";
import CmsMetrics from "./CmsMetrics";
import {
  EnrollmentTrendChart,
  GenderDonutChart,
  StatusDonutChart,
  RetentionRadialChart,
  CareerBarChart,
  ModeDonutChart,
  TopProgramsChart,
  TopRegionsChart,
  GenderByCareerStackedChart,
  DiscontinuationRateChart,
} from "./CmsCharts";

interface CmsDashboardProps {
  filterOptions: CmsFilterOptions;
  current: CmsFilterValues;
  yearDefault: string;
  kpis: CmsKpis;
  trend: IntakePeriodPoint[];
  byCareer: [string, number][];
  byMode: [string, number][];
  topPrograms: [string, number][];
  topRegions: [string, number][];
  genderByCareer: CareerGenderSplit[];
  discontinuationRate: [string, number][];
  transgender: number;
  totalRows: number;
}

export default function CmsDashboard({
  filterOptions,
  current,
  yearDefault,
  kpis,
  trend,
  byCareer,
  byMode,
  topPrograms,
  topRegions,
  genderByCareer,
  discontinuationRate,
  transgender,
  totalRows,
}: CmsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            CMS Admissions & Enrollment
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {kpis.totalEnroll.toLocaleString()} enrolled across {totalRows.toLocaleString()} cohort
            rows — each row is a Year × Season × Region × Career × Program × Mode batch
          </p>
        </div>
        <CmsFilters options={filterOptions} current={current} yearDefault={yearDefault} />
      </div>

      <CmsMetrics kpis={kpis} />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <EnrollmentTrendChart data={trend} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <RetentionRadialChart rate={kpis.retentionRate} />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <GenderDonutChart male={kpis.male} female={kpis.female} transgender={transgender} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <StatusDonutChart active={kpis.activeEnroll} discontinued={kpis.discontinueEnroll} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <ModeDonutChart categories={byMode.map(([k]) => k)} values={byMode.map(([, v]) => v)} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <CareerBarChart categories={byCareer.map(([k]) => k)} values={byCareer.map(([, v]) => v)} />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <DiscontinuationRateChart
            categories={discontinuationRate.map(([k]) => k)}
            values={discontinuationRate.map(([, v]) => v)}
          />
        </div>

        <div className="col-span-12">
          <GenderByCareerStackedChart data={genderByCareer} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <TopProgramsChart
            categories={topPrograms.map(([k]) => k)}
            values={topPrograms.map(([, v]) => v)}
          />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <TopRegionsChart
            categories={topRegions.map(([k]) => k)}
            values={topRegions.map(([, v]) => v)}
          />
        </div>
      </div>
    </div>
  );
}
