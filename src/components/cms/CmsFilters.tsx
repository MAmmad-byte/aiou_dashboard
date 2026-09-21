"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterDropdown from "./FilterDropdown";
import { CmsFilterOptions, CmsFilterValues } from "@/types/cms";
import { useCmsTransition } from "./CmsTransitionProvider";

interface CmsFiltersProps {
  options: CmsFilterOptions;
  current: CmsFilterValues;
  /** What Year resolves to with no ?year= param at all (the latest year in
   * the dataset) — used only to know whether the Reset button should show. */
  yearDefault: string;
}

export default function CmsFilters({ options, current, yearDefault }: CmsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Shared with CmsLoadingOverlay/CmsFadeWrapper via context, instead of a
  // local useTransition(), so the whole dashboard reacts to a filter change
  // — not just this filter bar.
  const { isPending, startCmsTransition } = useCmsTransition();

  // Year behaves like Country did on the OAS/LMS pages: absence of the
  // param means "default to the latest year", not "All years" — so picking
  // "All Years" has to write an explicit ?year=All instead of deleting the
  // param. Every other filter deletes its param on "All" as usual.
  function setParam(key: string, value: string, deleteOnAll: boolean = true) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" && deleteOnAll) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    startCmsTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  function resetAll() {
    startCmsTransition(() => {
      router.push(pathname);
    });
  }

  const hasActiveFilter =
    current.year !== yearDefault ||
    current.season !== "All" ||
    current.region !== "All" ||
    current.career !== "All" ||
    current.program !== "All" ||
    current.mode !== "All";

  return (
    <div className={`flex flex-wrap gap-3 ${isPending ? "opacity-60" : ""}`}>
      <FilterDropdown
        label="Years"
        options={options.years}
        selected={current.year}
        onChange={(v) => setParam("year", v, false)}
      />
      <FilterDropdown
        label="Seasons"
        options={options.seasons}
        selected={current.season}
        onChange={(v) => setParam("season", v)}
      />
      <FilterDropdown
        label="Regions"
        options={options.regions}
        selected={current.region}
        onChange={(v) => setParam("region", v)}
        searchable
      />
      <FilterDropdown
        label="Careers"
        options={options.careers}
        selected={current.career}
        onChange={(v) => setParam("career", v)}
      />
      <FilterDropdown
        label="Programs"
        options={options.programs}
        selected={current.program}
        onChange={(v) => setParam("program", v)}
        searchable
      />
      <FilterDropdown
        label="Modes"
        options={options.modes}
        selected={current.mode}
        onChange={(v) => setParam("mode", v)}
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
