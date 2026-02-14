'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User, Bell, Shield, Palette, Globe, CreditCard,
  Camera, Eye, EyeOff,
  Moon, Sun, Check, AlertCircle, Loader2
} from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { getSupabaseClient } from '@/lib/supabase/client';

type Tab = 'profile' | 'notifications' | 'privacy' | 'appearance' | 'billing';

export default function SettingsPage() {
  const { state } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');

  // Form states
  const [name, setName] = useState(state.user?.name || '');
  const [email, setEmail] = useState(state.user?.email || '');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');

  // Notification settings
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast(message);
    setToastType(type);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async () => {
    if (!state.user) return;
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
        .eq('id', state.user.id);

      if (error) throw error;
      showToast('Cambios guardados correctamente');
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast('Error al guardar los cambios', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const oldPwInput = document.querySelector<HTMLInputElement>('#current-password');
    const newPwInput = document.querySelector<HTMLInputElement>('#new-password');
    const newPassword = newPwInput?.value || '';
    if (!newPassword || newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showToast('Contraseña actualizada correctamente');
      if (oldPwInput) oldPwInput.value = '';
      if (newPwInput) newPwInput.value = '';
    } catch (err) {
      console.error('Error changing password:', err);
      showToast('Error al cambiar la contraseña', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!state.user) {
    return (
      <div className="min-h-screen bg-dark-1 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-accent-500 mb-4" />
        <h1 className="text-2xl font-bold text-content-1 mb-2">Inicia sesión</h1>
        <p className="text-content-3 mb-6 text-center">
          Necesitas iniciar sesión para acceder a la configuración.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-xl transition-colors"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as Tab, label: 'Perfil', icon: User },
    { id: 'notifications' as Tab, label: 'Notificaciones', icon: Bell },
    { id: 'privacy' as Tab, label: 'Privacidad', icon: Shield },
    { id: 'appearance' as Tab, label: 'Apariencia', icon: Palette },
    { id: 'billing' as Tab, label: 'Facturación', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-dark-1">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 ${toastType === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-400' : 'bg-green-500/20 border border-green-500/30 text-green-400'} rounded-xl text-sm font-medium shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2`}>
          <div className="flex items-center gap-2">
            {toastType === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {toast}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-light text-content-1 mb-8">Configuración</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === tab.id
                    ? 'bg-accent-500/10 text-accent-400'
                    : 'text-content-3 hover:text-content-1 hover:bg-dark-3/50'
                    }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-dark-2/50 rounded-2xl border border-dark-5 p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-content-1">Información del perfil</h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Image
                        src={state.user.avatar || `https://ui-avatars.com/api/?name=${state.user.name}`}
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
                      <p className="text-content-1 font-medium">{state.user.name}</p>
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
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 px-4 bg-dark-3 border border-dark-5 rounded-xl text-content-1 focus:outline-none focus:border-accent-500/50 transition-colors"
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
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-6 py-2.5 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                    >
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-content-1">Preferencias de notificaciones</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-dark-3/50 rounded-xl">
                      <div>
                        <p className="text-content-1 font-medium">Notificaciones por email</p>
                        <p className="text-sm text-content-3">Recibe actualizaciones en tu correo</p>
                      </div>
                      <button
                        onClick={() => setEmailNotifs(!emailNotifs)}
                        className={`w-12 h-6 rounded-full transition-colors ${emailNotifs ? 'bg-accent-500' : 'bg-dark-5'
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-dark-3/50 rounded-xl">
                      <div>
                        <p className="text-content-1 font-medium">Notificaciones push</p>
                        <p className="text-sm text-content-3">Recibe alertas en tu navegador</p>
                      </div>
                      <button
                        onClick={() => setPushNotifs(!pushNotifs)}
                        className={`w-12 h-6 rounded-full transition-colors ${pushNotifs ? 'bg-accent-500' : 'bg-dark-5'
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${pushNotifs ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-dark-3/50 rounded-xl">
                      <div>
                        <p className="text-content-1 font-medium">Emails de marketing</p>
                        <p className="text-sm text-content-3">Ofertas y novedades de la plataforma</p>
                      </div>
                      <button
                        onClick={() => setMarketingEmails(!marketingEmails)}
                        className={`w-12 h-6 rounded-full transition-colors ${marketingEmails ? 'bg-accent-500' : 'bg-dark-5'
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${marketingEmails ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-content-1">Privacidad y seguridad</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-content-2 mb-2">
                        Contraseña actual
                      </label>
                      <div className="relative">
                        <input
                          id="current-password"
                          type={showPassword ? 'text' : 'password'}
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
                        id="new-password"
                        type="password"
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
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-content-1">Apariencia</h2>

                  <div>
                    <label className="block text-sm font-medium text-content-2 mb-4">
                      Tema
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'dark', label: 'Oscuro', icon: Moon },
                        { id: 'light', label: 'Claro', icon: Sun },
                        { id: 'system', label: 'Sistema', icon: Globe },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setTheme(option.id as typeof theme)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${theme === option.id
                            ? 'bg-accent-500/10 border-accent-500/30 text-accent-400'
                            : 'bg-dark-3/50 border-dark-5 text-content-3 hover:text-content-1'
                            }`}
                        >
                          <option.icon className="w-6 h-6" />
                          <span className="text-sm">{option.label}</span>
                          {theme === option.id && (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-content-1">Facturación</h2>

                  <div className="p-6 bg-gradient-to-br from-accent-500/10 to-accent-600/10 rounded-xl border border-accent-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-accent-400 font-medium">Plan Actual</p>
                        <p className="text-2xl font-light text-content-1">Gratuito</p>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Función próximamente disponible')}
                      className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      Actualizar a Pro
                    </button>
                  </div>

                  <div className="text-center text-content-3 py-8">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 text-content-3/40" />
                    <p>No tienes métodos de pago guardados</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
