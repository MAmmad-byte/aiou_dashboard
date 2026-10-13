"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterDropdown from "./FilterDropdown";
import { AdmissionsFilterOptions, AdmissionsFilterValues } from "@/types/admissions";
import { useAdmissionsTransition } from "./AdmissionsTransitionProvider";

interface AdmissionsFiltersProps {
  options: AdmissionsFilterOptions;
  current: AdmissionsFilterValues;
  /** What Semester resolves to with no ?semester= param at all (the latest
   * semester in the dataset) — used only to know whether Reset should show. */
  semesterDefault: string;
}

export default function AdmissionsFilters({ options, current, semesterDefault }: AdmissionsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPending, startAdmissionsTransition } = useAdmissionsTransition();

  function push(params: URLSearchParams) {
    const query = params.toString();
    startAdmissionsTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  // Semester behaves like Year did on the CMS page: absence of the param
  // means "default to the latest semester", not "All semesters" — so
  // picking "All Semesters" has to write an explicit ?semester=All rather
  // than deleting the param.
  function setSemester(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("semester", value);
    push(params);
  }

  function setSimple(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") params.delete(key);
    else params.set(key, value);
    push(params);
  }

  function resetAll() {
    startAdmissionsTransition(() => {
      router.push(pathname);
    });
  }

  const hasActiveFilter =
    current.semester !== semesterDefault ||
    current.mode !== "All" ||
    current.acadCareer !== "All" ||
    current.campus !== "All";

  return (
    <div className={`flex flex-wrap gap-3 ${isPending ? "opacity-60" : ""}`}>
      <FilterDropdown label="Semesters" options={options.semesters} selected={current.semester} onChange={setSemester} />
      <FilterDropdown
        label="Modes"
        options={options.modes}
        selected={current.mode}
        onChange={(v) => setSimple("mode", v)}
      />
      <FilterDropdown
        label="Academic Careers"
        options={options.acadCareers}
        selected={current.acadCareer}
        onChange={(v) => setSimple("acadCareer", v)}
      />
      <FilterDropdown
        label="Campuses"
        options={options.campuses}
        selected={current.campus}
        onChange={(v) => setSimple("campus", v)}
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
