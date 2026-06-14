const fs = require('fs');
const path = require('path');

const TEAMS_FILE = path.join(__dirname, 'data', 'teams.json');
const OUTPUT_FILE = path.join(__dirname, 'data', 'squads.json');
const DELAY_MS = 5000;

const POSITION_ORDER = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function transformSquad(data) {
  const players = (data.Players ?? [])
    .map((p) => ({
      idPlayer: String(p.IdPlayer),
      name: p.PlayerName?.[0]?.Description ?? '',
      jerseyNum: p.JerseyNum ?? null,
      position: p.PositionLocalized?.[0]?.Description ?? '',
      pictureUrl: p.PlayerPicture?.PictureUrl ?? null,
    }))
    .sort((a, b) => {
      const order = POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position);
      return order !== 0 ? order : (a.jerseyNum ?? 99) - (b.jerseyNum ?? 99);
    });

  const headCoach = (data.Officials ?? []).find((o) => o.Role === 0);

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

async function fetchSquad(teamId) {
  const url = `https://api.fifa.com/api/v3/teams/${teamId}/squad?idCompetition=17&idSeason=285023&language=en`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function main() {
  const { teams } = JSON.parse(fs.readFileSync(TEAMS_FILE, 'utf-8'));
  const squads = {};

  for (let i = 0; i < teams.length; i++) {
    const { teamId, teamName } = teams[i];
    console.log(`[${i + 1}/${teams.length}] ${teamName} (${teamId})`);

    try {
      const data = await fetchSquad(teamId);
      squads[teamId] = transformSquad(data);
    } catch (err) {
      console.error(`  failed: ${err.message}`);
    }

    if (i < teams.length - 1) await sleep(DELAY_MS);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(squads, null, 2));
  console.log(`Wrote ${Object.keys(squads).length} squads to ${OUTPUT_FILE}`);
}

main();
