import teamsData from '@/data/teams.json';
import squadsData from '@/data/squads.json';
import { flagUrl, playerImageUrl } from './teams';

export type TeamOption = {
  id: string;
  name: string;
  flagSrc: string;
  stage: string;
};

export type PlayerOption = {
  id: string;
  name: string;
  teamName: string;
  flagSrc: string;
  imageSrc: string | null;
  position: string;
};

export const TEAM_OPTIONS: TeamOption[] = teamsData.teams.map((t) => ({
  id: t.teamId,
  name: t.teamName,
  flagSrc: flagUrl(t.teamFlag, 1),
  stage: t.stage,
}));

export const PLAYER_OPTIONS: PlayerOption[] = Object.values(squadsData).flatMap((squad) =>
  squad.players.map((p) => ({
    id: `${squad.idTeam}-${p.idPlayer}`,
    name: p.name,
    teamName: squad.teamName,
    flagSrc: flagUrl(squad.teamFlag, 1),
    imageSrc: p.pictureUrl ? playerImageUrl(p.pictureUrl, 200) : null,
    position: p.position,
  })),
).sort((a, b) => a.name.localeCompare(b.name));
