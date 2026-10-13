import React from "react";
import { TrendingFilterOptions, TrendingFilterValues, TrendingKpis } from "@/types/trending";
import { IntakeTrendPoint } from "@/lib/oas-data";
import TrendingFilters from "./TrendingFilters";
import TrendingMetrics from "./TrendingMetrics";
import {
  IntakeTrendChart,
  FeeChannelDonutChart,
  StatusDonutChart,
  SubmissionRateRadialChart,
  ApplicationsByGroupChart,
  SubmissionByGroupChart,
  TopProgramsChart,
  VerificationRateChart,
} from "./TrendingCharts";

interface TrendingDashboardProps {
  filterOptions: TrendingFilterOptions;
  current: TrendingFilterValues;
  intakeDefault: string;
  kpis: TrendingKpis;
  trend: IntakeTrendPoint[];
  feeChannel: [string, number][];
  statusBreakdown: [string, number][];
  byProgramGroup: [string, number][];
  submissionByGroup: { group: string; submitted: number; notSubmitted: number }[];
  topPrograms: [string, number][];
  verificationRateByGroup: [string, number][];
}

export default function TrendingDashboard({
  filterOptions,
  current,
  intakeDefault,
  kpis,
  trend,
  feeChannel,
  statusBreakdown,
  byProgramGroup,
  submissionByGroup,
  topPrograms,
  verificationRateByGroup,
}: TrendingDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Program Trending — Admissions Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {kpis.totalApplications.toLocaleString()} applications across {kpis.programCount} program
            {kpis.programCount === 1 ? "" : "s"}
          </p>
        </div>
        <TrendingFilters options={filterOptions} current={current} intakeDefault={intakeDefault} />
      </div>

      <TrendingMetrics kpis={kpis} />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <IntakeTrendChart data={trend} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <SubmissionRateRadialChart rate={kpis.submissionRate} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <FeeChannelDonutChart data={feeChannel} />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <StatusDonutChart data={statusBreakdown} />
        </div>

        <div className="col-span-12">
          <ApplicationsByGroupChart
            categories={byProgramGroup.map(([k]) => k)}
            values={byProgramGroup.map(([, v]) => v)}
          />
        </div>

        <div className="col-span-12">
          <SubmissionByGroupChart data={submissionByGroup} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <TopProgramsChart
            categories={topPrograms.map(([k]) => k)}
            values={topPrograms.map(([, v]) => v)}
          />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <VerificationRateChart
            categories={verificationRateByGroup.map(([k]) => k)}
            values={verificationRateByGroup.map(([, v]) => v)}
          />
        </div>
      </div>
    </div>
  );
}
