"use client";

import { useState } from 'react';

export default function ProgressiveImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
}) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return null;
  }

  return (
    <div className={`progressive-image ${loaded ? 'is-loaded' : ''} ${wrapperClassName}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`progressive-image-img ${className}`.trim()}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}
