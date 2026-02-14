'use client';

import Image, { ImageProps } from 'next/image';

/**
 * Avatar component that handles external avatar URLs.
 * Uses `unoptimized` for external avatar services (ui-avatars.com, dicebear, etc.)
 * since Next.js image optimizer proxy can't reliably reach these services.
 */

const UNOPTIMIZED_HOSTS = ['ui-avatars.com', 'api.dicebear.com'];

function isExternalAvatar(src: string): boolean {
    return UNOPTIMIZED_HOSTS.some(host => src.includes(host));
}

interface AvatarProps extends Omit<ImageProps, 'unoptimized'> {
    src: string;
}

export function Avatar({ src, ...props }: AvatarProps) {
    return (
        <Image
            src={src}
            unoptimized={isExternalAvatar(src)}
            {...props}
        />
    );
}

export default Avatar;
