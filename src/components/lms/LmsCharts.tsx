"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import React from "react";
import { SemesterTrendPoint } from "@/lib/lms-data";

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
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
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

interface BarSeriesProps {
  categories: string[];
  values: number[];
}

// ── 1. Students & Enrollment by Semester (grouped column) ─────────────────
export function StudentsEnrollmentTrendChart({ data }: { data: SemesterTrendPoint[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "45%" } },
    xaxis: { categories: data.map((d) => d.semester) },
    colors: ["#465FFF", "#12B76A"],
    legend: { position: "bottom" },
  };
  const series = [
    { name: "Total Students", data: data.map((d) => d.students) },
    { name: "Total Enrollment", data: data.map((d) => d.enrollment) },
  ];
  return (
    <ChartCard title="Students & Enrollment by Semester">
      {data.length > 0 ? (
        <ReactApexChart options={options} series={series} type="bar" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 2. Assignments Submitted vs Quiz Attempts by Semester ──────────────────
export function EngagementTrendChart({ data }: { data: SemesterTrendPoint[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "45%" } },
    xaxis: { categories: data.map((d) => d.semester) },
    colors: ["#F79009", "#7A5AF8"],
    legend: { position: "bottom" },
  };
  const series = [
    { name: "Assignments Submitted", data: data.map((d) => d.assignments) },
    { name: "Quiz Attempted", data: data.map((d) => d.quizAttempted) },
  ];
  return (
    <ChartCard title="Assignments Submitted vs Quiz Attempts">
      {data.length > 0 ? (
        <ReactApexChart options={options} series={series} type="bar" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 3. Workshops & Workshop Batches by Semester ─────────────────────────────
export function WorkshopTrendChart({ data }: { data: SemesterTrendPoint[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "45%" } },
    xaxis: { categories: data.map((d) => d.semester) },
    colors: ["#2563EB", "#F04438"],
    legend: { position: "bottom" },
  };
  const series = [
    { name: "Total Workshops", data: data.map((d) => d.workshops) },
    { name: "Workshop Batches", data: data.map((d) => d.workshopBatches) },
  ];
  return (
    <ChartCard title="Workshops & Workshop Batches by Semester">
      {data.length > 0 ? (
        <ReactApexChart options={options} series={series} type="bar" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 4. Enrollment split by Country (donut) ─────────────────────────────────
export function CountryDonutChart({ data }: { data: [string, number][] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "donut" },
    labels: data.map(([k]) => k),
    colors: ["#465FFF", "#F79009"],
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
    stroke: { width: 0 },
  };
  const series = data.map(([, v]) => v);
  return (
    <ChartCard title="Enrollment by Country">
      {series.length > 0 ? (
        <ReactApexChart options={options} series={series} type="donut" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 5. Students by Program (bar) ────────────────────────────────────────
export function ProgramBarChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "45%" } },
    xaxis: { categories },
    colors: ["#465FFF"],
  };
  return (
    <ChartCard title="Students by Program">
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Students", data: values }]}
          type="bar"
          height={300}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 6. Students by Region (horizontal bar — many region names) ───────────
export function RegionBarChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "55%" } },
    xaxis: { categories },
    colors: ["#12B76A"],
  };
  return (
    <ChartCard title="Students by Region" subtitle="Domestic regions and international student hubs">
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

// ── 7. Courses Offered by Program (bar) ────────────────────────────────────
export function CoursesByProgramChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "45%" } },
    xaxis: { categories },
    colors: ["#7A5AF8"],
  };
  return (
    <ChartCard title="Courses Offered by Program">
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Courses", data: values }]}
          type="bar"
          height={280}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 8. Avg Quiz Attempts per Student by Program (bar) ──────────────────────
export function AvgQuizAttemptsChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "45%" } },
    xaxis: { categories },
    colors: ["#F04438"],
  };
  return (
    <ChartCard title="Avg Quiz Attempts per Student" subtitle="By program — weighted by enrolled students">
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Avg Attempts", data: values }]}
          type="bar"
          height={280}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 9. Avg Assignments Submitted per Student by Program (bar) ─────────────
export function AvgAssignmentsChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "45%" } },
    xaxis: { categories },
    colors: ["#F79009"],
  };
  return (
    <ChartCard title="Avg Assignments per Student" subtitle="By program — weighted by enrolled students">
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Avg Assignments", data: values }]}
          type="bar"
          height={280}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}
