// Adjust these to match your actual Prisma-generated types for E_OFFICE_STATS
// if the field names differ (e.g. camelCase like totalDocuments).

export type EOfficeStatus = "Open" | "Pending" | "Closed" | "Rejected";
export type EOfficePriority = "Low" | "Normal" | "High" | "Urgent";

export interface EOfficeStat {
  id: number;
  department: string;
  priority: EOfficePriority;
  status: EOfficeStatus;
  total_documents: number;
  avg_turnaround_days: number;
}
