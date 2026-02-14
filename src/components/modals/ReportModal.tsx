import React, { useState } from 'react';
import { X, Flag, Loader2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => Promise<void>;
  contentType?: string;
}

const reportReasons = [
  'Contenido inapropiado',
  'Spam o publicidad',
  'Acoso o bullying',
  'Información falsa',
  'Contenido con derechos de autor',
  'Otro',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contentType = 'contenido',
}) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason) return;
    setLoading(true);
    try {
      await onSubmit(reason, details);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setReason('');
        setDetails('');
      }, 2000);
    } catch (error) {
      console.error('Report error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500" />
            <h3 className="font-semibold text-white">Reportar {contentType}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {submitted ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
                <Flag className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-white font-medium">Reporte enviado</p>
              <p className="text-sm text-neutral-500 mt-1">
                Gracias por ayudarnos a mantener la comunidad segura
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Reason Selection */}
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">Motivo del reporte</label>
                <div className="space-y-1.5">
                  {reportReasons.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        reason === r
                          ? 'bg-neutral-800 border border-amber-500/50'
                          : 'bg-neutral-800/50 border border-transparent hover:bg-neutral-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={(e) => setReason(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          reason === r ? 'border-amber-500' : 'border-neutral-600'
                        }`}
                      >
                        {reason === r && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                      </div>
                      <span className="text-sm text-white">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">Detalles adicionales (opcional)</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe el problema..."
                  rows={3}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!reason || loading}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enviar reporte
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
