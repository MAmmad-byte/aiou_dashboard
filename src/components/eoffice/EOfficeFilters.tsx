"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterDropdown from "./FilterDropdown";
import { EOfficeFilterOptions, EOfficeFilterValues } from "@/types/eoffice";
import { useEOfficeTransition } from "./EOfficeTransitionProvider";

interface EOfficeFiltersProps {
  options: EOfficeFilterOptions;
  current: EOfficeFilterValues;
}

export default function EOfficeFilters({ options, current }: EOfficeFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPending, startEOfficeTransition } = useEOfficeTransition();

  function push(params: URLSearchParams) {
    const query = params.toString();
    startEOfficeTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  function setDepartment(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") params.delete("department");
    else params.set("department", value);
    push(params);
  }

  // Status and Priority are mutually exclusive lenses on the same
  // underlying columns (see resolveMetric in lib/eoffice-data.ts) — picking
  // one clears the other rather than leaving a combination that doesn't
  // correspond to any real data (there's no "Open AND Urgent" count in the
  // table, each is its own column on every row).
  function setStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") params.delete("status");
    else params.set("status", value);
    params.delete("priority");
    push(params);
  }

  function setPriority(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") params.delete("priority");
    else params.set("priority", value);
    params.delete("status");
    push(params);
  }

  function resetAll() {
    startEOfficeTransition(() => {
      router.push(pathname);
    });
  }

  const hasActiveFilter = current.department !== "All" || current.status !== "All" || current.priority !== "All";

  return (
    <div className={`flex flex-wrap items-center gap-3 ${isPending ? "opacity-60" : ""}`}>
      <FilterDropdown
        label="Departments"
        options={options.departments}
        selected={current.department}
        onChange={setDepartment}
        searchable
      />
      <FilterDropdown
        label="Statuses"
        options={options.statuses}
        selected={current.status}
        onChange={setStatus}
      />
      <FilterDropdown
        label="Priorities"
        options={options.priorities}
        selected={current.priority}
        onChange={setPriority}
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
