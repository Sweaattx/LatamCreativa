'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, Check } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
    const supabase = getSupabaseClient();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
            });
            if (resetError) throw resetError;
            setSent(true);
        } catch (err) {
            const msg = (err as { message?: string })?.message || '';
            setError(msg || 'Error al enviar el correo de recuperación');
        } finally {
            setIsLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
                <div className="w-full max-w-sm text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Revisa tu correo</h1>
                    <p className="text-neutral-400 mb-8">
                        Si existe una cuenta con <span className="text-white">{email}</span>, recibirás un enlace para restablecer tu contraseña.
                    </p>
                    <Link
                        href="/login"
                        className="text-sm text-accent-500 hover:text-accent-400 transition-colors"
                    >
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-8 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio de sesión
                </Link>

                <h1 className="text-2xl font-bold text-white mb-2">
                    Recuperar contraseña
                </h1>
                <p className="text-neutral-500 text-sm mb-8">
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <button
                        type="submit"
                        disabled={isLoading || !email}
                        className="w-full h-11 bg-accent-500 hover:bg-accent-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            'Enviar enlace de recuperación'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
