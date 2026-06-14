export type TeamMatchSide = {
  idTeam: string;
  abbreviation: string;
  pictureUrl: string;
};

export type TeamMatch = {
  idMatch: string;
  date: string;
  matchStatus: number;
  resultType: number;
  homeTeamScore?: number;
  awayTeamScore?: number;
  home: TeamMatchSide;
  away: TeamMatchSide;
};

export type Team = {
  teamId: string;
  teamName: string;
  teamFlag: string;
  confederationId: string;
  stage: string;
  teamTournamentForm: { teamMatchResult: number }[];
  lastMatch?: TeamMatch;
  nextMatch?: TeamMatch;
  hostTeam: boolean;
  teamEnrichmentData: {
    primaryColor: string;
    secondaryColor: string;
    primaryTextColor: string;
    secondaryTextColor: string;
  };
};

export type TeamsData = {
  teams: Team[];
};

// teamMatchResult: 0 = draw, 1 = win, 2 = loss
export const FORM_RESULT_STYLES: Record<number, string> = {
  0: 'bg-white/30',
  1: 'bg-(--color-neon-green)',
  2: 'bg-red-500',
};

export function flagUrl(template: string, size: 1 | 4 = 1): string {
  return template.replace('{format}', 'sq').replace('{size}', String(size));
}

export function getOpponent(match: TeamMatch, teamId: string): TeamMatchSide {
  return match.home.idTeam === teamId ? match.away : match.home;
}

export function getOwnScore(match: TeamMatch, teamId: string): number | undefined {
  return match.home.idTeam === teamId ? match.homeTeamScore : match.awayTeamScore;
}

export function getOpponentScore(match: TeamMatch, teamId: string): number | undefined {
  return match.home.idTeam === teamId ? match.awayTeamScore : match.homeTeamScore;
}

export function formatMatchDate(date: string): string {
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = String(d.getUTCFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}
