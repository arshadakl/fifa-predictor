import Image from 'next/image';
import {
  type Team,
  FORM_RESULT_STYLES,
  flagUrl,
  formatMatchDate,
  getOpponent,
  getOpponentScore,
  getOwnScore,
} from '@/lib/teams';

const ROW_LABEL_CLASS = 'text-[11px] tracking-[0.1em] uppercase text-white/45';
const ROW_VALUE_CLASS = 'flex items-center gap-1.5 text-[13px] font-semibold text-white';

export default function TeamCard({ team }: { team: Team }) {
  const { teamEnrichmentData: colors } = team;
  const formSlots = Array.from({ length: 5 }, (_, i) => {
    const result = team.teamTournamentForm[team.teamTournamentForm.length - 5 + i];
    return result ? result.teamMatchResult : undefined;
  });

  const lastMatch = team.lastMatch && team.lastMatch.matchStatus === 0 ? team.lastMatch : undefined;
  const nextMatch = team.nextMatch;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-(--color-badge-dark)">
      <div
        className="flex flex-col gap-3 p-4"
        style={{ backgroundColor: colors.primaryColor, color: colors.primaryTextColor }}
      >
        <Image
          src={flagUrl(team.teamFlag, 4)}
          alt={`${team.teamName} flag`}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full border border-black/10 object-cover"
          unoptimized
        />
        <h3 className="font-(family-name:--font-display) text-lg font-extrabold uppercase leading-tight">
          {team.teamName}
        </h3>
      </div>

      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-center justify-between">
          <span className={ROW_LABEL_CLASS}>Stage</span>
          <span className={ROW_VALUE_CLASS}>{team.stage}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className={ROW_LABEL_CLASS}>Tournament Form</span>
          <div className="flex items-center gap-1">
            {formSlots.map((result, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${result === undefined ? 'bg-white/10' : FORM_RESULT_STYLES[result]}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={ROW_LABEL_CLASS}>Last Match</span>
          {lastMatch ? (
            <div className={ROW_VALUE_CLASS}>
              <span>
                {getOwnScore(lastMatch, team.teamId)} - {getOpponentScore(lastMatch, team.teamId)}
              </span>
              <span className="text-white/55">{getOpponent(lastMatch, team.teamId).abbreviation}</span>
              <Image
                src={flagUrl(getOpponent(lastMatch, team.teamId).pictureUrl, 1)}
                alt=""
                width={16}
                height={16}
                className="h-4 w-4 rounded-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <span className={ROW_VALUE_CLASS}>-</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={ROW_LABEL_CLASS}>Next Match</span>
          {nextMatch ? (
            <div className={ROW_VALUE_CLASS}>
              <span className="text-white/55">{formatMatchDate(nextMatch.date)}</span>
              <span className="text-white/35">v</span>
              <span>{getOpponent(nextMatch, team.teamId).abbreviation}</span>
              <Image
                src={flagUrl(getOpponent(nextMatch, team.teamId).pictureUrl, 1)}
                alt=""
                width={16}
                height={16}
                className="h-4 w-4 rounded-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <span className={ROW_VALUE_CLASS}>-</span>
          )}
        </div>
      </div>
    </div>
  );
}
