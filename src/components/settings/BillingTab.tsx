'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';

interface BillingTabProps {
    showToast: (message: string, type?: 'success' | 'error') => void;
}

export function BillingTab({ showToast }: BillingTabProps) {
    return (
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
    );
}
