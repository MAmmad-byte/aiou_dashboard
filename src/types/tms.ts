// One row = one Semester x Region cohort of tutor/enrollment/file allocation
// stats, matching TMS_STATS. All numeric/text columns are nullable in the
// real table — lib/tms-data.ts coalesces nulls to 0 / "" when reading rows,
// so everything downstream of that can assume plain numbers/strings.

export interface TmsStat {
  id: number;
  semester: string;
  region: string;
  allocated_tutors: number;
  total_eligible_tutors: number;
  allocated_enrollments: number;
  unallocated_enrollments: number;
  confirmed_files: number;
  not_confirmed_files: number;
  allocated_students: number;
  unallocated_students: number;
  total_students: number;
}

export interface TmsFilterValues {
  semester: string;
  region: string;
}

export interface TmsFilterOptions {
  semesters: string[];
  regions: string[];
}

export interface TmsKpis {
  totalStudents: number;
  allocatedStudents: number;
  allocatedTutors: number;
  eligibleTutors: number;
  studentAllocationRate: number;
  tutorUtilizationRate: number;
  confirmedFiles: number;
  regionCount: number;
}

export interface SemesterTrendPoint {
  semester: string;
  totalStudents: number;
  allocatedStudents: number;
  unallocatedStudents: number;
  allocatedTutors: number;
  eligibleTutors: number;
}
