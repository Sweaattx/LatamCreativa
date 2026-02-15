'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, Check } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAppStore } from '@/hooks/useAppStore';
import { usersProfile } from '@/services/supabase/users/profile';

interface AuthFormProps {
  mode: 'login' | 'register';
}

const getSupabaseAuthError = (error: unknown): string => {
  if (!error) return 'Error desconocido';
  const msg = (error as { message?: string })?.message || '';
  const code = (error as { code?: string })?.code || '';
  const map: Record<string, string> = {
    'Invalid login credentials': 'Credenciales inválidas',
    'Email not confirmed': 'Verifica tu correo electrónico',
    'User already registered': 'Este correo ya está registrado',
    'invalid_credentials': 'Credenciales inválidas',
  };
  return map[msg] || map[code] || msg || 'Error de autenticación';
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { state, actions } = useAppStore();
  const isDevMode = state.contentMode === 'dev';

  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isPasswordValid = password.length >= 8;

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(getSupabaseAuthError(err));
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        console.log('[AuthForm] Attempting login with email:', email);
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          console.error('[AuthForm] signInWithPassword error:', signInError);
          throw signInError;
        }
        console.log('[AuthForm] signInWithPassword success, user:', data.user?.id);

        if (data.user && !data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          setError('Verifica tu correo electrónico primero');
          setIsLoading(false);
          return;
        }

        // Try to load profile into store BEFORE navigating (non-blocking)
        if (data.user) {
          try {
            let profile = await usersProfile.getUserProfile(data.user.id);
            console.log('[AuthForm] getUserProfile result:', profile ? 'found' : 'not found');
            if (!profile) {
              profile = await usersProfile.initializeUserProfile(data.user);
              console.log('[AuthForm] initializeUserProfile result:', profile ? 'created' : 'null');
            }
            if (profile) {
              actions.setUser(profile);
              console.log('[AuthForm] setUser called with profile:', profile.id);
            }
          } catch (profileErr) {
            // Profile loading failed — still redirect, AuthListener will retry
            console.warn('[AuthForm] Profile loading failed, will retry on next page:', profileErr);
          }
        }

        console.log('[AuthForm] Navigating to /');
        router.push('/');
        router.refresh();
      } else {
        if (!acceptedTerms) {
          setError('Acepta los términos para continuar');
          setIsLoading(false);
          return;
        }
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: firstName, last_name: lastName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;
        setVerificationSent(true);
      }
    } catch (err) {
      console.error('[AuthForm] handleSubmit caught error:', err);
      setError(getSupabaseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Revisa tu correo</h1>
          <p className="text-neutral-400 mb-8">
            Enviamos un enlace de verificación a{' '}
            <span className="text-white">{email}</span>
          </p>
          <button
            onClick={() => {
              setVerificationSent(false);
              setIsLogin(true);
            }}
            className={`text-sm ${isDevMode ? 'text-dev-400 hover:text-dev-300' : 'text-amber-500 hover:text-amber-400'}`}
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-semibold inline-block mb-6">
            Latam<span style={{ color: isDevMode ? '#60A5FA' : '#F59E0B', position: 'relative', top: '1px' }}>Creativa</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h1>
          <p className="text-neutral-500 text-sm">
            {isLogin
              ? 'Ingresa tus credenciales para continuar'
              : 'Únete a la comunidad creativa de LATAM'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full h-11 mb-6 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar con Google
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-dark-950 text-neutral-500">o continúa con email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1.5">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
                    placeholder="Juan"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1.5">
                  Apellido
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-11 px-4 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
                  placeholder="Pérez"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-12 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-neutral-600 mt-1.5">
                Mínimo 8 caracteres
              </p>
            )}
          </div>

          {!isLogin && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className={`mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 focus:ring-0 ${isDevMode ? 'text-dev-500' : 'text-amber-500'}`}
              />
              <span className="text-xs text-neutral-500">
                Acepto los{' '}
                <Link href="/terms" className={`hover:underline ${isDevMode ? 'text-dev-400' : 'text-amber-500'}`}>
                  términos
                </Link>{' '}
                y la{' '}
                <Link href="/privacy" className={`hover:underline ${isDevMode ? 'text-dev-400' : 'text-amber-500'}`}>
                  política de privacidad
                </Link>
              </span>
            </label>
          )}

          {isLogin && (
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-neutral-500 hover:text-white"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !isEmailValid || !isPasswordValid}
            className={`w-full h-11 disabled:bg-neutral-800 disabled:text-neutral-600 text-black font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${isDevMode ? 'bg-dev-500 hover:bg-dev-600 text-white' : 'bg-amber-500 hover:bg-amber-400'}`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-neutral-500">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className={`font-medium ${isDevMode ? 'text-dev-400 hover:text-dev-300' : 'text-amber-500 hover:text-amber-400'}`}
          >
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}
