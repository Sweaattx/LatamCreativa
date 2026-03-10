import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Validates that a redirect path is safe (relative, no protocol injection).
 * Returns '/' if the path is invalid or potentially malicious.
 */
function getSafeRedirectPath(path: string | null): string {
  if (!path) return '/';
  // Must start with exactly one '/' (reject protocol-relative "//evil.com")
  // Only allow alphanumeric, hyphens, underscores, slashes, dots, and query strings
  const SAFE_PATH = /^\/(?!\/)[a-zA-Z0-9\-_./~]*(\?[a-zA-Z0-9\-_=&%]*)?$/;
  return SAFE_PATH.test(path) ? path : '/';
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = getSafeRedirectPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}