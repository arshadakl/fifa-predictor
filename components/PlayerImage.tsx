'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import PlayerSilhouette from './PlayerSilhouette';

interface PlayerImageProps {
  src: string;
  alt: string;
}

export default function PlayerImage({ src, alt }: Readonly<PlayerImageProps>) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Cached images may finish before onLoad attaches — sync on mount.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  if (errored) {
    return <PlayerSilhouette className="h-full w-full p-6 text-white/15" />;
  }

  return (
    <>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-white/10" />}
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        className={`object-cover object-top transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        unoptimized
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </>
  );
}
