'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { User } from '@/types';

interface ProfileTabProps {
    user: User;
    saving: boolean;
    setSaving: (saving: boolean) => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

export function ProfileTab({ user, saving, setSaving, showToast }: ProfileTabProps) {
    const [name, setName] = useState(user.name || '');
    const [email] = useState(user.email || '');
    const [bio, setBio] = useState('');
    const [website, setWebsite] = useState('');

    const handleSave = async () => {
        setSaving(true);
        try {
            const supabase = getSupabaseClient();
            const updates: Record<string, unknown> = {
                name: name.trim(),
                bio: bio.trim() || null,
                website: website.trim() || null,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('users')
                .update(updates as never)
                .eq('id', user.id);

            if (error) throw error;
            showToast('Cambios guardados correctamente');
        } catch (err) {
            console.error('Error saving profile:', err);
            showToast('Error al guardar los cambios', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-medium text-content-1">Información del perfil</h2>

            {/* Avatar */}
            <div className="flex items-center gap-6">
                <div className="relative">
                    <Image
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                        alt="Avatar"
                        width={80}
                        height={80}
                        className="rounded-xl"
                        unoptimized
                    />
                    <button className="absolute -bottom-2 -right-2 p-2 bg-accent-500 rounded-lg hover:bg-accent-600 transition-colors">
                        <Camera className="w-4 h-4 text-white" />
                    </button>
                </div>
                <div>
                    <p className="text-content-1 font-medium">{user.name}</p>
                    <p className="text-sm text-content-3">JPG, PNG o GIF. Máximo 2MB</p>
                </div>
            </div>

            {/* Form */}
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-content-2 mb-2">
                        Nombre completo
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-11 px-4 bg-dark-3 border border-dark-5 rounded-xl text-content-1 focus:outline-none focus:border-accent-500/50 transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-content-2 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full h-11 px-4 bg-dark-3 border border-dark-5 rounded-xl text-content-3 cursor-not-allowed focus:outline-none"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-content-2 mb-2">
                        Bio
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        placeholder="Cuéntanos sobre ti..."
                        className="w-full px-4 py-3 bg-dark-3 border border-dark-5 rounded-xl text-content-1 placeholder:text-content-3 focus:outline-none focus:border-accent-500/50 transition-colors resize-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-content-2 mb-2">
                        Website
                    </label>
                    <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://"
                        className="w-full h-11 px-4 bg-dark-3 border border-dark-5 rounded-xl text-content-1 placeholder:text-content-3 focus:outline-none focus:border-accent-500/50 transition-colors"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-dark-5">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>
        </div>
    );
}
