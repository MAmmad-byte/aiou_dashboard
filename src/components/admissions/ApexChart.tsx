"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

const RawApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type ApexChartProps = React.ComponentProps<typeof RawApexChart>;

/**
 * Drop-in replacement for react-apexcharts' default export. Every
 * *Charts.tsx file across the app (Cms/EOffice/Tms/Erp/Lms/Oas) currently
 * does `const ReactApexChart = dynamic(() => import("react-apexcharts"), {
 * ssr: false })` locally and renders that directly — this wrapper fixes a
 * real bug in that pattern and is meant to replace it everywhere, not just
 * here.
 *
 * The bug: on a hard page refresh, the browser finishes layout before any
 * JS runs, so by the time ApexCharts initializes, its container already has
 * its final width. On a Next.js client-side navigation (clicking a sidebar
 * Link), there's no such guarantee — React can commit the new page's DOM
 * and run effects before the browser has finished settling layout/paint,
 * so ApexCharts can measure a zero-width or stale-width container and
 * render nothing (or a broken layout) that then never corrects itself,
 * because nothing tells it to re-measure later. A hard refresh doesn't fix
 * the chart, it just removes the race condition that exposes the bug.
 *
 * Fix: delay actually mounting the chart until one animation frame after
 * this wrapper itself mounts (letting the browser finish the current
 * layout/paint pass first), then dispatch a `resize` event shortly after —
 * ApexCharts listens for window resize itself and will re-measure its
 * container against it, catching the rare case where even the delayed
 * mount still raced a slower layout pass (e.g. sidebar collapse animations).
 *
 * This does NOT replace the `key={...}` props already on individual charts
 * that force a remount when filter data changes — that's a different bug
 * (stale series/categories on an already-mounted chart) and both fixes are
 * meant to work together.
 */
export default function ApexChart(props: ApexChartProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => window.dispatchEvent(new Event("resize")), 60);
    return () => clearTimeout(t);
  }, [ready]);

  if (!ready) {
    const h = typeof props.height === "number" || typeof props.height === "string" ? props.height : undefined;
    return <div style={{ width: "100%", height: h }} />;
  }

  return <RawApexChart {...props} />;
}
