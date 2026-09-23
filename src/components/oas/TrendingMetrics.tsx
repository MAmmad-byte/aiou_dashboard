import React from "react";
import { TrendingKpis } from "@/types/oas";

interface MetricCardProps {
  label: string;
  value: string;
  iconBg: string;
  icon: React.ReactNode;
}

function MetricCard({ label, value, iconBg, icon }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
      <div className="mt-5">
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
        <h4 className="mt-1 text-title-xs font-bold text-gray-800 dark:text-white/90">{value}</h4>
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
  check: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11",
  x: "M18 6 6 18M6 6l12 12",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2",
  wallet: "M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 0 0 0 4h4v-4Z",
  percent: "M19 5L5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  gauge: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 3a9 9 0 0 0-9 9M12 3a9 9 0 0 1 9 9M4.2 18a9 9 0 0 1-.9-3M19.8 18a9 9 0 0 0 .9-3",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z",
};

export default function TrendingMetrics({ kpis }: { kpis: TrendingKpis }) {
  const cards: MetricCardProps[] = [
    {
      label: "Total Applications",
      value: kpis.totalApplications.toLocaleString(),
      iconBg: "bg-brand-50 dark:bg-brand-500/10",
      icon: <Icon path={ICONS.doc} className="text-brand-500" />,
    },
    {
      label: "Submitted",
      value: kpis.totalSubmitted.toLocaleString(),
      iconBg: "bg-success-50 dark:bg-success-500/10",
      icon: <Icon path={ICONS.check} className="text-success-500" />,
    },
    {
      label: "Not Submitted",
      value: kpis.totalNotSubmitted.toLocaleString(),
      iconBg: "bg-error-50 dark:bg-error-500/10",
      icon: <Icon path={ICONS.x} className="text-error-500" />,
    },
    {
      label: "Pending",
      value: kpis.totalPending.toLocaleString(),
      iconBg: "bg-warning-50 dark:bg-warning-500/10",
      icon: <Icon path={ICONS.clock} className="text-warning-500" />,
    },
    {
      label: "Fee Received",
      value: kpis.totalFeeReceived.toLocaleString(),
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
      icon: <Icon path={ICONS.wallet} className="text-orange-500" />,
    },
    {
      label: "Verified",
      value: kpis.totalVerified.toLocaleString(),
      iconBg: "bg-blue-light-50 dark:bg-blue-light-500/10",
      icon: <Icon path={ICONS.check} className="text-blue-light-500" />,
    },
    {
      label: "Submission Rate",
      value: `${kpis.submissionRate.toFixed(1)}%`,
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
      icon: <Icon path={ICONS.percent} className="text-purple-500" />,
    },
    {
      label: "Verification Rate",
      value: `${kpis.verificationRate.toFixed(1)}%`,
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
      icon: <Icon path={ICONS.gauge} className="text-purple-500" />,
    },
    {
      label: "Programs",
      value: kpis.programCount.toLocaleString(),
      iconBg: "bg-gray-100 dark:bg-white/[0.05]",
      icon: <Icon path={ICONS.book} className="text-gray-500 dark:text-gray-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-9 md:gap-6">
      {cards.map((card, i) => (
        <MetricCard key={i} {...card} />
      ))}
    </div>
  );
}
