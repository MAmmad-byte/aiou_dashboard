import React from "react";
import { OasApplicantKpis } from "@/types/oas-applicant";
import { FIELD_DESCRIPTIONS } from "@/lib/oas-applicant-labels";

interface MetricCardProps {
  id: string;
  label: string;
  value: string;
  description?: string;
  iconBg: string;
  icon: React.ReactNode;
}

function MetricCard({ label, value, description, iconBg, icon }: MetricCardProps) {
  return (
    <div
      className="group relative rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
      title={description}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
      <div className="mt-5">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <h4 className="mt-1 text-title-sm font-bold text-gray-800 dark:text-white/90">{value}</h4>
      </div>
      {description && (
        <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 shadow-theme-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
          {description}
        </div>
      )}
    </div>
  );
}

function FunnelIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-6 w-6 ${className ?? ""}`} viewBox="0 0 24 24" fill="none">
      <path d="M3 4h18l-7 9v6l-4 2v-8L3 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function OasApplicantMetrics({ kpis }: { kpis: OasApplicantKpis }) {
  const cards: MetricCardProps[] = [
    {
      id: "total",
      label: "Total Applicants",
      value: kpis.totalApplicants.toLocaleString(),
      description: "Verified + Submitted + Not Submitted + Under Objection",
      iconBg: "bg-brand-50 dark:bg-brand-500/10",
      icon: <FunnelIcon className="text-brand-500" />,
    },
    {
      id: "verified",
      label: "Verified",
      value: kpis.verified.toLocaleString(),
      description: FIELD_DESCRIPTIONS.verified,
      iconBg: "bg-success-50 dark:bg-success-500/10",
      icon: <FunnelIcon className="text-success-500" />,
    },
    {
      id: "submitted",
      label: "Submitted",
      value: kpis.submitted.toLocaleString(),
      description: FIELD_DESCRIPTIONS.submitted,
      iconBg: "bg-blue-light-50 dark:bg-blue-light-500/10",
      icon: <FunnelIcon className="text-blue-light-500" />,
    },
    {
      id: "not_submitted",
      label: "Not Submitted",
      value: kpis.notSubmitted.toLocaleString(),
      description: FIELD_DESCRIPTIONS.not_submitted,
      iconBg: "bg-gray-100 dark:bg-white/[0.05]",
      icon: <FunnelIcon className="text-gray-500 dark:text-gray-400" />,
    },
    {
      id: "objection",
      label: "Under Objection",
      value: kpis.objection.toLocaleString(),
      description: FIELD_DESCRIPTIONS.objection,
      iconBg: "bg-warning-50 dark:bg-warning-500/10",
      icon: <FunnelIcon className="text-warning-500" />,
    },
    {
      id: "fee_verified",
      label: "Fee Verified",
      value: kpis.feeVerified.toLocaleString(),
      description: FIELD_DESCRIPTIONS.fee_verified_count,
      iconBg: "bg-success-50 dark:bg-success-500/10",
      icon: <FunnelIcon className="text-success-500" />,
    },
    {
      id: "verification_rate",
      label: "Verification Rate",
      value: `${kpis.verificationRate.toFixed(1)}%`,
      description: "Verified ÷ Total Applicants",
      iconBg: "bg-brand-50 dark:bg-brand-500/10",
      icon: <FunnelIcon className="text-brand-500" />,
    },
    {
      id: "regions_programs",
      label: "Regions / Programs",
      value: `${kpis.regionCount} / ${kpis.programCount}`,
      description: "Distinct regions and programs represented under the current filters",
      iconBg: "bg-gray-100 dark:bg-white/[0.05]",
      icon: <FunnelIcon className="text-gray-500 dark:text-gray-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 md:gap-6">
      {cards.map((card) => (
        <MetricCard key={card.id} {...card} />
      ))}
    </div>
  );
}
