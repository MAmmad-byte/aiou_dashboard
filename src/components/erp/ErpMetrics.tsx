import React from "react";
import { ErpKpis } from "@/types/erp";

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
  wallet: "M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 0 0 0 4h4v-4Z",
  spend: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  balance: "M12 2v20M2 12h20M5 5l14 14M19 5 5 19",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2",
  percent: "M19 5L5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z",
  map: "M9 20l-6-3V4l6 3m0 13 6-3m-6 3V7m6 10 6 3V7l-6-3m0 13V4m0 3-6-3",
};

function fmtMoney(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `PKR ${(v / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `PKR ${(v / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `PKR ${(v / 1_000).toFixed(1)}K`;
  return `PKR ${v.toLocaleString()}`;
}

export default function ErpMetrics({ kpis }: { kpis: ErpKpis }) {
  const cards: MetricCardProps[] = [
    {
      label: "Total Budget",
      value: fmtMoney(kpis.totalCommitment),
      iconBg: "bg-brand-50 dark:bg-brand-500/10",
      icon: <Icon path={ICONS.wallet} className="text-brand-500" />,
    },
    {
      label: "Total Expense",
      value: fmtMoney(kpis.totalExpense),
      iconBg: "bg-error-50 dark:bg-error-500/10",
      icon: <Icon path={ICONS.spend} className="text-error-500" />,
    },
    {
      label: "Total Balance",
      value: fmtMoney(kpis.totalBalance),
      iconBg: "bg-success-50 dark:bg-success-500/10",
      icon: <Icon path={ICONS.balance} className="text-success-500" />,
    },
    {
      label: "Encumbrance",
      value: fmtMoney(kpis.totalEncumbrance),
      iconBg: "bg-blue-light-50 dark:bg-blue-light-500/10",
      icon: <Icon path={ICONS.clock} className="text-blue-light-500" />,
    },
    {
      label: "Pre-Encumbrance",
      value: fmtMoney(kpis.totalPreEncumbrance),
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
      icon: <Icon path={ICONS.clock} className="text-orange-500" />,
    },
    {
      label: "Utilization Rate",
      value: `${kpis.utilizationRate.toFixed(1)}%`,
      iconBg: "bg-warning-50 dark:bg-warning-500/10",
      icon: <Icon path={ICONS.percent} className="text-warning-500" />,
    },
    {
      label: "Departments",
      value: kpis.departmentCount.toLocaleString(),
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
      icon: <Icon path={ICONS.book} className="text-purple-500" />,
    },
    {
      label: "Campuses",
      value: kpis.campusCount.toLocaleString(),
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
