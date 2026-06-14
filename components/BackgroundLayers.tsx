const IMAGES = ['bg-page1-5.jpg', 'bg-page2.jpg', 'bg-page3.jpg', 'bg-page4.jpg', 'bg-page5.jpg'];

// Hero (index 0) gets a deep navy-to-black cinematic overlay; other steps stay lighter.
const OVERLAYS = [
  'linear-gradient(to bottom, rgba(11,14,45,0.7), rgba(0,0,0,0.78))',
  'linear-gradient(to bottom, rgba(11,11,15,0.45), rgba(16,24,39,0.55))',
  'linear-gradient(to bottom, rgba(11,11,15,0.45), rgba(16,24,39,0.55))',
  'linear-gradient(to bottom, rgba(11,11,15,0.45), rgba(16,24,39,0.55))',
  'linear-gradient(to bottom, rgba(11,11,15,0.45), rgba(16,24,39,0.55))',
];

export default function BackgroundLayers({ activeImage }: { activeImage: number }) {
  return (
    <>
      {IMAGES.map((img, i) => (
        <div
          key={img}
          className={`bg-layer ${activeImage === i ? 'active' : ''}`}
          style={{
            backgroundImage: `${OVERLAYS[i]}, url('/images/${img}')`,
          }}
        />
      ))}
    </>
  );
}
