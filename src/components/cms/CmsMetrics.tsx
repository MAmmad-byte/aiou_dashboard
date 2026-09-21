import React from "react";
import { CmsKpis } from "@/types/cms";

interface MetricCardProps {
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
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
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
  users: "M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  check: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11",
  x: "M18 6 6 18M6 6l12 12",
  percent: "M19 5L5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  male: "M9 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM19 5l-4.35 4.35M19 5h-4M19 5v4",
  female: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 15v7M9 19h6",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z",
  map: "M9 20l-6-3V4l6 3m0 13 6-3m-6 3V7m6 10 6 3V7l-6-3m0 13V4m0 3-6-3",
};

export default function CmsMetrics({ kpis }: { kpis: CmsKpis }) {
  const cards: MetricCardProps[] = [
    {
      label: "Total Enrollment",
      value: kpis.totalEnroll.toLocaleString(),
      iconBg: "bg-brand-50 dark:bg-brand-500/10",
      icon: <Icon path={ICONS.users} className="text-brand-500" />,
    },
    {
      label: "Active Enrollment",
      value: kpis.activeEnroll.toLocaleString(),
      iconBg: "bg-success-50 dark:bg-success-500/10",
      icon: <Icon path={ICONS.check} className="text-success-500" />,
    },
    {
      label: "Discontinued",
      value: kpis.discontinueEnroll.toLocaleString(),
      iconBg: "bg-error-50 dark:bg-error-500/10",
      icon: <Icon path={ICONS.x} className="text-error-500" />,
    },
    {
      label: "Retention Rate",
      value: `${kpis.retentionRate.toFixed(1)}%`,
      iconBg: "bg-warning-50 dark:bg-warning-500/10",
      icon: <Icon path={ICONS.percent} className="text-warning-500" />,
    },
    {
      label: "Male Enrolled",
      value: kpis.male.toLocaleString(),
      iconBg: "bg-blue-light-50 dark:bg-blue-light-500/10",
      icon: <Icon path={ICONS.male} className="text-blue-light-500" />,
    },
    {
      label: "Female Enrolled",
      value: kpis.female.toLocaleString(),
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
      icon: <Icon path={ICONS.female} className="text-orange-500" />,
    },
    {
      label: "Programs",
      value: kpis.programCount.toLocaleString(),
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
      icon: <Icon path={ICONS.book} className="text-purple-500" />,
    },
    {
      label: "Regions",
      value: kpis.regionCount.toLocaleString(),
      iconBg: "bg-gray-100 dark:bg-white/[0.05]",
      icon: <Icon path={ICONS.map} className="text-gray-500 dark:text-gray-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8 md:gap-6">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  );
}
