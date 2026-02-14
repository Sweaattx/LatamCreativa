'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Users } from 'lucide-react';
import type { ArtistProfile } from '../../types';

interface ArtistCardProps {
  artist: ArtistProfile;
  variant?: 'default' | 'compact' | 'featured';
}

const ArtistCardComponent: React.FC<ArtistCardProps> = ({ artist, variant = 'default' }) => {
  const router = useRouter();

  const { username, displayName } = useMemo(() => ({
    username: artist.username || artist.name?.toLowerCase().replace(/\s+/g, '-') || artist.id,
    displayName: artist.name || artist.username || 'Usuario',
  }), [artist.username, artist.name, artist.id]);

  const handleClick = useCallback(() => {
    router.push(`/user/${username}`);
  }, [router, username]);

  if (variant === 'featured') {
    return (
      <article
        onClick={handleClick}
        className="group relative rounded-xl overflow-hidden bg-dark-2 border border-dark-5/50 cursor-pointer hover:border-dark-6 transition-all"
      >
        <div className="relative aspect-[3/2] bg-dark-3">
          {artist.coverImage && (
            <Image
              src={artist.coverImage}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-2 via-dark-2/40 to-transparent" />
        </div>
        <div className="relative px-4 pb-4 -mt-12">
          <div className="w-16 h-16 rounded-full border-2 border-dark-2 overflow-hidden bg-dark-3 mb-3">
            {artist.avatar && (
              <Image src={artist.avatar} alt={displayName} width={64} height={64} className="object-cover" />
            )}
          </div>
          <h3 className="text-base font-medium text-content-1 group-hover:text-accent-400 transition-colors">
            {displayName}
          </h3>
          <p className="text-sm text-content-3">@{username}</p>
          {artist.location && (
            <div className="flex items-center gap-1 mt-2 text-xs text-content-3">
              <MapPin className="w-3 h-3" />
              <span>{artist.location}</span>
            </div>
          )}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-dark-5/50 text-xs text-content-3">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {(artist.stats as { followers?: number })?.followers || 0} seguidores
            </span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article
        onClick={handleClick}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-3/50 cursor-pointer transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-dark-3 overflow-hidden flex-shrink-0">
          {artist.avatar && (
            <Image src={artist.avatar} alt="" width={40} height={40} className="object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-content-1 truncate">{displayName}</p>
          <p className="text-xs text-content-3 truncate">@{username}</p>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={handleClick}
      className="group p-5 rounded-xl bg-dark-2 border border-dark-5/50 hover:border-dark-6 cursor-pointer transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-dark-3 overflow-hidden flex-shrink-0">
          {artist.avatar && (
            <Image src={artist.avatar} alt="" width={48} height={48} className="object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-content-1 group-hover:text-accent-400 transition-colors truncate">
            {displayName}
          </h3>
          <p className="text-xs text-content-3 truncate">@{username}</p>
        </div>
      </div>
      {artist.bio && (
        <p className="text-xs text-content-2 line-clamp-2 mb-3">{artist.bio}</p>
      )}
      {artist.skills && artist.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {artist.skills.slice(0, 3).map((skill, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-2xs bg-dark-3 text-content-3 rounded"
            >
              {skill}
            </span>
          ))}
          {artist.skills.length > 3 && (
            <span className="px-2 py-0.5 text-2xs text-content-3">
              +{artist.skills.length - 3}
            </span>
          )}
        </div>
      )}
    </article>
  );
};

export const ArtistCard = memo(ArtistCardComponent);
export default ArtistCard;
