import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-[120px] leading-none font-bold tracking-tighter text-content-3/20">
          404
        </p>
        <p className="text-content-3 mt-4 mb-8 text-sm">
          La página que buscas no existe.
        </p>
        <Link
          href="/"
          className="text-content-3/60 text-xs hover:text-content-1 transition-colors underline underline-offset-4"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

