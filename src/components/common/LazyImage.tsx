'use client';

import React, { useState, memo, useCallback } from 'react';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt?: string;
  className?: string;
  wrapperClassName?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}

const LazyImageComponent: React.FC<LazyImageProps> = ({ 
  src, 
  alt = '', 
  className = '', 
  wrapperClassName = '',
  fill = true,
  width,
  height,
  sizes = '100vw',
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => setIsLoaded(true), []);
  const handleError = useCallback(() => setHasError(true), []);

  if (hasError || !src) {
    return (
      <div className={`relative overflow-hidden bg-neutral-800 ${wrapperClassName}`}>
        <div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-xs">
          Sin imagen
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-neutral-900 ${wrapperClassName}`}>
      {/* Skeleton Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 animate-pulse bg-neutral-800" />
      )}
      
      {/* Optimized Next.js Image */}
      <Image
        src={src}
        alt={alt}
        fill={fill && !width}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        className={`object-cover transition-opacity duration-500 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
};

export const LazyImage = memo(LazyImageComponent);
