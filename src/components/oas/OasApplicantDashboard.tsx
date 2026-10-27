import React from "react";
import { OasApplicantFilterOptions, OasApplicantFilterValues, OasApplicantKpis, SemesterTrendPoint, AgeBandPoint } from "@/types/oas-applicant";
import OasApplicantFilters from "./OasApplicantFilters";
import OasApplicantMetrics from "./OasApplicantMetrics";
import {
  ApplicationsTrendChart,
  StatusDonutChart,
  GenderDonutChart,
  AgeBandChart,
  TopRegionsChart,
  TopProgramsChart,
  FeeVerificationRadialChart,
  TopCountriesChart,
} from "./OasApplicantCharts";

interface OasApplicantDashboardProps {
  filterOptions: OasApplicantFilterOptions;
  current: OasApplicantFilterValues;
  semesterDefault: string;
  kpis: OasApplicantKpis;
  trend: SemesterTrendPoint[];
  statusBreakdown: [string, number][];
  gender: [string, number][];
  ageBands: AgeBandPoint[];
  byRegion: [string, number][];
  byProgram: [string, number][];
  byCountry: [string, number][];
}

export default function OasApplicantDashboard({
  filterOptions,
  current,
  semesterDefault,
  kpis,
  trend,
  statusBreakdown,
  gender,
  ageBands,
  byRegion,
  byProgram,
  byCountry,
}: OasApplicantDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">OAS Applicants Overview</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {kpis.totalApplicants.toLocaleString()} applicants across {kpis.regionCount} region
            {kpis.regionCount === 1 ? "" : "s"} and {kpis.programCount} program{kpis.programCount === 1 ? "" : "s"}
          </p>
        </div>
        <OasApplicantFilters options={filterOptions} current={current} semesterDefault={semesterDefault} />
      </div>

      <OasApplicantMetrics kpis={kpis} />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <ApplicationsTrendChart data={trend} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <FeeVerificationRadialChart rate={kpis.totalApplicants ? (kpis.feeVerified / kpis.totalApplicants) * 100 : 0} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <StatusDonutChart data={statusBreakdown} />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <GenderDonutChart data={gender} />
        </div>

        <div className="col-span-12">
          <AgeBandChart data={ageBands} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <TopRegionsChart categories={byRegion.map(([k]) => k)} values={byRegion.map(([, v]) => v)} />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <TopProgramsChart categories={byProgram.map(([k]) => k)} values={byProgram.map(([, v]) => v)} />
        </div>

        <div className="col-span-12">
          <TopCountriesChart categories={byCountry.map(([k]) => k)} values={byCountry.map(([, v]) => v)} />
        </div>
      </div>
    </div>
  );
}
