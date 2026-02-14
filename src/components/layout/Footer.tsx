'use client';

import Link from 'next/link';
import { useAppStore } from '../../hooks/useAppStore';

const links = {
  platform: [
    { label: 'Explorar', href: '/portfolio' },
    { label: 'Blog', href: '/blog' },
    { label: 'Foro', href: '/forum' },
    { label: 'Empleos', href: '/jobs' },
  ],
  services: [
    { label: 'Cursos', href: '/courses' },
    { label: 'Freelance', href: '/freelance' },
    { label: 'Concursos', href: '/contests' },
    { label: 'Proyectos', href: '/projects' },
  ],
  company: [
    { label: 'Acerca de', href: '/about' },
    { label: 'Pro', href: '/pro' },
  ],
  legal: [
    { label: 'Privacidad', href: '/privacy' },
    { label: 'Términos', href: '/terms' },
  ],
};

export function Footer() {
  const { state } = useAppStore();
  const isDevMode = state.contentMode === 'dev';
  const accentClass = isDevMode ? 'text-dev-400' : 'text-accent-500';

  return (
    <footer className="bg-dark-0 border-t border-dark-5/30">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-md font-semibold">
              Latam<span style={{ color: isDevMode ? '#60A5FA' : '#F59E0B', position: 'relative', top: '1px' }}>Creativa</span>
            </Link>
            <p className="mt-2 text-xs text-content-3 leading-relaxed">
              La comunidad creativa de Latinoamérica.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-2xs font-medium text-content-3 uppercase tracking-widest mb-3">
              Plataforma
            </h4>
            <ul className="space-y-2">
              {links.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-content-2 hover:text-content-1 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-2xs font-medium text-content-3 uppercase tracking-widest mb-3">
              Servicios
            </h4>
            <ul className="space-y-2">
              {links.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-content-2 hover:text-content-1 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-2xs font-medium text-content-3 uppercase tracking-widest mb-3">
              Compañía
            </h4>
            <ul className="space-y-2">
              {links.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-content-2 hover:text-content-1 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-2xs font-medium text-content-3 uppercase tracking-widest mb-3">
              Legal
            </h4>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-content-2 hover:text-content-1 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-dark-5/30 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-content-3">
            © {new Date().getFullYear()} Latam<span style={{ color: isDevMode ? '#60A5FA' : '#F59E0B', position: 'relative', top: '1px' }}>Creativa</span>. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-content-3 hover:text-content-2 transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-content-3 hover:text-content-2 transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
