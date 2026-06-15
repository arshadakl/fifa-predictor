import OptionSelect from './OptionSelect';
import { btnGold } from '../buttonStyles';
import { TEAM_OPTIONS, PLAYER_OPTIONS } from '@/lib/predictionOptions';
import type { Predictions } from '@/lib/fields';

const FIELD_ID: Record<keyof Predictions, string> = {
  World_Cup_Winner: 'act-winner',
  Runner_Up: 'act-runner-up',
  Third_Place: 'act-third',
  Fair_Play_Award: 'act-fair-play',
  Most_Entertaining_Team: 'act-entertaining',
  Dark_Horse: 'act-dark-horse',
  Golden_Ball: 'act-golden-ball',
  Golden_Boot: 'act-golden-boot',
  Most_Assists: 'act-assists',
  Golden_Glove: 'act-golden-glove',
  Best_Young_Player: 'act-young-player',
};

// Same option sets the prediction wizard uses, so the stored actual strings
// match participant answers exactly. Teams sorted alphabetically for the
// dropdown; players already arrive sorted from predictionOptions.
const TEAM_SELECT_OPTIONS = [...TEAM_OPTIONS]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((o) => ({ id: o.id, name: o.name }));

const PLAYER_SELECT_OPTIONS = PLAYER_OPTIONS.map((o) => ({ id: o.id, name: o.name }));

interface ActualsFormProps {
  actuals: Predictions;
  onChange: (field: keyof Predictions, value: string) => void;
  onCalculate: () => void;
  calculating: boolean;
}

export default function ActualsForm({
  actuals,
  onChange,
  onCalculate,
  calculating,
}: Readonly<ActualsFormProps>) {
  function field(key: keyof Predictions, label: string, options: { id: string; name: string }[]) {
    return (
      <OptionSelect
        id={FIELD_ID[key]}
        label={label}
        options={options}
        value={actuals[key]}
        onChange={(v) => onChange(key, v)}
      />
    );
  }

  return (
    <section className="glass-card p-8 w-full">
      <div className="mb-8">
        <h2 className="font-(family-name:--font-heading) font-bold text-[1.8rem] mb-1.5 bg-gradient-to-r from-white to-(--color-accent-blue) bg-clip-text text-transparent">
          Enter Actual Tournament Results
        </h2>
        <p className="text-(--color-text-secondary) text-[0.95rem]">
          Provide correct outcomes to calculate participant scores
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <h3 className="font-(family-name:--font-heading) text-[1.05rem] font-bold uppercase tracking-[1px] text-(--color-accent-blue) mt-4 mb-5 border-b border-(--color-accent-blue)/15 pb-1.5">
          Team Outcomes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('World_Cup_Winner', 'World Cup Winner (2pts)', TEAM_SELECT_OPTIONS)}
          {field('Runner_Up', 'Runner-Up (1pt)', TEAM_SELECT_OPTIONS)}
          {field('Third_Place', 'Third Place (1pt)', TEAM_SELECT_OPTIONS)}
          {field('Fair_Play_Award', 'Fair Play Award (1pt)', TEAM_SELECT_OPTIONS)}
          {field('Most_Entertaining_Team', 'Most Entertaining (1pt)', TEAM_SELECT_OPTIONS)}
          {field('Dark_Horse', 'Dark Horse (1pt)', TEAM_SELECT_OPTIONS)}
        </div>

        <h3 className="font-(family-name:--font-heading) text-[1.05rem] font-bold uppercase tracking-[1px] text-(--color-accent-blue) mt-4 mb-5 border-b border-(--color-accent-blue)/15 pb-1.5">
          Player Awards
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('Golden_Ball', 'Golden Ball Best Player (2pts)', PLAYER_SELECT_OPTIONS)}
          {field('Golden_Boot', 'Golden Boot Top Scorer (1pt)', PLAYER_SELECT_OPTIONS)}
          {field('Most_Assists', 'Most Assists (1pt)', PLAYER_SELECT_OPTIONS)}
          {field('Golden_Glove', 'Golden Glove Goalkeeper (1pt)', PLAYER_SELECT_OPTIONS)}
        </div>

        <div className="mt-4">{field('Best_Young_Player', 'Best Young Player Award (1pt)', PLAYER_SELECT_OPTIONS)}</div>

        <div className="mt-4">
          <button onClick={onCalculate} disabled={calculating} className={`${btnGold} w-full py-4`}>
            Calculate &amp; Rank Submissions
            <span className="btn-shine" />
          </button>
        </div>
      </form>
    </section>
  );
}
