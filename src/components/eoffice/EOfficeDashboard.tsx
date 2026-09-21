import React from "react";
import { EOfficeFilterOptions, EOfficeFilterValues, EOfficeKpis } from "@/types/eoffice";
import { DepartmentTimeSplit } from "@/lib/eoffice-data";
import EOfficeFilters from "./EOfficeFilters";
import EOfficeMetrics from "./EOfficeMetrics";
import {
  FilesByDepartmentDonutChart,
  StatusDonutChart,
  PriorityDonutChart,
  ClosureRateRadialChart,
  FilesByDepartmentChart,
  TurnaroundByDepartmentChart,
  ResponseTimeByDepartmentChart,
  TurnaroundVsResponseChart,
} from "./EOfficeCharts";

interface EOfficeDashboardProps {
  filterOptions: EOfficeFilterOptions;
  current: EOfficeFilterValues;
  kpis: EOfficeKpis;
  metricLabel: string;
  metricValue: number;
  metricByDepartment: [string, number][];
  statusBreakdown: [string, number][];
  priorityBreakdown: [string, number][];
  turnaroundByDepartment: [string, number][];
  responseTimeByDepartment: [string, number][];
  turnaroundVsResponse: DepartmentTimeSplit[];
}

export default function EOfficeDashboard({
  filterOptions,
  current,
  kpis,
  metricLabel,
  metricValue,
  metricByDepartment,
  statusBreakdown,
  priorityBreakdown,
  turnaroundByDepartment,
  responseTimeByDepartment,
  turnaroundVsResponse,
}: EOfficeDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            E-Office Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {kpis.totalFiles.toLocaleString()} files across {kpis.departmentCount} department
            {kpis.departmentCount === 1 ? "" : "s"}
          </p>
        </div>
        <EOfficeFilters options={filterOptions} current={current} />
      </div>

      <EOfficeMetrics kpis={kpis} metricLabel={metricLabel} metricValue={metricValue} />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <FilesByDepartmentDonutChart
            categories={metricByDepartment.map(([k]) => k)}
            values={metricByDepartment.map(([, v]) => v)}
          />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <ClosureRateRadialChart rate={kpis.closureRate} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <StatusDonutChart data={statusBreakdown} />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <PriorityDonutChart data={priorityBreakdown} />
        </div>

        <div className="col-span-12">
          <FilesByDepartmentChart
            title={`${metricLabel} by Department`}
            categories={metricByDepartment.map(([k]) => k)}
            values={metricByDepartment.map(([, v]) => v)}
          />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <TurnaroundByDepartmentChart
            categories={turnaroundByDepartment.map(([k]) => k)}
            values={turnaroundByDepartment.map(([, v]) => v)}
          />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <ResponseTimeByDepartmentChart
            categories={responseTimeByDepartment.map(([k]) => k)}
            values={responseTimeByDepartment.map(([, v]) => v)}
          />
        </div>

        <div className="col-span-12">
          <TurnaroundVsResponseChart data={turnaroundVsResponse} />
        </div>
      </div>
    </div>
  );
}
