import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-1 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-accent-500/20 to-accent-700/20 flex items-center justify-center">
          <span className="text-5xl font-bold text-accent-500">404</span>
        </div>
        <h1 className="text-3xl font-bold text-content-1 mb-4">
          Página no encontrada
        </h1>
        <p className="text-content-3 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida a otra
          ubicación.
        </p>
        <div className="flex items-center justify-center">
          <Link href="/" className="btn-primary">
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
