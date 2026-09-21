"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterDropdown from "./FilterDropdown";
import { TmsFilterOptions, TmsFilterValues } from "@/types/tms";
import { useTmsTransition } from "./TmsTransitionProvider";

interface TmsFiltersProps {
  options: TmsFilterOptions;
  current: TmsFilterValues;
  /** What Semester resolves to with no ?semester= param at all (the latest
   * semester in the dataset) — used only to know whether Reset should show. */
  semesterDefault: string;
}

export default function TmsFilters({ options, current, semesterDefault }: TmsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPending, startTmsTransition } = useTmsTransition();

  // Semester behaves like Year did on the CMS page: absence of the param
  // means "default to the latest semester", not "All semesters" — so
  // picking "All Semesters" has to write an explicit ?semester=All rather
  // than deleting the param.
  function setParam(key: string, value: string, deleteOnAll: boolean = true) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" && deleteOnAll) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    startTmsTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  function resetAll() {
    startTmsTransition(() => {
      router.push(pathname);
    });
  }

  const hasActiveFilter = current.semester !== semesterDefault || current.region !== "All";

  return (
    <div className={`flex flex-wrap gap-3 ${isPending ? "opacity-60" : ""}`}>
      <FilterDropdown
        label="Semesters"
        options={options.semesters}
        selected={current.semester}
        onChange={(v) => setParam("semester", v, false)}
      />
      <FilterDropdown
        label="Regions"
        options={options.regions}
        selected={current.region}
        onChange={(v) => setParam("region", v)}
        searchable
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
