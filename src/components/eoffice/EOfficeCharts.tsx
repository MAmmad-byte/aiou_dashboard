"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import React from "react";
import { DepartmentTimeSplit } from "@/lib/eoffice-data";

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

// ── 1. Files by department — share of total (donut) ────────────────────
// Replaces the old date-trend chart, which drew nothing meaningful once the
// date-range filter was removed and this table (a daily snapshot) often
// only has a single date's worth of rows — an area/line chart can't show a
// trend from one point. This always renders regardless of date coverage.
export function FilesByDepartmentDonutChart({ categories, values }: BarSeriesProps) {
  const top = categories.map((c, i) => [c, values[i]] as [string, number]).slice(0, 8);
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "donut" },
    labels: top.map(([k]) => k),
    legend: { position: "bottom" },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    stroke: { width: 0 },
  };
  const series = top.map(([, v]) => v);
  return (
    <ChartCard title="Files by Department" subtitle="Share of total files — top 8 departments">
      {series.length > 0 ? (
        <ReactApexChart options={options} series={series} type="donut" height={320} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 2. Status breakdown (donut) ─────────────────────────────────────────
export function StatusDonutChart({ data }: { data: [string, number][] }) {
  const colorMap: Record<string, string> = { Open: "#465FFF", Closed: "#12B76A", Pending: "#F79009" };
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "donut" },
    labels: data.map(([k]) => k),
    colors: data.map(([k]) => colorMap[k] ?? "#98A2B3"),
    legend: { position: "bottom" },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    stroke: { width: 0 },
  };
  const series = data.map(([, v]) => v);
  return (
    <ChartCard title="Status Breakdown">
      {series.length > 0 ? (
        <ReactApexChart options={options} series={series} type="donut" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 3. Priority breakdown (donut) ────────────────────────────────────────
export function PriorityDonutChart({ data }: { data: [string, number][] }) {
  const colorMap: Record<string, string> = { Normal: "#98A2B3", Urgent: "#F79009", Immediate: "#F04438" };
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "donut" },
    labels: data.map(([k]) => k),
    colors: data.map(([k]) => colorMap[k] ?? "#98A2B3"),
    legend: { position: "bottom" },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    stroke: { width: 0 },
  };
  const series = data.map(([, v]) => v);
  return (
    <ChartCard title="Priority Breakdown">
      {series.length > 0 ? (
        <ReactApexChart options={options} series={series} type="donut" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 4. Closure rate (radial gauge) ───────────────────────────────────────
export function ClosureRateRadialChart({ rate }: { rate: number }) {
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
    <ChartCard title="Closure Rate" subtitle="Closed ÷ Total Files">
      <ReactApexChart options={options} series={[Number(rate.toFixed(1))]} type="radialBar" height={280} />
    </ChartCard>
  );
}

interface BarSeriesProps {
  categories: string[];
  values: number[];
}

// ── 5. Files by department (bar) — title/data follow the Status/Priority lens
export function FilesByDepartmentChart({
  categories,
  values,
  title,
}: BarSeriesProps & { title: string }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories },
    colors: ["#465FFF"],
  };
  return (
    <ChartCard title={title} subtitle={`Top ${categories.length} by volume`}>
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: title, data: values }]}
          type="bar"
          height={Math.max(320, categories.length * 28)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 6. Avg turnaround time by department (bar) ───────────────────────────
export function TurnaroundByDepartmentChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories, labels: { formatter: (v) => `${v}d` } },
    colors: ["#F79009"],
  };
  return (
    <ChartCard title="Avg Turnaround Time by Department" subtitle="Weighted by file volume">
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Avg Days", data: values }]}
          type="bar"
          height={Math.max(320, categories.length * 28)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 7. Avg response time by department (bar) ─────────────────────────────
export function ResponseTimeByDepartmentChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories, labels: { formatter: (v) => `${v}d` } },
    colors: ["#F04438"],
  };
  return (
    <ChartCard title="Avg File Response Time by Department" subtitle="Weighted by file volume">
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Avg Days", data: values }]}
          type="bar"
          height={Math.max(320, categories.length * 28)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 8. Turnaround vs response time (grouped bar — comparison) ────────────
export function TurnaroundVsResponseChart({ data }: { data: DepartmentTimeSplit[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: "65%" } },
    xaxis: { categories: data.map((d) => d.department), labels: { formatter: (v) => `${v}d` } },
    colors: ["#F79009", "#F04438"],
    legend: { position: "bottom" },
  };
  const series = [
    { name: "Avg Turnaround", data: data.map((d) => d.turnaround) },
    { name: "Avg Response", data: data.map((d) => d.response) },
  ];
  return (
    <ChartCard title="Turnaround vs Response Time by Department" subtitle={`Top ${data.length} departments by file volume`}>
      {data.length > 0 ? (
        <ReactApexChart options={options} series={series} type="bar" height={Math.max(340, data.length * 32)} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}
