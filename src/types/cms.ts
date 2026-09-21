// // Each row is a compact tuple, not an object — with 85,088 rows, storing
// // repeated key names per row (the usual { region: "...", career: "..." }
// // shape) would roughly double the JSON file size and the per-request parse
// // cost for no benefit. Access fields via the COL indices below instead.
// export type CmsRow = [
//   string, // intake            e.g. "2026 AUTUMN (F)"
//   string, // region            e.g. "ISLAMABAD REGION"
//   string, // career            e.g. "16BH"
//   string, // acadProg          program code, e.g. "5579"
//   string, // programTitle      e.g. "BS STATISTICS (BSc BASED)"
//   string, // mode              e.g. "F2F", "ODL"
//   number, // totalEnroll
//   number, // totalEnrollMale
//   number, // totalEnrollFemale
//   number, // totalEnrollTransgender
//   number, // discontinueEnroll
//   number  // activeEnroll
// ];

// export const COL = {
//   INTAKE: 0,
//   REGION: 1,
//   CAREER: 2,
//   ACAD_PROG: 3,
//   PROGRAM_TITLE: 4,
//   MODE: 5,
//   TOTAL_ENROLL: 6,
//   TOTAL_ENROLL_MALE: 7,
//   TOTAL_ENROLL_FEMALE: 8,
//   TOTAL_ENROLL_TRANSGENDER: 9,
//   DISCONTINUE_ENROLL: 10,
//   ACTIVE_ENROLL: 11,
// } as const;

// export interface CmsFilterValues {
//   year: string;
//   season: string;
//   region: string;
//   career: string;
//   program: string;
//   mode: string;
// }

// export interface CmsFilterOptions {
//   years: string[];
//   seasons: string[];
//   regions: string[];
//   careers: string[];
//   programs: string[];
//   modes: string[];
// }

// export interface CmsKpis {
//   totalEnroll: number;
//   activeEnroll: number;
//   discontinueEnroll: number;
//   retentionRate: number;
//   male: number;
//   female: number;
//   programCount: number;
//   regionCount: number;
// }

// export interface IntakePeriodPoint {
//   label: string; // e.g. "2026 AUTUMN"
//   totalEnroll: number;
//   activeEnroll: number;
//   discontinueEnroll: number;
// }
// Rows now come straight from Prisma (ftsDb.cMS_STATS), so this is a plain
// object matching the query's `select` clause — not the compact tuple used
// by the old file-based version. Only the fields the table view actually
// displays are selected (see lib/cms-data.ts), not the full 27-column row.
export interface CmsStatRow {
  id: number;
  Student_Intake: string | null;
  Regiion: string | null;
  acadCareer: string | null;
  programTitle: string | null;
  Mode: string | null;
  Total_Enroll: number | null;
  Total_Enroll_Male: number | null;
  Total_Enroll_Female: number | null;
  Active_Enroll: number | null;
  Discontinue_Enroll: number | null;
}

export interface CmsFilterValues {
  year: string;
  season: string;
  region: string;
  career: string;
  program: string;
  mode: string;
}

export interface CmsFilterOptions {
  years: string[];
  seasons: string[];
  regions: string[];
  careers: string[];
  programs: string[];
  modes: string[];
}

export interface CmsKpis {
  totalEnroll: number;
  activeEnroll: number;
  discontinueEnroll: number;
  retentionRate: number;
  male: number;
  female: number;
  transgender: number;
  programCount: number;
  regionCount: number;
}

export interface IntakePeriodPoint {
  label: string; // e.g. "2026 AUTUMN"
  totalEnroll: number;
  activeEnroll: number;
  discontinueEnroll: number;
}
