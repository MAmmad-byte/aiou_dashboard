import React from "react";
import { LmsKpis } from "@/types/lms";

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

function Icon({ path, className }: { path: string; className?: string }) {
  return (
    <svg className={`h-6 w-6 ${className ?? ""}`} viewBox="0 0 24 24" fill="none">
      <path d={path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  students: "M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z",
  doc: "M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6ZM14 2v6h5",
  workshop: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z",
  quiz: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 12h.01",
  layers: "M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5",
  users: "M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
};

export default function LmsMetrics({ kpis }: { kpis: LmsKpis }) {
  const cards: MetricCardProps[] = [
    {
      label: "Total Students",
      value: kpis.totalStudents.toLocaleString(),
      iconBg: "bg-brand-50 dark:bg-brand-500/10",
      icon: <Icon path={ICONS.students} className="text-brand-500" />,
    },
    {
      label: "Total Enrollment",
      value: kpis.totalEnrollment.toLocaleString(),
      iconBg: "bg-blue-light-50 dark:bg-blue-light-500/10",
      icon: <Icon path={ICONS.users} className="text-blue-light-500" />,
    },
    {
      label: "Assignments Submitted",
      value: kpis.assignmentsSubmitted.toLocaleString(),
      iconBg: "bg-warning-50 dark:bg-warning-500/10",
      icon: <Icon path={ICONS.doc} className="text-warning-500" />,
    },
    {
      label: "Total Workshops",
      value: kpis.totalWorkshops.toLocaleString(),
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
      icon: <Icon path={ICONS.workshop} className="text-orange-500" />,
    },
    {
      label: "Quiz Conducted",
      value: kpis.quizConducted.toLocaleString(),
      iconBg: "bg-success-50 dark:bg-success-500/10",
      icon: <Icon path={ICONS.quiz} className="text-success-500" />,
    },
    {
      label: "Quiz Attempted",
      value: kpis.quizAttempted.toLocaleString(),
      iconBg: "bg-error-50 dark:bg-error-500/10",
      icon: <Icon path={ICONS.target} className="text-error-500" />,
    },
    {
      label: "Total Courses",
      value: kpis.totalCourses.toLocaleString(),
      iconBg: "bg-gray-100 dark:bg-white/[0.05]",
      icon: <Icon path={ICONS.book} className="text-gray-500 dark:text-gray-400" />,
    },
    {
      label: "Workshop Batches",
      value: kpis.workshopBatches.toLocaleString(),
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
      icon: <Icon path={ICONS.layers} className="text-purple-500" />,
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
