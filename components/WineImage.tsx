'use client';

import Image from 'next/image';

interface WineImageProps {
  src?: string | null;
  alt: string;
  category?: 'wine' | 'category' | 'story' | 'default';
  className?: string;
}

const defaultImages = {
  wine: '/images/default-wine.png',
  category: '/images/default-category.png',
  story: '/images/default-story.png',
  default: '/images/default.png',
};

export function WineImage({ src, alt, category = 'wine', className = '' }: WineImageProps) {
  const imageSrc = src || defaultImages[category];
  
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 ${className}`}>
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className="object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = defaultImages[category];
        }}
      />
    </div>
  );
}

export function PlaceholderImage({ text, className = '' }: { text?: string; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 ${className}`}>
      {text && (
        <span className="text-4xl md:text-5xl font-light text-stone-400">
          {text}
        </span>
      )}
    </div>
  );
}
