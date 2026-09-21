import React from "react";
import { TmsKpis } from "@/types/tms";

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
  teacher: "M12 14l9-5-9-5-9 5 9 5ZM12 14l6.16-3.42A9 9 0 0 1 21 12v5M5 12v5c0 1 3 3 7 3s7-2 7-3v-5",
  gauge: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 3a9 9 0 0 0-9 9M12 3a9 9 0 0 1 9 9M4.2 18a9 9 0 0 1-.9-3M19.8 18a9 9 0 0 0 .9-3",
  percent: "M19 5L5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  doc: "M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6ZM14 2v6h5",
  map: "M9 20l-6-3V4l6 3m0 13 6-3m-6 3V7m6 10 6 3V7l-6-3m0 13V4m0 3-6-3",
};

export default function TmsMetrics({ kpis }: { kpis: TmsKpis }) {
  const cards: MetricCardProps[] = [
    {
      label: "Total Students",
      value: kpis.totalStudents.toLocaleString(),
      iconBg: "bg-brand-50 dark:bg-brand-500/10",
      icon: <Icon path={ICONS.users} className="text-brand-500" />,
    },
    {
      label: "Allocated Students",
      value: kpis.allocatedStudents.toLocaleString(),
      iconBg: "bg-success-50 dark:bg-success-500/10",
      icon: <Icon path={ICONS.check} className="text-success-500" />,
    },
    {
      label: "Allocated Tutors",
      value: kpis.allocatedTutors.toLocaleString(),
      iconBg: "bg-blue-light-50 dark:bg-blue-light-500/10",
      icon: <Icon path={ICONS.teacher} className="text-blue-light-500" />,
    },
    {
      label: "Eligible Tutors",
      value: kpis.eligibleTutors.toLocaleString(),
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
      icon: <Icon path={ICONS.teacher} className="text-purple-500" />,
    },
    {
      label: "Student Allocation",
      value: `${kpis.studentAllocationRate.toFixed(1)}%`,
      iconBg: "bg-warning-50 dark:bg-warning-500/10",
      icon: <Icon path={ICONS.percent} className="text-warning-500" />,
    },
    {
      label: "Tutor Utilization",
      value: `${kpis.tutorUtilizationRate.toFixed(1)}%`,
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
      icon: <Icon path={ICONS.gauge} className="text-orange-500" />,
    },
    {
      label: "Confirmed Files",
      value: kpis.confirmedFiles.toLocaleString(),
      iconBg: "bg-error-50 dark:bg-error-500/10",
      icon: <Icon path={ICONS.doc} className="text-error-500" />,
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
      {cards.map((card, i) => (
        <MetricCard key={i} {...card} />
      ))}
    </div>
  );
}
