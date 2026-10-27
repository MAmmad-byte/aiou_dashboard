"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterDropdown from "./FilterDropdown";
import { OasApplicantFilterOptions, OasApplicantFilterValues } from "@/types/oas-applicant";
import { useOasApplicantTransition } from "./OasApplicantTransitionProvider";

interface OasApplicantFiltersProps {
  options: OasApplicantFilterOptions;
  current: OasApplicantFilterValues;
  /** What Semester resolves to with no ?semester= param at all (the latest
   * semester in the dataset) — used only to know whether Reset should show. */
  semesterDefault: string;
}

export default function OasApplicantFilters({ options, current, semesterDefault }: OasApplicantFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPending, startOasApplicantTransition } = useOasApplicantTransition();

  function push(params: URLSearchParams) {
    const query = params.toString();
    startOasApplicantTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  // Semester behaves like every other dashboard here: absence of the param
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
    startOasApplicantTransition(() => {
      router.push(pathname);
    });
  }

  const hasActiveFilter =
    current.semester !== semesterDefault || current.region !== "All" || current.program !== "All";

  return (
    <div className={`flex flex-wrap gap-3 ${isPending ? "opacity-60" : ""}`}>
      <FilterDropdown label="Semesters" options={options.semesters} selected={current.semester} onChange={setSemester} />
      <FilterDropdown
        label="Regions"
        options={options.regions}
        selected={current.region}
        onChange={(v) => setSimple("region", v)}
        searchable
      />
      <FilterDropdown
        label="Programs"
        options={options.programs}
        selected={current.program}
        onChange={(v) => setSimple("program", v)}
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
