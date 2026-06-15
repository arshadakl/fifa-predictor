import Image from 'next/image';
import Spinner from '../Spinner';
import PlayerSilhouette from '../PlayerSilhouette';
import { btnGoldSm } from '../buttonStyles';
import { TEAM_OPTIONS, PLAYER_OPTIONS } from '@/lib/predictionOptions';
import type { Predictions, PredictionField } from '@/lib/fields';
import { cn } from '@/lib/utils';

type PreviewSlot = { field: PredictionField; label: string; kind: 'team' | 'player' };

const FORMATION: PreviewSlot[][] = [
  [
    { field: 'Golden_Ball', label: 'Golden Ball', kind: 'player' },
    { field: 'World_Cup_Winner', label: 'World Champion', kind: 'team' },
    { field: 'Golden_Boot', label: 'Golden Boot', kind: 'player' },
  ],
  [
    { field: 'Runner_Up', label: 'Runner-Up', kind: 'team' },
    { field: 'Most_Assists', label: 'Most Assists', kind: 'player' },
    { field: 'Best_Young_Player', label: 'Young Player', kind: 'player' },
  ],
  [
    { field: 'Third_Place', label: 'Third Place', kind: 'team' },
    { field: 'Fair_Play_Award', label: 'Fair Play', kind: 'team' },
    { field: 'Most_Entertaining_Team', label: 'Entertainer', kind: 'team' },
    { field: 'Dark_Horse', label: 'Most entertaining and Dark horses', kind: 'team' },
  ],
  [{ field: 'Golden_Glove', label: 'Golden Glove', kind: 'player' }],
];

interface PreviewCardProps {
  slot: PreviewSlot;
  value: string;
  index: number;
}

function PreviewCard({ slot, value, index }: Readonly<PreviewCardProps>) {
  const isGoalkeeper = slot.field === 'Golden_Glove';

  let imageSrc: string | null = null;
  if (slot.kind === 'team') {
    imageSrc = TEAM_OPTIONS.find((o) => o.name.toLowerCase() === value.toLowerCase())?.flagSrc ?? null;
  } else {
    imageSrc = PLAYER_OPTIONS.find((o) => o.name.toLowerCase() === value.toLowerCase())?.imageSrc ?? null;
  }

  return (
    <div
      className="lineup-card flex flex-col items-center gap-1.5 w-[4.5rem] sm:w-24 text-center"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className={cn(
          'h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 flex items-center justify-center overflow-hidden shrink-0 bg-black/20',
          isGoalkeeper ? 'border-(--color-accent-gold)' : 'border-white/30'
        )}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            width={120}
            height={120}
            className={cn(
              'h-full w-full object-cover',
              // Player photos are head-and-shoulders with the face near the top,
              // so zoom from the top to fill the circle with the face. Flags stay
              // as-is.
              slot.kind === 'player' && 'object-top scale-[3] origin-top'
            )}
            unoptimized
          />
        ) : (
          <PlayerSilhouette className="h-7 w-7 text-white/40" />
        )}
      </div>
      <div className="bg-white/95 text-black rounded-md px-1.5 py-1 w-full">
        <div className="text-[0.55rem] uppercase tracking-wide text-black/50 font-bold leading-none mb-0.5">
          {slot.label}
        </div>
        <div className="text-[0.7rem] font-extrabold leading-tight line-clamp-2">{value || '—'}</div>
      </div>
    </div>
  );
}

// Pitch-only view of a set of predictions (no heading, no actions). Shared by
// the wizard's submit preview and the public results "view predictions" modal.
export function PredictionPitch({ values }: Readonly<{ values: Predictions }>) {
  // Running index across all rows so the stagger cascades top-to-bottom.
  const rowStart = FORMATION.reduce<number[]>((acc, row, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + FORMATION[i - 1].length);
    return acc;
  }, []);

  return (
    <div className="pitch-field flex flex-col justify-between gap-6 px-3 sm:px-6 py-6 sm:py-10 min-h-[420px] sm:min-h-[480px]">
      {FORMATION.map((row, i) => (
        <div key={i} className="relative z-10 flex justify-center gap-3 sm:gap-6 flex-wrap">
          {row.map((slot, j) => (
            <PreviewCard key={slot.field} slot={slot} value={values[slot.field]} index={rowStart[i] + j} />
          ))}
        </div>
      ))}
    </div>
  );
}

interface PredictionPreviewProps {
  values: Predictions;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function PredictionPreview({ values, onSubmit, isSubmitting }: Readonly<PredictionPreviewProps>) {
  return (
    <div>
      <h2 className="font-(family-name:--font-heading) font-bold text-2xl sm:text-3xl md:text-[2.2rem] leading-snug mb-6 text-white text-center">
        Your Prediction Preview
      </h2>

      <PredictionPitch values={values} />

      <div className="flex justify-center mt-8">
        <button onClick={onSubmit} disabled={isSubmitting} className={btnGoldSm}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner /> Submitting...
            </span>
          ) : (
            <>
              Submit
              <span className="btn-shine" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
