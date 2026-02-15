'use client';

import React from 'react';

interface NotificationsTabProps {
    emailNotifs: boolean;
    setEmailNotifs: (v: boolean) => void;
    pushNotifs: boolean;
    setPushNotifs: (v: boolean) => void;
    marketingEmails: boolean;
    setMarketingEmails: (v: boolean) => void;
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className={`w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-accent-500' : 'bg-dark-5'}`}
        >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
    );
}

function NotifRow({ title, description, enabled, onToggle }: {
    title: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-dark-3/50 rounded-xl">
            <div>
                <p className="text-content-1 font-medium">{title}</p>
                <p className="text-sm text-content-3">{description}</p>
            </div>
            <Toggle enabled={enabled} onToggle={onToggle} />
        </div>
    );
}

export function NotificationsTab({
    emailNotifs, setEmailNotifs,
    pushNotifs, setPushNotifs,
    marketingEmails, setMarketingEmails
}: NotificationsTabProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-medium text-content-1">Preferencias de notificaciones</h2>
            <div className="space-y-4">
                <NotifRow
                    title="Notificaciones por email"
                    description="Recibe actualizaciones en tu correo"
                    enabled={emailNotifs}
                    onToggle={() => setEmailNotifs(!emailNotifs)}
                />
                <NotifRow
                    title="Notificaciones push"
                    description="Recibe alertas en tu navegador"
                    enabled={pushNotifs}
                    onToggle={() => setPushNotifs(!pushNotifs)}
                />
                <NotifRow
                    title="Emails de marketing"
                    description="Ofertas y novedades de la plataforma"
                    enabled={marketingEmails}
                    onToggle={() => setMarketingEmails(!marketingEmails)}
                />
            </div>
        </div>
    );
}
