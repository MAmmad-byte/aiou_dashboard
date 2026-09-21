// One row = one Semester x Program x Country x Region cohort, matching the
// AIOU_LMS_Dummy_1000 CSV template — 1000 detail rows, no rollup rows to
// strip out this time.

export interface LmsStat {
  id: number;
  semester: string;
  program: string;
  country: string;
  region: string;
  total_no_of_students: number;
  total_enrollment: number;
  no_of_assignments_submitted: number;
  total_workshops: number;
  total_quiz_conducted: number;
  total_quiz_attempt: number;
  total_courses: number;
  total_workshop_batches: number;
}

export interface LmsFilterValues {
  country: string;
  semester: string;
  program: string;
  region: string;
}

export interface LmsFilterOptions {
  countries: string[];
  semesters: string[];
  programs: string[];
  regions: string[];
}

export interface LmsKpis {
  totalStudents: number;
  totalEnrollment: number;
  assignmentsSubmitted: number;
  totalWorkshops: number;
  quizConducted: number;
  quizAttempted: number;
  totalCourses: number;
  workshopBatches: number;
}
