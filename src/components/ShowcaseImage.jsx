import { useState } from 'react';

// Cover-image idiom for post/update showcases: shimmers while loading, then
// fades in once decoded. Reports `onError` so the caller can swap to its own
// fallback layout (a broken/expired imageUrl otherwise renders the browser's
// native broken-image icon instead of a graceful empty state).
export default function ShowcaseImage({ src, alt = '', wrapperClassName = '', imgClassName = '', onError }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative ${wrapperClassName}`}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-black/[0.04] dark:bg-white/[0.06]" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={onError}
        className={`${imgClassName} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
