import React from "react";
import { ErpFilterOptions, ErpFilterValues, ErpKpis } from "@/types/erp";
import { FiscalYearTrendPoint, CampusComparisonPoint, DepartmentFinancials } from "@/lib/erp-data";
import ErpFilters from "./ErpFilters";
import ErpMetrics from "./ErpMetrics";
import {
  FiscalYearTrendChart,
  CampusComparisonChart,
  BudgetTypeDonutChart,
  UtilizationRadialChart,
  TopDepartmentsChart,
  TopAccountsChart,
  DepartmentFinancialsChart,
  UtilizationRateByCampusChart,
} from "./ErpCharts";

interface ErpDashboardProps {
  filterOptions: ErpFilterOptions;
  current: ErpFilterValues;
  kpis: ErpKpis;
  trend: FiscalYearTrendPoint[];
  campusComparison: CampusComparisonPoint[];
  budgetType: [string, number][];
  topDepartments: [string, number][];
  topAccounts: [string, number][];
  departmentFinancials: DepartmentFinancials[];
  utilizationByCampus: [string, number][];
}

export default function ErpDashboard({
  filterOptions,
  current,
  kpis,
  trend,
  campusComparison,
  budgetType,
  topDepartments,
  topAccounts,
  departmentFinancials,
  utilizationByCampus,
}: ErpDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            ERP Budget Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {kpis.campusCount} campus{kpis.campusCount === 1 ? "" : "es"} · {kpis.departmentCount} department
            {kpis.departmentCount === 1 ? "" : "s"} — Main Campus and each Regional Office have their own department set
          </p>
        </div>
        <ErpFilters options={filterOptions} current={current} />
      </div>

      <ErpMetrics kpis={kpis} />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <FiscalYearTrendChart data={trend} />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <UtilizationRadialChart rate={kpis.utilizationRate} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <BudgetTypeDonutChart data={budgetType} />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <UtilizationRateByCampusChart
            categories={utilizationByCampus.map(([k]) => k)}
            values={utilizationByCampus.map(([, v]) => v)}
          />
        </div>

        <div className="col-span-12">
          <CampusComparisonChart data={campusComparison} />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <TopDepartmentsChart
            categories={topDepartments.map(([k]) => k)}
            values={topDepartments.map(([, v]) => v)}
          />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <TopAccountsChart
            categories={topAccounts.map(([k]) => k)}
            values={topAccounts.map(([, v]) => v)}
          />
        </div>

        <div className="col-span-12">
          <DepartmentFinancialsChart data={departmentFinancials} />
        </div>
      </div>
    </div>
  );
}
