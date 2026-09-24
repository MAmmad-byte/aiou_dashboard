"use client";

import type { ApexOptions } from "apexcharts";
import React from "react";
import ApexChart from "@/components/admissions/ApexChart";
import { SemesterTrendPoint, CareerFreshContinuingPoint, RegionFreshContinuingPoint } from "@/lib/admissions-data";

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

// ── 1. Applications trend by semester (bar — see file header comment) ────
// Deliberately a bar/column chart, not area/line: area charts render as an
// effectively invisible single dot when there's only one x-axis category,
// which is guaranteed to happen here whenever a specific semester is
// selected (or while only one semester of data has been loaded at all).
// Bars stay clearly visible and readable regardless of category count.
export function ApplicationsTrendChart({ data }: { data: SemesterTrendPoint[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: data.length <= 1 ? "35%" : "45%" } },
    dataLabels: { enabled: data.length <= 1, style: { fontSize: "11px" } },
    xaxis: { categories: data.map((d) => d.semester) },
    colors: ["#465FFF", "#12B76A", "#F79009"],
    legend: { position: "bottom" },
  };
  const series = [
    { name: "Total Students", data: data.map((d) => d.totalStudents) },
    { name: "Fresh Admits", data: data.map((d) => d.freshAdmits) },
    { name: "Continuing", data: data.map((d) => d.continuingStudents) },
  ];
  const chartKey = data.map((d) => d.semester).join("|");
  return (
    <ChartCard title="Applications Trend by Semester">
      {data.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={series} type="bar" height={320} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 2. Gender split (donut) ─────────────────────────────────────────────
export function GenderDonutChart({ data }: { data: [string, number][] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "donut" },
    labels: data.map(([k]) => k),
    colors: ["#465FFF", "#F79009", "#7A5AF8"],
    legend: { position: "bottom" },
    // dataLabels: { enabled: true },
    dataLabels: {
  enabled: true,
  style: { colors: data.map(() => "#FFFFFF")},
  dropShadow: { enabled: false },
},
    stroke: { width: 0 },
  };
  const series = data.map(([, v]) => v);
  const chartKey = data.map(([k]) => k).join("|");
  return (
    <ChartCard title="Gender Split">
      {series.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={series} type="donut" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 3. Fresh vs Continuing (donut) ───────────────────────────────────────
export function FreshVsContinuingDonutChart({ data }: { data: [string, number][] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "donut" },
    labels: data.map(([k]) => k),
    colors: ["#12B76A", "#465FFF"],
    legend: { position: "bottom" },
    dataLabels: { enabled: true,dropShadow: { enabled: false } },
    stroke: { width: 0 },
  };
  const series = data.map(([, v]) => v);
  const chartKey = data.map(([k]) => k).join("|");
  return (
    <ChartCard title="Fresh Admits vs Continuing">
      {series.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={series} type="donut" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 4. Mode breakdown (donut) ────────────────────────────────────────────
export function ModeDonutChart({ data }: { data: [string, number][] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "donut" },
    labels: data.map(([k]) => k),
    legend: { position: "bottom" },
    dataLabels: { enabled: true,dropShadow: { enabled: false }, },
    stroke: { width: 0 },
  };
  const series = data.map(([, v]) => v);
  const chartKey = data.map(([k]) => k).join("|");
  return (
    <ChartCard title="Students by Mode" subtitle="Face to Face vs Open & Distance Learning">
      {series.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={series} type="donut" height={300} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

interface BarSeriesProps {
  categories: string[];
  values: number[];
}

// ── 5. Students by academic career (bar) ─────────────────────────────────
export function StudentsByCareerChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
    xaxis: { categories },
    colors: ["#465FFF"],
  };
  const chartKey = categories.join("|");
  return (
    <ChartCard title="Students by Academic Career">
      {values.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={[{ name: "Students", data: values }]} type="bar" height={320} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 6. Students by campus (horizontal bar) ───────────────────────────────
export function StudentsByCampusChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories },
    colors: ["#12B76A"],
  };
  const chartKey = categories.join("|");
  return (
    <ChartCard title="Students by Campus" subtitle={`Top ${categories.length} by volume`}>
      {values.length > 0 ? (
        <ApexChart
          key={chartKey}
          options={options}
          series={[{ name: "Students", data: values }]}
          type="bar"
          height={Math.max(320, categories.length * 28)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 7. Students by province (horizontal bar) ─────────────────────────────
export function StudentsByProvinceChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories },
    colors: ["#7A5AF8"],
  };
  const chartKey = categories.join("|");
  return (
    <ChartCard title="Students by Province" subtitle={`Top ${categories.length} by volume`}>
      {values.length > 0 ? (
        <ApexChart
          key={chartKey}
          options={options}
          series={[{ name: "Students", data: values }]}
          type="bar"
          height={Math.max(320, categories.length * 28)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 8. Avg courses per student by career (bar, derived rate) ────────────
export function AvgCoursesByCareerChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories },
    colors: ["#F79009"],
  };
  const chartKey = categories.join("|");
  return (
    <ChartCard title="Avg Courses per Student by Career" subtitle="Weighted by student volume">
      {values.length > 0 ? (
        <ApexChart
          key={chartKey}
          options={options}
          series={[{ name: "Avg Courses", data: values }]}
          type="bar"
          height={Math.max(320, categories.length * 28)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 9. Fresh vs Continuing by career (grouped bar — comparison) ─────────
export function FreshVsContinuingByCareerChart({ data }: { data: CareerFreshContinuingPoint[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: "65%" } },
    xaxis: { categories: data.map((d) => d.career) },
    colors: ["#12B76A", "#465FFF"],
    legend: { position: "bottom" },
  };
  const series = [
    { name: "Fresh Admits", data: data.map((d) => d.fresh) },
    { name: "Continuing", data: data.map((d) => d.continuing) },
  ];
  const chartKey = data.map((d) => d.career).join("|");
  return (
    <ChartCard title="Fresh Admits vs Continuing by Career" subtitle="Comparison across all academic careers">
      {data.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={series} type="bar" height={Math.max(320, data.length * 32)} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 10. Fresh vs Continuing by region (grouped bar — full width) ────────
export function FreshVsContinuingByRegionChart({ data }: { data: RegionFreshContinuingPoint[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: "70%" } },
    xaxis: { categories: data.map((d) => d.region) },
    colors: ["#12B76A", "#465FFF"],
    legend: { position: "bottom" },
  };
  const series = [
    { name: "Fresh Admits", data: data.map((d) => d.fresh) },
    { name: "Continuing", data: data.map((d) => d.continuing) },
  ];
  const chartKey = data.map((d) => d.region).join("|");
  return (
    <ChartCard title="Fresh Admits vs Continuing by Region" subtitle={`Top ${data.length} regions by volume`}>
      {data.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={series} type="bar" height={Math.max(400, data.length * 34)} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}
