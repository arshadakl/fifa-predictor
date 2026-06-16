import type { Predictions, Submission } from '@/lib/fields';
import { btnSecondary } from '../buttonStyles';
import { OptionFlagOrPhoto } from '../OptionSelector';
import { findTeamOption, findPlayerOption } from '@/lib/predictionOptions';
import { formatTimestamp } from '@/lib/utils';

type FieldKind = 'team' | 'player';

const FIELDS: { label: string; key: keyof Predictions; points: number; kind: FieldKind }[] = [
  { label: 'World Cup Winner (2 pts)', key: 'World_Cup_Winner', points: 2, kind: 'team' },
  { label: 'Runner-Up (1 pt)', key: 'Runner_Up', points: 1, kind: 'team' },
  { label: 'Third Place (1 pt)', key: 'Third_Place', points: 1, kind: 'team' },
  { label: 'Fair Play Award (1 pt)', key: 'Fair_Play_Award', points: 1, kind: 'team' },
  { label: 'Golden Ball (2 pts)', key: 'Golden_Ball', points: 2, kind: 'player' },
  { label: 'Golden Boot (1 pt)', key: 'Golden_Boot', points: 1, kind: 'player' },
  { label: 'Most Assists (1 pt)', key: 'Most_Assists', points: 1, kind: 'player' },
  { label: 'Golden Glove (1 pt)', key: 'Golden_Glove', points: 1, kind: 'player' },
  { label: 'Best Young Player (1 pt)', key: 'Best_Young_Player', points: 1, kind: 'player' },
];

function FieldAvatar({ kind, name }: Readonly<{ kind: FieldKind; name: string }>) {
  const option = kind === 'team' ? findTeamOption(name) : findPlayerOption(name);
  if (option) {
    return <OptionFlagOrPhoto option={option} size={40} sizeClass="h-9 w-9" />;
  }
  return <span className="h-9 w-9 shrink-0 rounded-full border border-dashed border-white/15 bg-white/5" />;
}

interface DetailModalProps {
  submission: Submission | null;
  actuals: Predictions;
  onClose: () => void;
}

export default function DetailModal({
  submission,
  actuals,
  onClose,
}: Readonly<DetailModalProps>) {
  if (!submission) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[10px] flex items-center justify-center z-100 p-5 animate-fade-in">
      <div className="glass-card max-w-[750px] w-full text-center p-9 px-6 max-h-[90vh] overflow-y-auto">
        <h3 className="font-(family-name:--font-heading) font-bold text-2xl mb-3 text-(--color-accent-gold)">
          Participant Prediction Details
        </h3>
        <p className="text-(--color-text-secondary) leading-relaxed mb-2">
          <strong className="text-white">Participant:</strong> {submission.Full_Name} &nbsp;|&nbsp;{' '}
          <strong className="text-white">ID:</strong> {submission.Submission_ID} &nbsp;|&nbsp;{' '}
          <strong className="text-white">Score:</strong>{' '}
          <span className="gold-text">{submission.Total_Score !== undefined ? submission.Total_Score : 0}</span>
        </p>
        <p className="text-(--color-text-secondary) text-[0.85rem] mb-7">
          <strong className="text-white">Submitted:</strong> {formatTimestamp(submission.Timestamp)}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7 text-left">
          {FIELDS.map((field) => {
            const predictedVal = submission[field.key] || '';
            const actualVal = actuals[field.key] || '';
            const isCorrect =
              Boolean(actualVal) &&
              Boolean(predictedVal) &&
              predictedVal.trim().toLowerCase() === actualVal.trim().toLowerCase();

            let icon = '';
            let valueColor = 'text-white';
            let extra: React.ReactNode = null;

            if (actualVal) {
              if (isCorrect) {
                icon = '✅';
                valueColor = 'text-emerald-500';
                extra = (
                  <span className="font-(family-name:--font-heading) text-(--color-accent-gold)"> &nbsp;(+{field.points} pts)</span>
                );
              } else {
                icon = '❌';
                valueColor = 'text-(--color-text-secondary)';
                extra = <span className="text-[0.75rem] text-red-500"> (Correct: {actualVal})</span>;
              }
            }

            return (
              <div
                key={field.key}
                className="bg-[rgba(10,10,15,0.4)] border border-(--color-border-subtle) rounded-xl px-4 py-3 flex flex-col gap-2"
              >
                <span className="text-[0.75rem] uppercase text-(--color-text-secondary)">{field.label}</span>
                <div className="flex items-center gap-2.5">
                  {predictedVal && <FieldAvatar kind={field.kind} name={predictedVal} />}
                  <span className={`text-[0.95rem] font-semibold ${valueColor} min-w-0`}>
                    {icon ? `${icon} ` : ''}
                    {predictedVal || '—'}
                    {extra}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={onClose} className={btnSecondary}>
          Close
        </button>
      </div>
    </div>
  );
}
