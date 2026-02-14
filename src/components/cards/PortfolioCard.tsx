'use client';

import React, { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, Heart, Bookmark } from 'lucide-react';
import { PortfolioItem } from '../../types';

interface PortfolioCardProps {
  project?: PortfolioItem;
  item?: PortfolioItem;
  size?: 'sm' | 'md' | 'lg';
  showAuthor?: boolean;
  onClick?: () => void;
  onSave?: (id: string, image: string) => void;
}

const fmt = (n: number | string | undefined): string => {
  const num = typeof n === 'string' ? parseInt(n, 10) : (n || 0);
  return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
};

const ASPECT_CLASSES = {
  sm: 'aspect-square',
  md: 'aspect-[4/3]',
  lg: 'aspect-[16/9]',
} as const;

const PortfolioCardComponent: React.FC<PortfolioCardProps> = ({
  project,
  item,
  size = 'md',
  showAuthor = true,
  onClick,
  onSave,
}) => {
  const router = useRouter();
  const data = project || item;
  const img = data?.image || data?.images?.[0];

  const handleClick = useCallback(() => {
    if (!data) return;
    if (onClick) {
      onClick();
    } else {
      router.push(`/portfolio/${data.slug || data.id}`);
    }
  }, [onClick, router, data]);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave && img && data) {
      onSave(data.id, img);
    }
  }, [onSave, img, data]);

  if (!data) return null;

  return (
    <article onClick={handleClick} className="group cursor-pointer">
      <div className={`relative ${ASPECT_CLASSES[size]} rounded-xl overflow-hidden bg-dark-2`}>
        {img && (
          <Image
            src={img}
            alt={data.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-0/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Save button */}
        {onSave && (
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 p-2 bg-dark-0/60 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 hover:bg-dark-0/80 transition-all"
            aria-label={`Guardar ${data.title} en colección`}
          >
            <Bookmark className="w-4 h-4 text-content-1" aria-hidden="true" />
          </button>
        )}

        {/* Stats on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-4 text-sm text-content-1">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> {fmt(data.views)}
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4" /> {fmt(data.likes)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-medium text-content-1 truncate group-hover:text-accent-400 transition-colors">
          {data.title}
        </h3>
        {showAuthor && data.artist && (
          <div className="flex items-center gap-2 mt-1.5">
            {data.artistAvatar && (
              <Image
                src={data.artistAvatar}
                alt=""
                width={20}
                height={20}
                className="rounded-full object-cover"
              />
            )}
            <span className="text-xs text-content-3 truncate">{data.artist}</span>
          </div>
        )}
      </div>
    </article>
  );
};

export const PortfolioCard = memo(PortfolioCardComponent);
export default PortfolioCard;
