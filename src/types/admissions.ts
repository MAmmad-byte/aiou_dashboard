// One row = one Semester x Mode x Academic Career x Program x Campus x
// Province cohort — aggregated admissions/enrollment counts, no per-student
// PII (that was stripped when this table was built from the raw PeopleSoft
// export).

export interface AdmissionsStat {
  id: number;
  semester: string;
  mode: string; // "Face to Face" | "Open & Distance Learning" | ...
  acad_career: string;
  program: string;
  campus: string;
  province: string;
  program_status: string;
  admit_type: string;
  total_students: number;
  male: number;
  female: number;
  transgender: number;
  fresh_admits: number;
  continuing_students: number;
  total_course_enrollments: number;
}

export interface AdmissionsFilterValues {
  semester: string;
  mode: string;
  acadCareer: string;
  campus: string;
}

export interface AdmissionsFilterOptions {
  semesters: string[];
  modes: string[];
  acadCareers: string[];
  campuses: string[];
}

export interface AdmissionsKpis {
  totalStudents: number;
  male: number;
  female: number;
  transgender: number;
  freshAdmits: number;
  continuingStudents: number;
  avgCoursesPerStudent: number;
  campusCount: number;
  careerCount: number;
}

export interface SemesterTrendPoint {
  semester: string;
  totalStudents: number;
  freshAdmits: number;
  continuingStudents: number;
}

export interface CareerFreshContinuingPoint {
  career: string;
  fresh: number;
  continuing: number;
}

export interface RegionFreshContinuingPoint {
  region: string;
  fresh: number;
  continuing: number;
}
