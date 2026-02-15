'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User, Bell, Shield, Palette, CreditCard,
  Check, AlertCircle
} from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { SecurityTab } from '@/components/settings/SecurityTab';
import { NotificationsTab } from '@/components/settings/NotificationsTab';
import { AppearanceTab } from '@/components/settings/AppearanceTab';
import { BillingTab } from '@/components/settings/BillingTab';

type Tab = 'profile' | 'notifications' | 'privacy' | 'appearance' | 'billing';

const TABS = [
  { id: 'profile' as Tab, label: 'Perfil', icon: User },
  { id: 'notifications' as Tab, label: 'Notificaciones', icon: Bell },
  { id: 'privacy' as Tab, label: 'Privacidad', icon: Shield },
  { id: 'appearance' as Tab, label: 'Apariencia', icon: Palette },
  { id: 'billing' as Tab, label: 'Facturación', icon: CreditCard },
];

export default function SettingsPage() {
  const { state } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');

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
              {TABS.map((tab) => (
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
              {activeTab === 'profile' && (
                <ProfileTab user={state.user} saving={saving} setSaving={setSaving} showToast={showToast} />
              )}
              {activeTab === 'notifications' && (
                <NotificationsTab
                  emailNotifs={emailNotifs} setEmailNotifs={setEmailNotifs}
                  pushNotifs={pushNotifs} setPushNotifs={setPushNotifs}
                  marketingEmails={marketingEmails} setMarketingEmails={setMarketingEmails}
                />
              )}
              {activeTab === 'privacy' && (
                <SecurityTab saving={saving} setSaving={setSaving} showToast={showToast} />
              )}
              {activeTab === 'appearance' && (
                <AppearanceTab theme={theme} setTheme={setTheme} />
              )}
              {activeTab === 'billing' && (
                <BillingTab showToast={showToast} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
