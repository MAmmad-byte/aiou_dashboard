"use client";

import type { ApexOptions } from "apexcharts";
import React from "react";
import ApexChart from "@/components/oas/ApexChart";
import { SemesterTrendPoint, AgeBandPoint } from "@/types/oas-applicant";
import { STATUS_COLORS, GENDER_COLORS } from "@/lib/oas-applicant-labels";

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

const numberFormatter = (v: number) => v.toLocaleString();

// ── 1. Applications trend by semester (bar, multi-series) ─────────────────
// Bar, not area/line: an area/line chart renders an effectively invisible
// single dot when there's only one x-axis category — guaranteed whenever a
// specific Semester is selected (the default filter state here). Bars stay
// clearly visible and readable regardless of category count.
export function ApplicationsTrendChart({ data }: { data: SemesterTrendPoint[] }) {
  const categories = data.map((d) => d.semester);
  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: data.length <= 1 ? "35%" : "55%" } },
    dataLabels: { enabled: data.length <= 1, style: { fontSize: "11px" } },
    xaxis: { categories, title: { text: "Semester" } },
    yaxis: { title: { text: "Applicants" } },
    colors: [STATUS_COLORS.Verified, STATUS_COLORS.Submitted, STATUS_COLORS["Not Submitted"], STATUS_COLORS["Under Objection"]],
    legend: { position: "bottom" },
    grid: { strokeDashArray: 4 },
    tooltip: {
      y: { formatter: (v: number) => `${numberFormatter(v)} applicants` },
    },
  };
  const series = [
    { name: "Verified", data: data.map((d) => d.verified) },
    { name: "Submitted", data: data.map((d) => d.submitted) },
    { name: "Not Submitted", data: data.map((d) => d.notSubmitted) },
    { name: "Under Objection", data: data.map((d) => d.objection) },
  ];
  const chartKey = categories.join("|");
  return (
    <ChartCard title="Applications Trend by Semester" subtitle="Applicant counts by processing status, per semester">
      {data.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={series} type="bar" height={340} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 2. Status breakdown (donut) ────────────────────────────────────────────
export function StatusDonutChart({ data }: { data: [string, number][] }) {
  const labels = data.map(([k]) => k);
  const series = data.map(([, v]) => v);
  const options: ApexOptions = {
    chart: { type: "donut", fontFamily: "Outfit, sans-serif" },
    labels,
    colors: labels.map((l) => STATUS_COLORS[l] ?? "#98A2B3"),
    legend: { position: "bottom" },
    stroke: { width: 0 },
    dataLabels: {
      enabled: true,
      // One color per slice, not a single shared value — ApexCharts
      // otherwise applies only the first entry to every label.
      style: { colors: data.map(() => "#FFFFFF"), fontWeight: 600 },
      dropShadow: { enabled: false },
    },
    tooltip: {
      y: { formatter: (v: number) => `${numberFormatter(v)} applicants` },
    },
  };
  const chartKey = labels.join("|");
  return (
    <ChartCard title="Application Status" subtitle="Where applicants stand in the review funnel">
      {series.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={series} type="donut" height={300} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 3. Gender breakdown (donut) ────────────────────────────────────────────
export function GenderDonutChart({ data }: { data: [string, number][] }) {
  const labels = data.map(([k]) => k);
  const series = data.map(([, v]) => v);
  const options: ApexOptions = {
    chart: { type: "donut", fontFamily: "Outfit, sans-serif" },
    labels,
    colors: labels.map((l) => GENDER_COLORS[l] ?? "#98A2B3"),
    legend: { position: "bottom" },
    stroke: { width: 0 },
    dataLabels: {
      enabled: true,
      style: { colors: data.map(() => "#FFFFFF"), fontWeight: 600 },
      dropShadow: { enabled: false },
    },
    tooltip: {
      y: { formatter: (v: number) => `${numberFormatter(v)} applicants` },
    },
  };
  const chartKey = labels.join("|");
  return (
    <ChartCard title="Applicants by Gender">
      {series.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={series} type="donut" height={300} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 4. Age band breakdown (bar) ────────────────────────────────────────────
export function AgeBandChart({ data }: { data: AgeBandPoint[] }) {
  const categories = data.map((d) => d.band);
  const values = data.map((d) => d.count);
  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "45%", distributed: true } },
    dataLabels: { enabled: false },
    xaxis: { categories, title: { text: "Age Band" } },
    yaxis: { title: { text: "Applicants" } },
    colors: ["#465FFF", "#7A5AF8", "#12B76A", "#F79009", "#F04438"],
    legend: { show: false },
    grid: { strokeDashArray: 4 },
    tooltip: { y: { formatter: (v: number) => `${numberFormatter(v)} applicants` } },
  };
  const chartKey = categories.join("|");
  return (
    <ChartCard title="Applicants by Age Band">
      {values.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={[{ name: "Applicants", data: values }]} type="bar" height={300} />
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

// ── 5. Top Regions ──────────────────────────────────────────────────────
export function TopRegionsChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "65%" } },
    dataLabels: { enabled: false },
    xaxis: { categories, title: { text: "Applicants" } },
    colors: ["#465FFF"],
    grid: { strokeDashArray: 4 },
    tooltip: { y: { formatter: (v: number) => `${numberFormatter(v)} applicants` } },
  };
  const chartKey = categories.join("|");
  return (
    <ChartCard title="Top Regions" subtitle="By total applicants (province, or nearest equivalent for overseas applicants)">
      {values.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={[{ name: "Applicants", data: values }]} type="bar" height={360} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 6. Top Programs ──────────────────────────────────────────────────────
export function TopProgramsChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "65%" } },
    dataLabels: { enabled: false },
    xaxis: { categories, title: { text: "Applicants" } },
    colors: ["#12B76A"],
    grid: { strokeDashArray: 4 },
    tooltip: { y: { formatter: (v: number) => `${numberFormatter(v)} applicants` } },
  };
  const chartKey = categories.join("|");
  return (
    <ChartCard title="Top Programs" subtitle="By total applicants under the current filters">
      {values.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={[{ name: "Applicants", data: values }]} type="bar" height={420} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 7. Fee verification rate (radial) ─────────────────────────────────────
export function FeeVerificationRadialChart({ rate }: { rate: number }) {
  const rounded = Math.round(rate * 10) / 10;
  const options: ApexOptions = {
    chart: { type: "radialBar", fontFamily: "Outfit, sans-serif" },
    plotOptions: {
      radialBar: {
        hollow: { size: "65%" },
        dataLabels: {
          value: { fontSize: "26px", fontWeight: 700, formatter: () => `${rounded}%` },
          name: { show: false },
        },
      },
    },
    colors: ["#12B76A"],
    tooltip: { enabled: true, y: { formatter: () => `${rounded}% of applicants` } },
  };
  return (
    <ChartCard title="Fee Verification Rate" subtitle="Share of applicants with a confirmed fee payment">
      <ApexChart options={options} series={[rounded]} type="radialBar" height={280} />
    </ChartCard>
  );
}

// ── 8. Top overseas countries (bonus — not one of the 3 required filters,
// but the dataset carries 93 countries so it's worth surfacing) ──────────
export function TopCountriesChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "65%" } },
    dataLabels: { enabled: false },
    xaxis: { categories, title: { text: "Applicants" } },
    colors: ["#F79009"],
    grid: { strokeDashArray: 4 },
    tooltip: { y: { formatter: (v: number) => `${numberFormatter(v)} applicants` } },
  };
  const chartKey = categories.join("|");
  return (
    <ChartCard title="Top Overseas Countries" subtitle="Applicants outside Pakistan, by country">
      {values.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={[{ name: "Applicants", data: values }]} type="bar" height={320} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}
