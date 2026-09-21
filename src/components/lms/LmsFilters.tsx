"use client";

import React, { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterDropdown from "./FilterDropdown";
import { LmsFilterOptions, LmsFilterValues } from "@/types/lms";

interface LmsFiltersProps {
  options: LmsFilterOptions;
  current: LmsFilterValues;
  /** What the country filter resolves to with no ?country= param at all
   * (normally "Pakistan") — used only to know whether the current selection
   * actually differs from the default, for the Reset button. */
  countryDefault: string;
}

// Each dropdown writes straight to the URL (?semester=...&program=...), so
// the filtered view is a normal server-rendered page load, shareable and
// bookmarkable — page.tsx reads these same params server-side to filter the
// dataset and compute the charts. Same pattern as the OAS dashboard.
export default function LmsFilters({ options, current, countryDefault }: LmsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // For most filters, "All" means "delete the param" — absence already
  // means "no filter". Country is different: absence means "default to
  // Pakistan", not "All countries", so picking "All Countries" has to write
  // an explicit ?country=All rather than deleting the param, or it would
  // silently snap back to Pakistan on the next load.
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
    current.program !== "All" ||
    current.region !== "All";

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
        label="Programs"
        options={options.programs}
        selected={current.program}
        onChange={(v) => setParam("program", v)}
      />
      <FilterDropdown
        label="Regions"
        options={options.regions}
        selected={current.region}
        onChange={(v) => setParam("region", v)}
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
