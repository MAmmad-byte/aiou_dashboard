// One row = one Program x Intake admissions-processing snapshot from OAS —
// application funnel counts (Submitted -> Fee Received -> Verified /
// Objection / Pending). program_group holds the real AIOU academic career
// code (14BH, 16BH, 16MT, 18MT, SSC, HSSC, CERT, PGD, PHD), not a
// descriptive label.

export interface TrendingStat {
  id: number;
  program_code: string;
  program_title: string;
  program_group: string;
  intake: string;
  submitted: number;
  not_submitted: number;
  total: number;
  oas_fee_received: number;
  manual_fee_received: number;
  verified: number;
  objection: number;
  pending: number;
}

export interface TrendingFilterValues {
  programGroup: string;
  program: string;
  intake: string;
}

export interface TrendingFilterOptions {
  programGroups: string[];
  // Scoped to the selected Program Group — 225 programs total but only a
  // handful to over a hundred belong to any one group.
  programs: string[];
  intakes: string[];
}

export interface TrendingKpis {
  totalApplications: number;
  totalSubmitted: number;
  totalNotSubmitted: number;
  totalFeeReceived: number; // oas_fee_received + manual_fee_received
  totalVerified: number;
  totalObjection: number;
  totalPending: number;
  submissionRate: number; // submitted / total * 100
  verificationRate: number; // verified / submitted * 100
  programCount: number;
}

export interface IntakeTrendPoint {
  intake: string;
  submitted: number;
  total: number;
  verified: number;
  pending: number;
}
