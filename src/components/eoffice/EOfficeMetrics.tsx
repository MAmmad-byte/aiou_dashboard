import React from "react";
import { EOfficeKpis } from "@/types/eoffice";

interface MetricCardProps {
  id: string;
  label: string;
  value: string;
  iconBg: string;
  icon: React.ReactNode;
}

function MetricCard({ label, value, iconBg, icon }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
        {icon}
      </div>
      <div className="mt-5">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <h4 className="mt-1 text-title-xs font-bold text-gray-800 dark:text-white/90">
          {value}
        </h4>
      </div>
    </div>
  );
}

function Icon({ path, className }: { path: string; className?: string }) {
  return (
    <svg className={`h-6 w-6 ${className ?? ""}`} viewBox="0 0 24 24" fill="none">
      <path d={path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  doc: "M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6ZM14 2v6h5",
  open: "M4 4a2 2 0 0 1 2-2h5l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z",
  check: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2",
  percent: "M19 5L5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  timer: "M10 2h4M12 14l3-3M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z",
  map: "M9 20l-6-3V4l6 3m0 13 6-3m-6 3V7m6 10 6 3V7l-6-3m0 13V4m0 3-6-3",
};

export default function EOfficeMetrics({
  kpis,
  metricLabel,
  metricValue,
}: {
  kpis: EOfficeKpis;
  /** Label/value for the first card — "Total Files" by default, or e.g.
   * "Open Files" / "Urgent Priority Files" when the Status/Priority lens is
   * active (see resolveMetric in lib/eoffice-data.ts). */
  metricLabel: string;
  metricValue: number;
}) {
  const cards: MetricCardProps[] = [
    {
      id: "metric",
      label: metricLabel,
      value: metricValue.toLocaleString(),
      iconBg: "bg-brand-50 dark:bg-brand-500/10",
      icon: <Icon path={ICONS.doc} className="text-brand-500" />,
    },
    {
      id: "open",
      label: "Open Files",
      value: kpis.openFiles.toLocaleString(),
      iconBg: "bg-blue-light-50 dark:bg-blue-light-500/10",
      icon: <Icon path={ICONS.open} className="text-blue-light-500" />,
    },
    {
      id: "closed",
      label: "Closed Files",
      value: kpis.closedFiles.toLocaleString(),
      iconBg: "bg-success-50 dark:bg-success-500/10",
      icon: <Icon path={ICONS.check} className="text-success-500" />,
    },
    {
      id: "pending",
      label: "Pending Files",
      value: kpis.pendingFiles.toLocaleString(),
      iconBg: "bg-warning-50 dark:bg-warning-500/10",
      icon: <Icon path={ICONS.clock} className="text-warning-500" />,
    },
    {
      id: "closureRate",
      label: "Closure Rate",
      value: `${kpis.closureRate.toFixed(1)}%`,
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
      icon: <Icon path={ICONS.percent} className="text-purple-500" />,
    },
    {
      id: "turnaround",
      label: "Avg Turnaround",
      value: `${kpis.avgTurnaroundTime.toFixed(1)} days`,
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
      icon: <Icon path={ICONS.timer} className="text-orange-500" />,
    },
    {
      id: "response",
      label: "Avg. Res Time",
      value: `${kpis.avgResponseTime.toFixed(1)} days`,
      iconBg: "bg-error-50 dark:bg-error-500/10",
      icon: <Icon path={ICONS.timer} className="text-error-500" />,
    },
    {
      id: "departments",
      label: "Departments",
      value: kpis.departmentCount.toLocaleString(),
      iconBg: "bg-gray-100 dark:bg-white/[0.05]",
      icon: <Icon path={ICONS.map} className="text-gray-500 dark:text-gray-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8 md:gap-6">
      {cards.map((card) => (
        <MetricCard key={card.id} {...card} />
      ))}
    </div>
  );
}
