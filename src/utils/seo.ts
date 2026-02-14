/**
 * SEO Utilities
 * 
 * Helper functions for generating metadata for Next.js pages.
 * 
 * @module utils/seo
 */

import { Metadata } from 'next';

const SITE_NAME = 'LatamCreativa';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://latamcreativa.com';
const DEFAULT_DESCRIPTION = 'Comunidad de creativos latinoamericanos. Comparte tu portafolio, aprende y conecta.';

interface PageMetadataOptions {
    title: string;
    description?: string;
    image?: string;
    path?: string;
    type?: 'website' | 'article' | 'profile';
    publishedTime?: string;
    author?: string;
    tags?: string[];
    noIndex?: boolean;
}

/**
 * Generate metadata for a page
 */
export function generatePageMetadata(options: PageMetadataOptions): Metadata {
    const {
        title,
        description = DEFAULT_DESCRIPTION,
        image,
        path = '',
        type = 'website',
        publishedTime,
        author,
        tags,
        noIndex = false,
    } = options;

    const fullTitle = `${title} | ${SITE_NAME}`;
    const url = `${SITE_URL}${path}`;
    const ogImage = image || `${SITE_URL}/og-default.png`;

    return {
        title: fullTitle,
        description,
        keywords: tags,
        authors: author ? [{ name: author }] : undefined,
        openGraph: {
            title: fullTitle,
            description,
            url,
            siteName: SITE_NAME,
            type,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            ...(publishedTime && { publishedTime }),
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [ogImage],
        },
        robots: noIndex ? { index: false, follow: false } : undefined,
        alternates: {
            canonical: url,
        },
    };
}

/**
 * Generate metadata for an article page
 */
export function generateArticleMetadata(article: {
    title: string;
    excerpt?: string;
    image?: string;
    slug: string;
    date?: string;
    authorName?: string;
    tags?: string[];
}): Metadata {
    return generatePageMetadata({
        title: article.title,
        description: article.excerpt,
        image: article.image,
        path: `/blog/${article.slug}`,
        type: 'article',
        publishedTime: article.date,
        author: article.authorName,
        tags: article.tags,
    });
}

/**
 * Generate metadata for a project page
 */
export function generateProjectMetadata(project: {
    title: string;
    description?: string;
    image?: string;
    slug: string;
    authorName?: string;
    tags?: string[];
}): Metadata {
    return generatePageMetadata({
        title: project.title,
        description: project.description,
        image: project.image,
        path: `/portfolio/${project.slug}`,
        type: 'article',
        author: project.authorName,
        tags: project.tags,
    });
}

/**
 * Generate metadata for a user profile page
 */
export function generateProfileMetadata(user: {
    name: string;
    bio?: string;
    avatar?: string;
    username: string;
}): Metadata {
    return generatePageMetadata({
        title: user.name,
        description: user.bio || `Perfil de ${user.name} en LatamCreativa`,
        image: user.avatar,
        path: `/user/${user.username}`,
        type: 'profile',
    });
}

/**
 * Generate JSON-LD structured data for articles
 */
export function generateArticleJsonLd(article: {
    title: string;
    excerpt?: string;
    image?: string;
    slug: string;
    date?: string;
    authorName?: string;
}): string {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.excerpt,
        image: article.image,
        datePublished: article.date,
        author: {
            '@type': 'Person',
            name: article.authorName || 'LatamCreativa',
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE_URL}/blog/${article.slug}`,
        },
    });
}
