"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import React from "react";
import { SemesterTrendPoint } from "@/lib/tms-data";

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

// ── 1. Student allocation trend by semester (area) ─────────────────────
export function StudentTrendChart({ data }: { data: SemesterTrendPoint[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "area" },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
    xaxis: { categories: data.map((d) => d.semester) },
    colors: ["#465FFF", "#12B76A", "#F04438"],
    legend: { position: "bottom" },
  };
  const series = [
    { name: "Total Students", data: data.map((d) => d.totalStudents) },
    { name: "Allocated Students", data: data.map((d) => d.allocatedStudents) },
    { name: "Un-Allocated Students", data: data.map((d) => d.unallocatedStudents) },
  ];
  // Force a clean remount whenever the set of semesters changes — ApexCharts
  // doesn't always fully redraw an already-mounted chart when the category
  // count itself changes between filter selections.
  const chartKey = data.map((d) => d.semester).join("|");
  return (
    <ChartCard title="Student Allocation Trend by Semester">
      {data.length > 0 ? (
        <ReactApexChart key={chartKey} options={options} series={series} type="area" height={320} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 2. Tutors: allocated vs eligible by semester (grouped bar — comparison) ─
export function TutorTrendChart({ data }: { data: SemesterTrendPoint[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "45%" } },
    xaxis: { categories: data.map((d) => d.semester) },
    colors: ["#7A5AF8", "#98A2B3"],
    legend: { position: "bottom" },
  };
  const series = [
    { name: "Allocated Tutors", data: data.map((d) => d.allocatedTutors) },
    { name: "Eligible Tutors", data: data.map((d) => d.eligibleTutors) },
  ];
  const chartKey = data.map((d) => d.semester).join("|");
  return (
    <ChartCard title="Tutors: Allocated vs Eligible by Semester" subtitle="Comparison — allocation pool vs actual assignment">
      {data.length > 0 ? (
        <ReactApexChart key={chartKey} options={options} series={series} type="bar" height={320} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 3. Students: allocated vs unallocated (donut) ───────────────────────
export function StudentAllocationDonut({ allocated, unallocated }: { allocated: number; unallocated: number }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "donut" },
    labels: ["Allocated", "Un-Allocated"],
    colors: ["#12B76A", "#F04438"],
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
    stroke: { width: 0 },
  };
  const series = [allocated, unallocated];
  return (
    <ChartCard title="Students: Allocated vs Un-Allocated">
      {allocated + unallocated > 0 ? (
        <ReactApexChart options={options} series={series} type="donut" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 4. Files: confirmed vs not confirmed (donut) ─────────────────────────
export function FileConfirmationDonut({ confirmed, notConfirmed }: { confirmed: number; notConfirmed: number }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "donut" },
    labels: ["Confirmed", "Not Confirmed"],
    colors: ["#465FFF", "#F79009"],
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
    stroke: { width: 0 },
  };
  const series = [confirmed, notConfirmed];
  return (
    <ChartCard title="Files: Confirmed vs Not Confirmed">
      {confirmed + notConfirmed > 0 ? (
        <ReactApexChart options={options} series={series} type="donut" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 5. Enrollments: allocated vs unallocated (donut) ─────────────────────
export function EnrollmentAllocationDonut({ allocated, unallocated }: { allocated: number; unallocated: number }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "donut" },
    labels: ["Allocated", "Un-Allocated"],
    colors: ["#0EA5A5", "#F04438"],
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
    stroke: { width: 0 },
  };
  const series = [allocated, unallocated];
  return (
    <ChartCard title="Enrollments: Allocated vs Un-Allocated">
      {allocated + unallocated > 0 ? (
        <ReactApexChart options={options} series={series} type="donut" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 6. Overall tutor utilization rate (radial gauge) ─────────────────────
export function UtilizationRadialChart({ rate }: { rate: number }) {
  const color = rate >= 30 ? "#12B76A" : rate >= 15 ? "#F79009" : "#F04438";
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
    <ChartCard title="Tutor Utilization Rate" subtitle="Allocated ÷ Eligible Tutors">
      <ReactApexChart options={options} series={[Number(rate.toFixed(1))]} type="radialBar" height={280} />
    </ChartCard>
  );
}

// ── 7. Tutors by region: allocated vs eligible (grouped horizontal bar) ──
export function TutorsByRegionChart({ data }: { data: { region: string; allocated: number; eligible: number }[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: "65%" } },
    xaxis: { categories: data.map((d) => d.region) },
    colors: ["#7A5AF8", "#98A2B3"],
    legend: { position: "bottom" },
  };
  const series = [
    { name: "Allocated", data: data.map((d) => d.allocated) },
    { name: "Eligible", data: data.map((d) => d.eligible) },
  ];
  return (
    <ChartCard title="Tutors by Region: Allocated vs Eligible" subtitle={`Top ${data.length} regions by eligible tutor pool`}>
      {data.length > 0 ? (
        <ReactApexChart options={options} series={series} type="bar" height={Math.max(340, data.length * 30)} />
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

// ── 8. Total students by region (horizontal bar) ─────────────────────────
export function TotalStudentsByRegionChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories },
    colors: ["#465FFF"],
  };
  return (
    <ChartCard title="Total Students by Region" subtitle={`Top ${categories.length} regions by volume`}>
      {values.length > 0 ? (
        <ReactApexChart
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

// ── 9. Student allocation rate by region (bar, derived %) ────────────────
export function StudentAllocationRateChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories, labels: { formatter: (v) => `${v}%` } },
    colors: ["#12B76A"],
  };
  return (
    <ChartCard title="Student Allocation Rate by Region" subtitle={`Top ${categories.length} best-allocated regions`}>
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Allocation Rate", data: values }]}
          type="bar"
          height={Math.max(320, categories.length * 28)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 10. File confirmation rate by region (bar, worst-first) ─────────────
export function FileConfirmationRateChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories, labels: { formatter: (v) => `${v}%` } },
    colors: ["#F79009"],
  };
  return (
    <ChartCard title="File Confirmation Rate by Region" subtitle={`${categories.length} regions needing the most attention (lowest first)`}>
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Confirmation Rate", data: values }]}
          type="bar"
          height={Math.max(320, categories.length * 28)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}
