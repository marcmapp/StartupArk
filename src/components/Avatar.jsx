import React from 'react';
import { getImageUrl } from '../utils/imageUrls';

// Shared img-or-letter avatar idiom (previously duplicated ad hoc across
// TalentCard/TalentDetail) — routes through getImageUrl so R2 keys resolve
// to the CDN the same way chat/self-profile avatars already do.
export default function Avatar({ src, name, size = 'w-11 h-11', textSize = 'text-sm', className = '' }) {
  const url = getImageUrl(src);

  if (url) {
    return <img src={url} alt="" className={`${size} rounded-full object-cover shrink-0 ${className}`} />;
  }

  return (
    <div className={`${size} rounded-full bg-black/[0.06] dark:bg-zinc-800 flex items-center justify-center ${textSize} text-zinc-500 dark:text-zinc-400 shrink-0 ${className}`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}
