export const PREDICTION_FIELDS = [
  'World_Cup_Winner',
  'Runner_Up',
  'Third_Place',
  'Fair_Play_Award',
  'Most_Entertaining_Team',
  'Dark_Horse',
  'Golden_Ball',
  'Golden_Boot',
  'Most_Assists',
  'Golden_Glove',
  'Best_Young_Player',
] as const;

export type PredictionField = (typeof PREDICTION_FIELDS)[number];

export const SHEET_HEADERS = [
  'Submission_ID',
  'Timestamp',
  'Full_Name',
  'Mobile_Number',
  'Email_Address',
  ...PREDICTION_FIELDS,
  'Total_Score',
  'Rank',
] as const;

export type SheetHeader = (typeof SHEET_HEADERS)[number];

export type Submission = {
  Submission_ID: string;
  Timestamp: string;
  Full_Name: string;
  Mobile_Number: string;
  Email_Address: string;
  Total_Score?: number;
  Rank?: number | string;
} & {
  [K in PredictionField]: string;
};

export type Predictions = {
  [K in PredictionField]: string;
};

// Results page shape: everything a participant submitted EXCEPT the personal
// contact fields (mobile/email are never sent to the public results endpoint).
export type PublicSubmission = Omit<Submission, 'Mobile_Number' | 'Email_Address'>;
