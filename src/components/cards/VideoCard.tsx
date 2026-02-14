'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { VideoSuggestion } from '../../types';

interface VideoCardProps {
  video: VideoSuggestion;
}

const VideoCardComponent: React.FC<VideoCardProps> = ({ video }) => {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-dark-2 ring-1 ring-dark-5/50">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-0/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <div className="absolute bottom-3 right-3">
            <span className="rounded-md bg-dark-0/80 px-2 py-1 text-xs font-medium text-content-1">
              {video.duration}
            </span>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-dark-0/50 p-3 backdrop-blur-sm">
            <Play className="h-8 w-8 fill-content-1 text-content-1" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-3.5">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-dark-3 relative">
          <Image
            src={`https://ui-avatars.com/api/?name=${video.channel}&background=random`}
            alt={video.channel}
            fill
            sizes="40px"
            className="object-cover"
            unoptimized
          />
        </div>
        <div>
          <h3 className="line-clamp-2 text-sm font-medium text-content-1 group-hover:text-accent-400 transition-colors leading-snug">
            {video.title}
          </h3>
          <div className="mt-1">
            <p className="text-xs font-medium text-content-2 hover:text-content-1 transition-colors">{video.channel}</p>
            <p className="text-xs text-content-3 mt-0.5">
              {video.views} • {video.timeAgo}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoCard = memo(VideoCardComponent);
export default VideoCard;
