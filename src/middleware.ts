/**
 * Next.js Middleware
 * 
 * Handles:
 * - Session refresh (Supabase auth)
 * - Protected route guards
 * - Global rate limiting for API routes
 * 
 * @module middleware
 */

import { updateSession } from './lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

// ── In-memory rate limit store (per-instance) ──
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanupRateLimits() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, entry] of rateLimitStore) {
        if (now > entry.resetAt) rateLimitStore.delete(key);
    }
}

function isRateLimited(
    key: string,
    maxRequests: number,
    windowSeconds: number
): { limited: boolean; remaining: number; resetAt: number } {
    cleanupRateLimits();
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const existing = rateLimitStore.get(key);

    if (!existing || now > existing.resetAt) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
        return { limited: false, remaining: maxRequests - 1, resetAt: now + windowMs };
    }

    existing.count++;
    if (existing.count > maxRequests) {
        return { limited: true, remaining: 0, resetAt: existing.resetAt };
    }
    return { limited: false, remaining: maxRequests - existing.count, resetAt: existing.resetAt };
}

function getClientIp(request: NextRequest): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ip = getClientIp(request);

    // ── Rate Limiting for API routes ──
    if (pathname.startsWith('/api/')) {
        const rl = isRateLimited(`api:${ip}`, 60, 60); // 60 req/min
        if (rl.limited) {
            return NextResponse.json(
                { error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
                        'X-RateLimit-Limit': '60',
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(Math.ceil(rl.resetAt / 1000)),
                    },
                }
            );
        }
    }

    // ── Rate Limiting for auth endpoints (brute-force protection) ──
    if (pathname === '/login' || pathname === '/register') {
        const method = request.method;
        if (method === 'POST') {
            const authLimit = pathname === '/login'
                ? isRateLimited(`auth-login:${ip}`, 5, 60)   // 5 login attempts/min
                : isRateLimited(`auth-register:${ip}`, 3, 3600); // 3 registrations/hour

            if (authLimit.limited) {
                return NextResponse.json(
                    { error: 'Demasiados intentos. Intenta de nuevo más tarde.' },
                    { status: 429 }
                );
            }
        }
    }

    // ── Session refresh + route guards ──
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - Static assets (svg, png, jpg, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|avif|woff2?)$).*)',
    ],
};
