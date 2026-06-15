import { cn } from '@/lib/utils';

const IMAGES = ['bg-page1-5.jpg', 'Argentina-v-France-Final-FIFA-World-Cup-Qatar-2022.webp', 'bg-page3.jpg', 'bg-page4.jpg', 'bg-page5.jpg'];

// Hero (index 0) gets a dark, color-graded eFootball-style split-panel composition;
// other steps keep the lighter cinematic overlay.
const OVERLAYS = [
  'linear-gradient(100deg, #080a10 0%, #080a10 38%, rgba(8,10,16,0.55) 44%, rgba(13,27,42,0.15) 58%, rgba(13,27,42,0.05) 100%)',
  'linear-gradient(to bottom, rgba(11,11,15,0.45), rgba(16,24,39,0.55))',
  'linear-gradient(to bottom, rgba(11,11,15,0.45), rgba(16,24,39,0.55))',
  'linear-gradient(to bottom, rgba(11,11,15,0.45), rgba(16,24,39,0.55))',
  'linear-gradient(to bottom, rgba(11,11,15,0.45), rgba(16,24,39,0.55))',
];

interface BackgroundLayersProps {
  activeImage: number;
}

export default function BackgroundLayers({ activeImage }: Readonly<BackgroundLayersProps>) {
  return (
    <>
      {IMAGES.map((img, i) => {
        if (i === 0) return null;
        return (
          <div
            key={img}
            className={cn('bg-layer', activeImage === i && 'active')}
            style={{
              backgroundImage: `${OVERLAYS[i]}, url('/images/${img}')`,
            }}
          />
        );
      })}
    </>
  );
}
