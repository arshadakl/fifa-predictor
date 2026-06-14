import Image from 'next/image';
import { type SquadPlayer, playerImageUrl } from '@/lib/teams';
import PlayerSilhouette from './PlayerSilhouette';

export default function PlayerCard({ player, flagSrc }: { player: SquadPlayer; flagSrc: string }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-(--color-badge-dark)">
      <div className="relative aspect-square bg-white/5">
        {player.pictureUrl ? (
          <Image
            src={playerImageUrl(player.pictureUrl, 320)}
            alt={player.name}
            fill
            className="object-cover object-top"
            unoptimized
          />
        ) : (
          <PlayerSilhouette className="h-full w-full p-6 text-white/15" />
        )}

        <Image
          src={flagSrc}
          alt=""
          width={20}
          height={20}
          className="absolute top-2 left-2 h-5 w-5 rounded-full border border-white/20 object-cover"
          unoptimized
        />

        {player.jerseyNum != null && (
          <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-[11px] font-bold text-white">
            {player.jerseyNum}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-1.5 px-2 py-3 text-center">
        <h3 className="font-(family-name:--font-display) text-xs font-extrabold uppercase leading-tight text-white">
          {player.name}
        </h3>
        <div className="h-px w-8 bg-(--color-gold-3)/40" />
        <span className="text-[10px] uppercase tracking-[0.1em] text-white/45">{player.position}</span>
      </div>
    </div>
  );
}
