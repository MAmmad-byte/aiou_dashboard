"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterDropdown from "./FilterDropdown";
import { TrendingFilterOptions, TrendingFilterValues } from "@/types/trending";
import { useTrendingTransition } from "./TrendingTransitionProvider";

interface TrendingFiltersProps {
  options: TrendingFilterOptions;
  current: TrendingFilterValues;
  /** What Intake resolves to with no ?intake= param at all (the latest
   * intake in the dataset) — used only to know whether Reset should show. */
  intakeDefault: string;
}

export default function TrendingFilters({ options, current, intakeDefault }: TrendingFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPending, startTrendingTransition } = useTrendingTransition();

  function push(params: URLSearchParams) {
    const query = params.toString();
    startTrendingTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  // Program belongs to a Program Group — changing the group clears whatever
  // specific Program was selected, since it very likely doesn't exist under
  // the newly selected group.
  function setProgramGroup(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") params.delete("programGroup");
    else params.set("programGroup", value);
    params.delete("program");
    push(params);
  }

  function setProgram(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") params.delete("program");
    else params.set("program", value);
    push(params);
  }

  // Intake behaves like Year did on the CMS page: absence of the param
  // means "default to the latest intake", not "All intakes" — so picking
  // "All Intakes" has to write an explicit ?intake=All rather than
  // deleting the param.
  function setIntake(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") params.set("intake", "All");
    else params.set("intake", value);
    push(params);
  }

  function resetAll() {
    startTrendingTransition(() => {
      router.push(pathname);
    });
  }

  const hasActiveFilter =
    current.programGroup !== "All" || current.program !== "All" || current.intake !== intakeDefault;

  return (
    <div className={`flex flex-wrap gap-3 ${isPending ? "opacity-60" : ""}`}>
      <FilterDropdown
        label="Program Groups"
        options={options.programGroups}
        selected={current.programGroup}
        onChange={setProgramGroup}
      />
      <FilterDropdown
        label="Programs"
        options={options.programs}
        selected={current.program}
        onChange={setProgram}
        searchable
      />
      <FilterDropdown label="Intakes" options={options.intakes} selected={current.intake} onChange={setIntake} />
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
