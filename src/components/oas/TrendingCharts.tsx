"use client";

import type { ApexOptions } from "apexcharts";
import React from "react";
import ApexChart from "@/components/oas/ApexChart";
import { IntakeTrendPoint } from "@/lib/oas-data";

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

// ── 1. Applications trend by intake (area) ──────────────────────────────
export function IntakeTrendChart({ data }: { data: IntakeTrendPoint[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "area" },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
    xaxis: { categories: data.map((d) => d.intake), labels: { rotate: -45 } },
    colors: ["#465FFF", "#12B76A", "#F79009"],
    legend: { position: "bottom" },
  };
  const series = [
    { name: "Total", data: data.map((d) => d.total) },
    { name: "Submitted", data: data.map((d) => d.submitted) },
    { name: "Verified", data: data.map((d) => d.verified) },
  ];
  const chartKey = data.map((d) => d.intake).join("|");
  return (
    <ChartCard title="Applications Trend by Intake">
      {data.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={series} type="area" height={320} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 2. Fee channel breakdown (donut) ─────────────────────────────────────
export function FeeChannelDonutChart({ data }: { data: [string, number][] }) {
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
  const chartKey = data.map(([k]) => k).join("|");
  return (
    <ChartCard title="Fee Received by Channel">
      {series.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={series} type="donut" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 3. Status breakdown (donut) ──────────────────────────────────────────
export function StatusDonutChart({ data }: { data: [string, number][] }) {
  const colorMap: Record<string, string> = { Verified: "#12B76A", Objection: "#F04438", Pending: "#F79009" };
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "donut" },
    labels: data.map(([k]) => k),
    colors: data.map(([k]) => colorMap[k] ?? "#98A2B3"),
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
    stroke: { width: 0 },
  };
  const series = data.map(([, v]) => v);
  const chartKey = data.map(([k]) => k).join("|");
  return (
    <ChartCard title="Verification Status">
      {series.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={series} type="donut" height={280} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 4. Submission rate (radial gauge) ────────────────────────────────────
export function SubmissionRateRadialChart({ rate }: { rate: number }) {
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
    <ChartCard title="Submission Rate" subtitle="Submitted ÷ Total Applications">
      <ApexChart key={rate.toFixed(1)} options={options} series={[Number(rate.toFixed(1))]} type="radialBar" height={280} />
    </ChartCard>
  );
}

interface BarSeriesProps {
  categories: string[];
  values: number[];
}

// ── 5. Applications by program group (bar) ───────────────────────────────
export function ApplicationsByGroupChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
    xaxis: { categories },
    colors: ["#465FFF"],
  };
  const chartKey = categories.join("|");
  return (
    <ChartCard title="Applications by Program Group">
      {values.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={[{ name: "Applications", data: values }]} type="bar" height={320} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 6. Submitted vs Not Submitted by program group (grouped bar) ─────────
export function SubmissionByGroupChart({ data }: { data: { group: string; submitted: number; notSubmitted: number }[] }) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: "65%" } },
    xaxis: { categories: data.map((d) => d.group) },
    colors: ["#12B76A", "#F04438"],
    legend: { position: "bottom" },
  };
  const series = [
    { name: "Submitted", data: data.map((d) => d.submitted) },
    { name: "Not Submitted", data: data.map((d) => d.notSubmitted) },
  ];
  const chartKey = data.map((d) => d.group).join("|");
  return (
    <ChartCard title="Submitted vs Not Submitted by Program Group" subtitle="Comparison across all groups">
      {data.length > 0 ? (
        <ApexChart key={chartKey} options={options} series={series} type="bar" height={Math.max(320, data.length * 32)} />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 7. Top programs by submitted (horizontal bar) ────────────────────────
export function TopProgramsChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories },
    colors: ["#7A5AF8"],
  };
  const chartKey = categories.join("|");
  return (
    <ChartCard title="Top Programs by Submitted Applications" subtitle={`Top ${categories.length} — respects Program Group / Program filters`}>
      {values.length > 0 ? (
        <ApexChart
          key={chartKey}
          options={options}
          series={[{ name: "Submitted", data: values }]}
          type="bar"
          height={Math.max(320, categories.length * 28)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}

// ── 8. Verification rate by program group (bar, derived %) ──────────────
export function VerificationRateChart({ categories, values }: BarSeriesProps) {
  const options: ApexOptions = {
    ...BASE,
    chart: { ...BASE.chart, type: "bar" },
    plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: "60%" } },
    xaxis: { categories, labels: { formatter: (v) => `${v}%` } },
    colors: ["#F79009"],
  };
  const chartKey = categories.join("|");
  return (
    <ChartCard title="Verification Rate by Program Group" subtitle="Verified ÷ Submitted, ranked highest first">
      {values.length > 0 ? (
        <ApexChart
          key={chartKey}
          options={options}
          series={[{ name: "Verification Rate", data: values }]}
          type="bar"
          height={Math.max(320, categories.length * 28)}
        />
      ) : (
        <EmptyState />
      )}
    </ChartCard>
  );
}
