"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import React from "react";
import { SemesterTrendPoint } from "@/lib/oas-data";

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

// ── Applications & Enrollment trend by semester (grouped bar) ──────────────
export function SemesterTrendChart({ data }: { data: SemesterTrendPoint[] }) {
  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "45%" } },
    dataLabels: { enabled: false },
    xaxis: { categories: data.map((d) => d.semester) },
    colors: ["#465FFF", "#12B76A"],
    legend: { position: "bottom" },
    grid: { strokeDashArray: 4 },
  };
  const series = [
    { name: "Applications Received", data: data.map((d) => d.applications) },
    { name: "Total Enrolled", data: data.map((d) => d.enrolled) },
  ];
  return (
    <ChartCard title="Applications & Enrollment by Semester">
      {data.length > 0 ? (
        <ReactApexChart options={options} series={series} type="bar" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── Gender split (donut) ────────────────────────────────────────────────
export function GenderDonutChart({ male, female }: { male: number; female: number }) {
  const options: ApexOptions = {
    chart: { type: "donut", fontFamily: "Outfit, sans-serif" },
    labels: ["Male", "Female"],
    colors: ["#465FFF", "#F79009"],
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
    stroke: { width: 0 },
  };
  const series = [male, female];
  return (
    <ChartCard title="Gender Split (Enrolled)">
      {male + female > 0 ? (
        <ReactApexChart options={options} series={series} type="donut" height={280} />
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

// ── Applications by program (horizontal bar — program names run long) ────
export function ProgramBarChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "55%" } },
    dataLabels: { enabled: false },
    xaxis: { categories },
    colors: ["#465FFF"],
    grid: { strokeDashArray: 4 },
  };
  return (
    <ChartCard title="Applications by Program">
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Applications", data: values }]}
          type="bar"
          height={Math.max(280, categories.length * 36)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── Enrollment by province (horizontal bar) ───────────────────────────────
export function ProvinceBarChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "55%" } },
    dataLabels: { enabled: false },
    xaxis: { categories },
    colors: ["#12B76A"],
    grid: { strokeDashArray: 4 },
  };
  return (
    <ChartCard title="Enrollment by Province">
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Enrolled", data: values }]}
          type="bar"
          height={280}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── Enrollment by region (horizontal bar) ─────────────────────────────────
export function RegionBarChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "55%" } },
    dataLabels: { enabled: false },
    xaxis: { categories },
    colors: ["#7A5AF8"],
    grid: { strokeDashArray: 4 },
  };
  return (
    <ChartCard title="Enrollment by Region">
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Enrolled", data: values }]}
          type="bar"
          height={280}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── Enrollment by age band (vertical bar) ─────────────────────────────────
export function AgeBandBarChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "35%" } },
    dataLabels: { enabled: false },
    xaxis: { categories },
    colors: ["#F79009"],
    grid: { strokeDashArray: 4 },
  };
  return (
    <ChartCard title="Enrollment by Age Band">
      {values.length > 0 ? (
        <ReactApexChart
          options={options}
          series={[{ name: "Enrolled", data: values }]}
          type="bar"
          height={280}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}
