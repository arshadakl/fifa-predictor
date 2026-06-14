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
  flagSrc: flagUrl(t.teamFlag, 4),
  stage: t.stage,
}));

const RAW_PLAYER_OPTIONS = Object.values(squadsData).flatMap((squad) =>
  squad.players.map((p) => ({
    id: `${squad.idTeam}-${p.idPlayer}`,
    name: p.name,
    teamName: squad.teamName,
    flagSrc: flagUrl(squad.teamFlag, 4),
    imageSrc: p.pictureUrl ? playerImageUrl(p.pictureUrl, 250) : null,
    position: p.position,
  })),
);

// Some players share an identical name across different squads (e.g. "Emiliano
// Martinez" plays for both Argentina and Uruguay). Suffix the team name for
// those so the option list, selection highlight, and stored answer stay
// unambiguous - otherwise both rows would match `value` and `.find()` could
// resolve to the wrong player's flag/photo in the preview box.
const NAME_COUNTS = new Map<string, number>();
for (const p of RAW_PLAYER_OPTIONS) {
  const key = p.name.toLowerCase();
  NAME_COUNTS.set(key, (NAME_COUNTS.get(key) ?? 0) + 1);
}

export const PLAYER_OPTIONS: PlayerOption[] = RAW_PLAYER_OPTIONS.map((p) => ({
  ...p,
  name: (NAME_COUNTS.get(p.name.toLowerCase()) ?? 0) > 1 ? `${p.name} (${p.teamName})` : p.name,
})).sort((a, b) => a.name.localeCompare(b.name));
