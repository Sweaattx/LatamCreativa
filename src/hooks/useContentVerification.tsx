/**
 * Hook de Verificación de Contenido
 * 
 * Verifica requisitos antes de crear contenido: autenticación, verificación de email, rate limiting.
 * 
 * @module hooks/useContentVerification
 */
import React, { useState, useEffect } from 'react';
import { useAppStore } from './useAppStore';
import { supabase } from '../lib/supabase';

// Rate limits en milisegundos
const RATE_LIMITS = {
    comment: 30 * 1000,   // 30 segundos entre comentarios
    like: 1 * 1000,       // 1 segundo entre likes
    create: 60 * 1000     // 1 minuto entre creaciones
};

// Almacenamiento de últimas acciones por tipo
const lastActionTimes: Record<string, number> = {};

interface ContentVerificationResult {
    canCreate: boolean;
    isEmailVerified: boolean;
    checkRateLimit: (actionType: 'comment' | 'like' | 'create') => boolean;
}

/**
 * Hook para verificar requisitos de creación de contenido.
 * 
 * @returns Objeto con estado de verificación y función de rate limiting
 */
export const useContentVerification = (): ContentVerificationResult => {
    const { state, actions } = useAppStore();
    const { user } = state;
    const [isEmailVerified, setIsEmailVerified] = React.useState(false);

    // Verificar si el email está verificado usando Supabase
    React.useEffect(() => {
        const checkEmailVerification = async () => {
            const { data: { user: supabaseUser } } = await supabase.auth.getUser();
            setIsEmailVerified(supabaseUser?.email_confirmed_at != null);
        };
        checkEmailVerification();
    }, [user]);

    // Verificar si puede crear contenido
    const canCreate = !!user && isEmailVerified;

    /**
     * Verifica rate limiting para una acción específica.
     * 
     * @param actionType - Tipo de acción a verificar
     * @returns true si la acción está permitida, false si está limitada
     */
    const checkRateLimit = (actionType: 'comment' | 'like' | 'create'): boolean => {
        if (!user) return false;

        const key = `${user.id}_${actionType}`;
        const now = Date.now();
        const lastTime = lastActionTimes[key] || 0;
        const limit = RATE_LIMITS[actionType];

        if (now - lastTime < limit) {
            const waitSeconds = Math.ceil((limit - (now - lastTime)) / 1000);
            actions.showToast(`Espera ${waitSeconds} segundos antes de continuar`, 'info');
            return false;
        }

        // Actualizar timestamp de última acción
        lastActionTimes[key] = now;
        return true;
    };

    return {
        canCreate,
        isEmailVerified,
        checkRateLimit
    };
};

/**
 * Componente banner para verificación de email.
 * Muestra un banner si el usuario no ha verificado su email.
 */
export const EmailVerificationBanner: React.FC = () => {
    const { state, actions } = useAppStore();
    const { user } = state;
    const [isSending, setIsSending] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    useEffect(() => {
        const checkEmailVerification = async () => {
            const { data: { user: supabaseUser } } = await supabase.auth.getUser();
            setIsEmailVerified(supabaseUser?.email_confirmed_at != null);
        };
        checkEmailVerification();
    }, [user]);

    if (!user || isEmailVerified) return null;

    const handleResend = async () => {
        setIsSending(true);
        try {
            const { data: { user: supabaseUser } } = await supabase.auth.getUser();
            if (supabaseUser?.email) {
                const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email: supabaseUser.email
                });
                if (error) throw error;
                actions.showToast('Email de verificación enviado', 'success');
            }
        } catch (error) {
            console.error('Error sending verification email:', error);
            actions.showToast('Error al enviar email', 'error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-full flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-medium text-amber-200">Verifica tu email</p>
                    <p className="text-xs text-amber-200/70">Para crear contenido, primero verifica tu correo electrónico.</p>
                </div>
            </div>
            <button
                onClick={handleResend}
                disabled={isSending}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            >
                {isSending ? 'Enviando...' : 'Reenviar email'}
            </button>
        </div>
    );
};
