export type TeamMatchSide = {
  idTeam: string;
  abbreviation: string;
  pictureUrl: string | undefined;
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

export type SquadPlayer = {
  idPlayer: string;
  name: string;
  jerseyNum: number | null;
  position: string;
  pictureUrl: string | null;
};

export type SquadOfficial = {
  idCoach: string;
  name: string;
  pictureUrl: string | null;
};

export type SquadData = {
  idTeam: string;
  teamName: string;
  teamFlag: string;
  players: SquadPlayer[];
  manager: SquadOfficial | null;
};

const TEAMS_ENDPOINT =
  'https://cxm-api.fifa.com/fifaplusweb/api/sections/teamsModule/4v5Yng3VdGD9c1cpnOIff1?locale=en&limit=200';

const POSITION_ORDER = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

export async function fetchTeamsData(): Promise<TeamsData> {
  const res = await fetch(TEAMS_ENDPOINT, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Failed to fetch teams: ${res.status}`);
  return res.json();
}

export async function fetchSquadData(teamId: string): Promise<SquadData> {
  // Squad rosters change rarely, so cache for an hour to minimise upstream hits.
  const res = await fetch(
    `https://api.fifa.com/api/v3/teams/${teamId}/squad?idCompetition=17&idSeason=285023&language=en`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) throw new Error(`Failed to fetch squad: ${res.status}`);
  const data = await res.json();

  const players: SquadPlayer[] = (data.Players ?? [])
    .map((p: Record<string, unknown>) => ({
      idPlayer: String(p.IdPlayer),
      name: (p.PlayerName as { Description: string }[] | undefined)?.[0]?.Description ?? '',
      jerseyNum: (p.JerseyNum as number | null) ?? null,
      position: (p.PositionLocalized as { Description: string }[] | undefined)?.[0]?.Description ?? '',
      pictureUrl: (p.PlayerPicture as { PictureUrl: string | null } | null)?.PictureUrl ?? null,
    }))
    .sort((a: SquadPlayer, b: SquadPlayer) => {
      const order = POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position);
      return order !== 0 ? order : (a.jerseyNum ?? 99) - (b.jerseyNum ?? 99);
    });

  const headCoach = (data.Officials ?? []).find((o: Record<string, unknown>) => o.Role === 0);

  return {
    idTeam: String(data.IdTeam),
    teamName: data.TeamName?.[0]?.Description ?? '',
    teamFlag: data.PictureUrl,
    players,
    manager: headCoach
      ? {
          idCoach: String(headCoach.IdCoach),
          name: headCoach.Name?.[0]?.Description ?? '',
          pictureUrl: headCoach.PictureUrl ?? null,
        }
      : null,
  };
}

export function groupPlayersByPosition(players: SquadPlayer[]): { position: string; players: SquadPlayer[] }[] {
  return POSITION_ORDER.map((position) => ({
    position,
    players: players.filter((p) => p.position === position),
  })).filter((group) => group.players.length > 0);
}

export function playerImageUrl(url: string, width: number): string {
  return `${url}?&io=transform:fill,aspectratio:1x1,width:${width}&quality=90`;
}

// teamMatchResult: 0 = draw, 1 = win, 2 = loss
export const FORM_RESULT_STYLES: Record<number, string> = {
  0: 'bg-white/30',
  1: 'bg-(--color-neon-green)',
  2: 'bg-red-500',
};

export function flagUrl(template: string | null | undefined, size: 1 | 4 = 1): string {
  if (!template) return '';
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
