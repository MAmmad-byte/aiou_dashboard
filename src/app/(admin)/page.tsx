// import type { Metadata } from "next";
// import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
// import React from "react";
// import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
// import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "@/components/ecommerce/StatisticsChart";
// import RecentOrders from "@/components/ecommerce/RecentOrders";
// import DemographicCard from "@/components/ecommerce/DemographicCard";
// import { ftsDb } from "@/lib/prisma";

// export const metadata: Metadata = {
//   title:
//     "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
//   description: "This is Next.js Home for TailAdmin Dashboard Template",
// };
// export default async function Ecommerce() {
//   const ftsStats = await ftsDb.e_OFFICE_STATS.findMany({
//     take: 5,
//   });
//   return (
//     <div className="grid grid-cols-12 gap-4 md:gap-6">
//       <div className="col-span-12 space-y-6 xl:col-span-7">
//         <EcommerceMetrics />

//         <MonthlySalesChart />
//       </div>

//       <div className="col-span-12 xl:col-span-5">
//         <MonthlyTarget />
//       </div>

//       <div className="col-span-12">
//         <StatisticsChart />
//       </div>

//       <div className="col-span-12 xl:col-span-5">
//         <DemographicCard />
//       </div>

//       <div className="col-span-12 xl:col-span-7">
//         <RecentOrders />
//       </div>
//     </div>
//   );
// }
import type { Metadata } from "next";
import React from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AIOU Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "AIOU Dashboard — select a system to view its analytics",
};

function Icon({ path, className }: { path: string; className?: string }) {
  return (
    <svg className={`h-7 w-7 ${className ?? ""}`} viewBox="0 0 24 24" fill="none">
      <path d={path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  eoffice: "M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6ZM14 2v6h5",
  erp: "M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 0 0 0 4h4v-4Z",
  tms: "M12 14l9-5-9-5-9 5 9 5ZM12 14l6.16-3.42A9 9 0 0 1 21 12v5M5 12v5c0 1 3 3 7 3s7-2 7-3v-5",
  oas: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11",
  admissions: "M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  lms: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z",
};

const SYSTEMS = [
  { title: "E-Office", href: "/eoffice", icon: ICONS.eoffice, iconBg: "bg-warning-50 dark:bg-warning-500/10", iconColor: "text-warning-500" },
  { title: "ERP", href: "/erp", icon: ICONS.erp, iconBg: "bg-orange-50 dark:bg-orange-500/10", iconColor: "text-orange-500" },
  { title: "TMS", href: "/tms", icon: ICONS.tms, iconBg: "bg-purple-50 dark:bg-purple-500/10", iconColor: "text-purple-500" },
  { title: "OAS", href: "/oas", icon: ICONS.oas, iconBg: "bg-blue-light-50 dark:bg-blue-light-500/10", iconColor: "text-blue-light-500" },
  { title: "Admissions", href: "/admissions", icon: ICONS.admissions, iconBg: "bg-brand-50 dark:bg-brand-500/10", iconColor: "text-brand-500" },
  { title: "LMS", href: "/lms", icon: ICONS.lms, iconBg: "bg-success-50 dark:bg-success-500/10", iconColor: "text-success-500" },
];

// Static landing page — no data fetching, no filters, no redirect. Just a
// title and a set of links into each system's own dashboard.
export default function Home() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold tracking-wide text-gray-800 dark:text-white/90 sm:text-4xl">
        AIOU DASHBOARD
      </h1>
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Select a system to view its dashboard
      </p>

      <div className="mt-10 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
        {SYSTEMS.map((system) => (
          <Link
            key={system.href}
            href={system.href}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/40 dark:hover:bg-brand-500/[0.06]"
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${system.iconBg}`}>
              <Icon path={system.icon} className={system.iconColor} />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-brand-600 dark:text-gray-300 dark:group-hover:text-brand-400">
              {system.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
