import type { Submission, Predictions } from './fields';

const SINGLE_POINT_FIELDS: (keyof Predictions)[] = [
  'Runner_Up',
  'Third_Place',
  'Fair_Play_Award',
  'Golden_Boot',
  'Most_Assists',
  'Golden_Glove',
  'Best_Young_Player',
];

function matches(predicted: unknown, actual: unknown): boolean {
  return Boolean(
    actual &&
      predicted &&
      String(predicted).trim().toLowerCase() === String(actual).trim().toLowerCase()
  );
}

// Tiebreakers: Total_Score DESC -> correct World Cup Winner -> correct Golden Ball -> earliest Timestamp ASC
export function calculateScoresAndRankings(
  submissions: Submission[],
  actuals: Partial<Predictions>
): Submission[] {
  const scored = submissions.map((s) => {
    let score = 0;

    const wcCorrect = matches(s.World_Cup_Winner, actuals.World_Cup_Winner);
    if (wcCorrect) score += 2;

    const gbCorrect = matches(s.Golden_Ball, actuals.Golden_Ball);
    if (gbCorrect) score += 2;

    SINGLE_POINT_FIELDS.forEach((field) => {
      if (matches(s[field], actuals[field])) score += 1;
    });

    return { submission: { ...s, Total_Score: score }, wcCorrect, gbCorrect };
  });

  scored.sort((a, b) => {
    if (b.submission.Total_Score !== a.submission.Total_Score) {
      return b.submission.Total_Score - a.submission.Total_Score;
    }
    if (b.wcCorrect !== a.wcCorrect) return b.wcCorrect ? 1 : -1;
    if (b.gbCorrect !== a.gbCorrect) return b.gbCorrect ? 1 : -1;
    return new Date(a.submission.Timestamp).getTime() - new Date(b.submission.Timestamp).getTime();
  });

  return scored.map((item, index) => ({ ...item.submission, Rank: index + 1 }));
}
