"use client";

import React, { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterDropdown from "./FilterDropdown";
import { OasFilterOptions, OasFilterValues } from "@/types/oas";

interface OasFiltersProps {
  options: OasFilterOptions;
  current: OasFilterValues;
  /** What the country filter resolves to with no ?country= param at all
   * (normally "Pakistan") — needed here only to know whether the current
   * selection actually differs from the default, for the Reset button. */
  countryDefault: string;
}

// Each dropdown writes straight to the URL (?semester=...&province=...), so
// the filtered view is a normal server-rendered page load, shareable and
// bookmarkable, and there's no client-side data duplication — page.tsx reads
// these same params server-side to filter the dataset and compute the charts.
export default function OasFilters({ options, current, countryDefault }: OasFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // For most filters, picking "All" just removes the param — absence of the
  // param already means "no filter". Country is different: absence of the
  // param means "default to Pakistan", not "All countries". So picking "All
  // Countries" has to write an explicit ?country=All rather than deleting
  // the param, or it would silently snap back to Pakistan on the next load.
  function setParam(key: string, value: string, deleteOnAll: boolean = true) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" && deleteOnAll) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  function resetAll() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  const hasActiveFilter =
    current.country !== countryDefault ||
    current.semester !== "All" ||
    current.province !== "All" ||
    current.region !== "All" ||
    current.program !== "All" ||
    current.ageBand !== "All";

  return (
    <div className={`flex flex-wrap gap-3 ${isPending ? "opacity-60" : ""}`}>
      <FilterDropdown
        label="Countries"
        options={options.countries}
        selected={current.country}
        onChange={(v) => setParam("country", v, false)}
      />
      <FilterDropdown
        label="Semesters"
        options={options.semesters}
        selected={current.semester}
        onChange={(v) => setParam("semester", v)}
      />
      <FilterDropdown
        label="Provinces"
        options={options.provinces}
        selected={current.province}
        onChange={(v) => setParam("province", v)}
      />
      <FilterDropdown
        label="Regions"
        options={options.regions}
        selected={current.region}
        onChange={(v) => setParam("region", v)}
      />
      <FilterDropdown
        label="Programs"
        options={options.programs}
        selected={current.program}
        onChange={(v) => setParam("program", v)}
      />
      <FilterDropdown
        label="Age Bands"
        options={options.ageBands}
        selected={current.ageBand}
        onChange={(v) => setParam("ageBand", v)}
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
