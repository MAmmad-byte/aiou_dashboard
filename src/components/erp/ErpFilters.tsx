"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterDropdown from "./FilterDropdown";
import { ErpFilterOptions, ErpFilterValues } from "@/types/erp";
import { useErpTransition } from "./ErpTransitionProvider";

interface ErpFiltersProps {
  options: ErpFilterOptions;
  current: ErpFilterValues;
}

export default function ErpFilters({ options, current }: ErpFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPending, startErpTransition } = useErpTransition();

  function push(params: URLSearchParams) {
    const query = params.toString();
    startErpTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  // Departments belong to a campus (Main Campus has ~85, each Regional
  // Office has 1-3, barely overlapping) — changing Campus clears whatever
  // Department was selected, since it's very unlikely to exist under the
  // newly selected campus.
  function setCampus(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") params.delete("campus");
    else params.set("campus", value);
    params.delete("department");
    push(params);
  }

  function setSimple(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") params.delete(key);
    else params.set(key, value);
    push(params);
  }

  function resetAll() {
    startErpTransition(() => {
      router.push(pathname);
    });
  }

  const hasActiveFilter =
    current.campus !== "All" ||
    current.department !== "All" ||
    current.budgetType !== "All" ||
    current.fiscalYear !== "All";

  return (
    <div className={`flex flex-wrap gap-3 ${isPending ? "opacity-60" : ""}`}>
      <FilterDropdown label="Campuses" options={options.campuses} selected={current.campus} onChange={setCampus} />
      <FilterDropdown
        label="Departments"
        options={options.departments}
        selected={current.department}
        onChange={(v) => setSimple("department", v)}
        searchable
      />
      <FilterDropdown
        label="Budget Types"
        options={options.budgetTypes}
        selected={current.budgetType}
        onChange={(v) => setSimple("budgetType", v)}
      />
      <FilterDropdown
        label="Fiscal Years"
        options={options.fiscalYears}
        selected={current.fiscalYear}
        onChange={(v) => setSimple("fiscalYear", v)}
      />
      {hasActiveFilter && (
        <button
          onClick={resetAll}
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05]"
        >
          Reset
        </button>
      )}
    </div>
  );
}
