// One row = one Account x Department x Budget Type x Fiscal Year x Campus
// budget line, parsed from the PeopleSoft-style export. 12 columns kept out
// of the original 25 — dropped: BUSINESS_UNIT and LEDGER_GROUP (constant
// across every row), the *_FULL_DESCR columns (just code+title concatenated,
// already available separately), the raw BUDGET_REF/OPERATING_UNIT codes
// (kept their descriptions instead), and PROJECT_ID/CHARTFIELD1/DESCRLONG/
// DESCRSHORT/COMMENTS (98%+ "Unspecified" or blank on this export).

export interface ErpBudgetRow {
  id: number;
  account_code: string;
  account_title: string;
  dept_code: string;
  dept_title: string;
  budget_type: string; // "Recurring" | "Development" | "Special Project"
  fiscal_year: string; // "21-22" .. "26-27"
  campus: string; // "Main Campus" | "Regional Office <name>"
  commitment: number;
  pre_encumbrance: number;
  encumbrance: number;
  expense: number;
  balance: number;
}

export interface ErpFilterValues {
  campus: string;
  department: string;
  budgetType: string;
  fiscalYear: string;
}

export interface ErpFilterOptions {
  campuses: string[];
  // Scoped to the selected campus — Main Campus has ~85 departments, each
  // Regional Office has only 1-3, so this list changes with the Campus filter.
  departments: string[];
  budgetTypes: string[];
  fiscalYears: string[];
}

export interface ErpKpis {
  totalCommitment: number;
  totalExpense: number;
  totalBalance: number;
  totalEncumbrance: number;
  totalPreEncumbrance: number;
  utilizationRate: number; // expense / commitment * 100
  departmentCount: number;
  campusCount: number;
}

export interface FiscalYearTrendPoint {
  fiscalYear: string;
  commitment: number;
  expense: number;
  balance: number;
}

export interface CampusComparisonPoint {
  campus: string;
  commitment: number;
  expense: number;
}

export interface DepartmentFinancials {
  department: string;
  commitment: number;
  expense: number;
  balance: number;
}
