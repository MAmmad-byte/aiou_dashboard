"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import React from "react";
import { FiscalYearTrendPoint, CampusComparisonPoint, DepartmentFinancials } from "@/lib/erp-data";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[280px] items-center justify-center text-sm text-gray-400 dark:text-gray-500">
      No records match the current filters
    </div>
  );
}

const BASE: ApexOptions = {
  chart: { toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
  dataLabels: { enabled: false },
  grid: { strokeDashArray: 4 },
};

function money(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

// ── 1. Budget trend by fiscal year (area) ───────────────────────────────
export function FiscalYearTrendChart({ data }: { data: FiscalYearTrendPoint[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "area" },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
    xaxis: { categories: data.map((d) => d.fiscalYear) },
    yaxis: { labels: { formatter: money } },
    colors: ["#465FFF", "#F04438", "#12B76A"],
    legend: { position: "bottom" },
    tooltip: { y: { formatter: (v) => `PKR ${v.toLocaleString()}` } },
  };
  const series = [
    { name: "Budget", data: data.map((d) => d.commitment) },
    { name: "Expense", data: data.map((d) => d.expense) },
    { name: "Balance", data: data.map((d) => d.balance) },
  ];
  // Force a clean remount whenever the set of fiscal years changes —
  // ApexCharts doesn't always fully redraw an already-mounted chart when
  // the category count itself changes between filter selections.
  const chartKey = data.map((d) => d.fiscalYear).join("|");
  return (
    <ChartCard title="Budget Trend by Fiscal Year">
      {data.length > 0 ? (
        <ReactApexChart key={chartKey} options={options} series={series} type="area" height={320} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 2. Expense vs Commitment by Campus (grouped horizontal bar) ─────────
export function CampusComparisonChart({ data }: { data: CampusComparisonPoint[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: "65%" } },
    xaxis: { categories: data.map((d) => d.campus), labels: { formatter: money } },
    colors: ["#465FFF", "#F04438"],
    legend: { position: "bottom" },
    tooltip: { y: { formatter: (v) => `PKR ${v.toLocaleString()}` } },
  };
  const series = [
    { name: "Budget", data: data.map((d) => d.commitment) },
    { name: "Expense", data: data.map((d) => d.expense) },
  ];
  const chartKey = data.map((d) => d.campus).join("|");
  return (
    <ChartCard title="Expense vs Budget by Campus" subtitle={`Top ${data.length} campuses by Budget`}>
      {data.length > 0 ? (
        <ReactApexChart
          key={chartKey}
          options={options}
          series={series}
          type="bar"
          height={Math.max(340, data.length * 30)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 3. Commitment by Budget Type (donut) ─────────────────────────────────
export function BudgetTypeDonutChart({ data }: { data: [string, number][] }) {
  const colorMap: Record<string, string> = { Recurring: "#465FFF", Development: "#12B76A", "Special Project": "#F79009" };
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "donut" },
    labels: data.map(([k]) => k),
    colors: data.map(([k]) => colorMap[k] ?? "#98A2B3"),
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
    stroke: { width: 0 },
    tooltip: { y: { formatter: (v) => `PKR ${v.toLocaleString()}` } },
  };
  const series = data.map(([, v]) => v);
  return (
    <ChartCard title="Budget by Type">
      {series.length > 0 ? (
        <ReactApexChart options={options} series={series} type="donut" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 4. Utilization rate (radial gauge) ───────────────────────────────────
export function UtilizationRadialChart({ rate }: { rate: number }) {
  const color = rate >= 70 ? "#12B76A" : rate >= 40 ? "#F79009" : "#F04438";
  const options: ApexOptions = {
    chart: { type: "radialBar", fontFamily: "Outfit, sans-serif" },
    plotOptions: {
      radialBar: {
        hollow: { size: "65%" },
        dataLabels: {
          value: { fontSize: "28px", fontWeight: 700, formatter: (v) => `${v}%` },
          name: { show: false },
        },
      },
    },
    colors: [color],
    stroke: { lineCap: "round" },
  };
  return (
    <ChartCard title="Utilization Rate" subtitle="Expense ÷ Budget">
      <ReactApexChart options={options} series={[Number(rate.toFixed(1))]} type="radialBar" height={280} />
    </ChartCard>
  );
}

interface BarSeriesProps {
  categories: string[];
  values: number[];
}

// ── 5. Top departments by commitment (bar) ───────────────────────────────
export function TopDepartmentsChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories, labels: { formatter: money } },
    colors: ["#465FFF"],
    tooltip: { y: { formatter: (v) => `PKR ${v.toLocaleString()}` } },
  };
  return (
    <ChartCard title="Top Departments by Budget" subtitle="Respects the Campus filter">
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Budget", data: values }]}
          type="bar"
          height={Math.max(320, categories.length * 28)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 6. Top accounts by expense (bar) — the account-detail chart ─────────
export function TopAccountsChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories, labels: { formatter: money } },
    colors: ["#7A5AF8"],
    tooltip: { y: { formatter: (v) => `PKR ${v.toLocaleString()}` } },
  };
  return (
    <ChartCard
      title="Top Accounts by Expense"
      subtitle="Pick a Department above to see that department's account-level breakdown"
    >
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Expense", data: values }]}
          type="bar"
          height={Math.max(320, categories.length * 28)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 7. Budget / Expense / Balance by department (grouped bar) ───────
export function DepartmentFinancialsChart({ data }: { data: DepartmentFinancials[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: "65%" } },
    xaxis: { categories: data.map((d) => d.department), labels: { formatter: money } },
    colors: ["#465FFF", "#F04438", "#12B76A"],
    legend: { position: "bottom" },
    tooltip: { y: { formatter: (v) => `PKR ${v.toLocaleString()}` } },
  };
  const series = [
    { name: "Budget", data: data.map((d) => d.commitment) },
    { name: "Expense", data: data.map((d) => d.expense) },
    { name: "Balance", data: data.map((d) => d.balance) },
  ];
  return (
    <ChartCard title="Budget / Expense / Balance by Department" subtitle={`Top ${data.length} departments by Budget`}>
      {data.length > 0 ? (
        <ReactApexChart options={options} series={series} type="bar" height={Math.max(360, data.length * 34)} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 8. Utilization rate by campus (bar) ──────────────────────────────────
export function UtilizationRateByCampusChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories, labels: { formatter: (v) => `${v}%` } },
    colors: ["#F79009"],
  };
  return (
    <ChartCard title="Utilization Rate by Campus" subtitle="Expense ÷ Budget, ranked highest first">
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Utilization", data: values }]}
          type="bar"
          height={Math.max(320, categories.length * 28)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}
