import React from "react";
import { OasKpis } from "@/types/oas";

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
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <h4 className="mt-1 text-title-sm font-bold text-gray-800 dark:text-white/90">
          {value}
        </h4>
      </div>
    </div>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-6 w-6 ${className ?? ""}`} viewBox="0 0 24 24" fill="none">
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-6 w-6 ${className ?? ""}`} viewBox="0 0 24 24" fill="none">
      <path
        d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PercentIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-6 w-6 ${className ?? ""}`} viewBox="0 0 24 24" fill="none">
      <path
        d="M19 5L5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-6 w-6 ${className ?? ""}`} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function OasMetrics({ kpis }: { kpis: OasKpis }) {
  const cards: MetricCardProps[] = [
    {
      label: "Applications Received",
      value: kpis.totalApplications.toLocaleString(),
      iconBg: "bg-brand-50 dark:bg-brand-500/10",
      icon: <UsersIcon className="text-brand-500" />,
    },
    {
      label: "Total Enrolled",
      value: kpis.totalEnrolled.toLocaleString(),
      iconBg: "bg-success-50 dark:bg-success-500/10",
      icon: <CheckIcon className="text-success-500" />,
    },
    {
      label: "Male Enrolled",
      value: kpis.male.toLocaleString(),
      iconBg: "bg-blue-light-50 dark:bg-blue-light-500/10",
      icon: <UsersIcon className="text-blue-light-500" />,
    },
    {
      label: "Female Enrolled",
      value: kpis.female.toLocaleString(),
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
      icon: <UsersIcon className="text-orange-500" />,
    },
    {
      label: "Enrollment Rate",
      value: `${kpis.enrollmentRate.toFixed(1)}%`,
      iconBg: "bg-warning-50 dark:bg-warning-500/10",
      icon: <PercentIcon className="text-warning-500" />,
    },
    {
      label: "Programs",
      value: kpis.programs.toLocaleString(),
      iconBg: "bg-gray-100 dark:bg-white/[0.05]",
      icon: <BookIcon className="text-gray-500 dark:text-gray-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6 md:gap-6">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  );
}
