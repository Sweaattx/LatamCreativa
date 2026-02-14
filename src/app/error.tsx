'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { errorLogger } from '@/utils/errorLogger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    errorLogger.unhandled(error, {
      source: 'AppErrorBoundary',
      metadata: { digest: error.digest }
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-dark-1 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-danger/10 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-danger" />
        </div>
        <h1 className="text-3xl font-bold text-content-1 mb-4">
          ¡Algo salió mal!
        </h1>
        <p className="text-content-3 mb-8">
          Ha ocurrido un error inesperado. Por favor, intenta de nuevo o vuelve
          al inicio.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="btn-primary"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </button>
          <Link href="/" className="btn-secondary">
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
