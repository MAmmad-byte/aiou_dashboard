"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterDropdown from "./FilterDropdown";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { TrendingFilterOptions, TrendingFilterValues } from "@/types/trending";
import { useTrendingTransition } from "./TrendingTransitionProvider";

interface TrendingFiltersProps {
  options: TrendingFilterOptions;
  current: TrendingFilterValues;
  /** What Intake resolves to with no ?intake= param at all (the latest
   * intake in the dataset, as a single-element array) — used only to know
   * whether Reset should show. */
  intakeDefault: string[];
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
  // deleting the param. Now multi-select: several intakes are written as
  // repeated ?intake=X&intake=Y params.
  function setIntakes(values: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("intake");
    if (values.length === 0) {
      params.set("intake", "All");
    } else {
      values.forEach((v) => params.append("intake", v));
    }
    push(params);
  }

  function resetAll() {
    startTrendingTransition(() => {
      router.push(pathname);
    });
  }

  const intakeMatchesDefault =
    current.intake.length === intakeDefault.length && current.intake.every((i) => intakeDefault.includes(i));

  const hasActiveFilter =
    current.programGroup !== "All" || current.program !== "All" || !intakeMatchesDefault;

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
      <MultiSelectDropdown label="Intakes" options={options.intakes} selected={current.intake} onChange={setIntakes} />
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
