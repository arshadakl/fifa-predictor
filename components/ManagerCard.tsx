import Image from 'next/image';
import { type SquadOfficial, playerImageUrl } from '@/lib/teams';
import PlayerSilhouette from './PlayerSilhouette';

export default function ManagerCard({ manager, flagSrc }: { manager: SquadOfficial; flagSrc: string }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-(--color-badge-dark)">
      <div className="relative aspect-square bg-white/5">
        {manager.pictureUrl ? (
          <Image
            src={playerImageUrl(manager.pictureUrl, 320)}
            alt={manager.name}
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
      </div>

      <div className="flex flex-col items-center gap-1.5 px-2 py-3 text-center">
        <h3 className="font-(family-name:--font-display) text-xs font-extrabold uppercase leading-tight text-white">
          {manager.name}
        </h3>
        <div className="h-px w-8 bg-(--color-gold-3)/40" />
        <span className="text-[10px] uppercase tracking-[0.1em] text-white/45">Manager</span>
      </div>
    </div>
  );
}
