'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';

interface SecurityTabProps {
    saving: boolean;
    setSaving: (saving: boolean) => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

export function SecurityTab({ saving, setSaving, showToast }: SecurityTabProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleChangePassword = async () => {
        if (!currentPassword) {
            showToast('Ingresa tu contraseña actual', 'error');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            showToast('La nueva contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        setSaving(true);
        try {
            const supabase = getSupabaseClient();

            // Re-authenticate with current password first
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) {
                showToast('Error al verificar usuario', 'error');
                return;
            }

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });

            if (signInError) {
                showToast('La contraseña actual no es correcta', 'error');
                return;
            }

            // Now update password
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            showToast('Contraseña actualizada correctamente');
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            console.error('Error changing password:', err);
            showToast('Error al cambiar la contraseña', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-medium text-content-1">Privacidad y seguridad</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-content-2 mb-2">
                        Contraseña actual
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-11 px-4 pr-10 bg-dark-3 border border-dark-5 rounded-xl text-content-1 placeholder:text-content-3 focus:outline-none focus:border-accent-500/50 transition-colors"
                        />
                        <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-content-3 hover:text-content-1"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-content-2 mb-2">
                        Nueva contraseña
                    </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 px-4 bg-dark-3 border border-dark-5 rounded-xl text-content-1 placeholder:text-content-3 focus:outline-none focus:border-accent-500/50 transition-colors"
                    />
                </div>
                <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="px-6 py-2.5 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? 'Actualizando...' : 'Cambiar contraseña'}
                </button>
            </div>

            <div className="pt-6 border-t border-dark-5">
                <h3 className="text-lg font-medium text-content-1 mb-4">Zona de peligro</h3>
                <button className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl transition-colors border border-red-500/20">
                    Eliminar cuenta
                </button>
            </div>
        </div>
    );
}
