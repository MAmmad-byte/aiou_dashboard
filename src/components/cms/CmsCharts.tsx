"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import React from "react";
import { IntakePeriodPoint, CareerGenderSplit } from "@/lib/cms-data";

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

// ── 1. Enrollment trend by intake period (area chart) ──────────────────────
export function EnrollmentTrendChart({ data }: { data: IntakePeriodPoint[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "area" },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
    xaxis: { categories: data.map((d) => d.label), labels: { rotate: -45 } },
    colors: ["#465FFF", "#12B76A", "#F04438"],
    legend: { position: "bottom" },
  };
  const series = [
    { name: "Total Enrolled", data: data.map((d) => d.totalEnroll) },
    { name: "Active", data: data.map((d) => d.activeEnroll) },
    { name: "Discontinued", data: data.map((d) => d.discontinueEnroll) },
  ];
  return (
    <ChartCard title="Enrollment Trend by Intake Period" subtitle="Clear the Year filter to see the full 26-year history">
      {data.length > 0 ? (
        <ReactApexChart options={options} series={series} type="area" height={320} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 2. Gender split (donut) ─────────────────────────────────────────────
export function GenderDonutChart({ male, female, transgender }: { male: number; female: number; transgender: number }) {
  const labels = ["Male", "Female", ...(transgender > 0 ? ["Transgender"] : [])];
  const series = [male, female, ...(transgender > 0 ? [transgender] : [])];
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "donut" },
    labels,
    colors: ["#465FFF", "#F79009", "#7A5AF8"],
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
    stroke: { width: 0 },
  };
  return (
    <ChartCard title="Gender Split" subtitle="Share of total enrollment">
      {series.some((v) => v > 0) ? (
        <ReactApexChart options={options} series={series} type="donut" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 3. Status split (donut) ────────────────────────────────────────────
export function StatusDonutChart({ active, discontinued }: { active: number; discontinued: number }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "donut" },
    labels: ["Active", "Discontinued"],
    colors: ["#12B76A", "#F04438"],
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
    stroke: { width: 0 },
  };
  const series = [active, discontinued];
  return (
    <ChartCard title="Enrollment Status" subtitle="Active vs. discontinued (not necessarily all of Total Enrolled)">
      {active + discontinued > 0 ? (
        <ReactApexChart options={options} series={series} type="donut" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 4. Retention rate (radial gauge) ────────────────────────────────────
export function RetentionRadialChart({ rate }: { rate: number }) {
  const color = rate >= 80 ? "#12B76A" : rate >= 60 ? "#F79009" : "#F04438";
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
    <ChartCard title="Retention Rate" subtitle="Active ÷ Total Enrolled">
      <ReactApexChart options={options} series={[Number(rate.toFixed(1))]} type="radialBar" height={280} />
    </ChartCard>
  );
}

interface BarSeriesProps {
  categories: string[];
  values: number[];
}

// ── 5. Enrollment by Career (bar) ──────────────────────────────────────
export function CareerBarChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
    xaxis: { categories },
    colors: ["#465FFF"],
  };
  return (
    <ChartCard title="Enrollment by Career">
      {values.length > 0 ? (
        <ReactApexChart options={options} series={[{ name: "Enrolled", data: values }]} type="bar" height={300} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 6. Enrollment by Mode (donut) ───────────────────────────────────────
export function ModeDonutChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "donut" },
    labels: categories,
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
    stroke: { width: 0 },
  };
  return (
    <ChartCard title="Enrollment by Mode">
      {values.length > 0 ? (
        <ReactApexChart options={options} series={values} type="donut" height={300} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 7. Top programs by enrollment (horizontal bar) ─────────────────────
export function TopProgramsChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories },
    colors: ["#7A5AF8"],
  };
  return (
    <ChartCard title="Top Programs by Enrollment" subtitle={`Top ${categories.length} of the filtered programs`}>
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Enrolled", data: values }]}
          type="bar"
          height={Math.max(320, categories.length * 28)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 8. Top regions by enrollment (horizontal bar) ───────────────────────
export function TopRegionsChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories },
    colors: ["#12B76A"],
  };
  return (
    <ChartCard title="Top Regions by Enrollment" subtitle={`Top ${categories.length} of the filtered regions`}>
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Enrolled", data: values }]}
          type="bar"
          height={Math.max(320, categories.length * 28)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 9. Gender mix by career (100% stacked bar) ──────────────────────────
export function GenderByCareerStackedChart({ data }: { data: CareerGenderSplit[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar", stacked: true, stackType: "100%" },
    plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: "60%" } },
    xaxis: { categories: data.map((d) => d.career) },
    colors: ["#465FFF", "#F79009"],
    legend: { position: "bottom" },
  };
  const series = [
    { name: "Male", data: data.map((d) => d.male) },
    { name: "Female", data: data.map((d) => d.female) },
  ];
  return (
    <ChartCard title="Gender Mix by Career" subtitle="100% stacked — top 10 careers by enrollment">
      {data.length > 0 ? (
        <ReactApexChart options={options} series={series} type="bar" height={320} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 10. Discontinuation rate by career (bar, derived %) ─────────────────
export function DiscontinuationRateChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
    xaxis: { categories },
    yaxis: { labels: { formatter: (v) => `${v}%` } },
    colors: ["#F04438"],
  };
  return (
    <ChartCard title="Discontinuation Rate by Career" subtitle="Discontinued ÷ Total Enrolled, per career">
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Discontinuation Rate", data: values }]}
          type="bar"
          height={300}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}
