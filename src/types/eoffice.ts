// One row = one Department x Date snapshot — status (open/closed/pending)
// and priority (normal/urgent/immediate) are already broken into their own
// columns per row. There's no single "status" value per row to filter rows
// by, so the Status/Priority dropdowns act as a metric lens (see
// EOfficeMetric in lib/eoffice-data.ts) instead of a row filter — Department
// is the only thing that actually narrows the row set.

export interface EOfficeStat {
  id: number;
  date: string; // "YYYY-MM-DD"
  department_title: string;
  department_id: number;
  total_files: number;
  total_files_open: number;
  total_files_closed: number;
  total_pending_files: number;
  total_normal_files: number;
  total_urgent_files: number;
  total_immediate_files: number;
  avg_turnaround_time: number;
  avg_file_response_time: number;
}

export interface EOfficeFilterValues {
  department: string; // "All" or a department_title
  status: string; // "All" | "Open" | "Closed" | "Pending"
  priority: string; // "All" | "Normal" | "Urgent" | "Immediate"
}

export interface EOfficeFilterOptions {
  departments: string[];
  statuses: string[];
  priorities: string[];
}

export interface EOfficeKpis {
  totalFiles: number;
  openFiles: number;
  closedFiles: number;
  pendingFiles: number;
  urgentFiles: number;
  immediateFiles: number;
  closureRate: number; // closed / total * 100
  avgTurnaroundTime: number; // total_files-weighted average
  avgResponseTime: number; // total_files-weighted average
  departmentCount: number;
}

export interface DateTrendPoint {
  date: string;
  totalFiles: number;
  openFiles: number;
  closedFiles: number;
  pendingFiles: number;
}

export interface DepartmentTimeSplit {
  department: string;
  turnaround: number;
  response: number;
}
