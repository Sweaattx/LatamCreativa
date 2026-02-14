'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { X, Code, Palette, User, LogOut, Settings, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PRIMARY_NAV_ITEMS, NAV_SECTIONS, NAV_SECTIONS_DEV } from '../../data/navigation';
import { ContentMode, useAppStore } from '../../hooks/useAppStore';
import { NavSection } from '../../types';

// ============================================
// PRIMARY SIDEBAR
// ============================================

interface PrimarySidebarProps {
  activeModule?: string;
  onModuleSelect?: (moduleId: string) => void;
  contentMode: ContentMode;
  onToggleContentMode: () => void;
}

export const PrimarySidebar: React.FC<PrimarySidebarProps> = ({
  activeModule = 'portfolio',
  onModuleSelect,
  contentMode,
  onToggleContentMode
}) => {
  const { state, actions } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = state;
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    actions.setUser(null);
    setProfileOpen(false);
    router.push('/');
  };

  const isDevMode = contentMode === 'dev';

  return (
    <aside className="hidden md:flex flex-col w-16 h-screen sticky top-0 bg-dark-1 border-r border-dark-5/50 overflow-hidden">
      {/* Spacer */}
      <div className="h-14" />

      {/* Nav */}
      <nav className="flex-1 flex flex-col items-center py-2 gap-0.5 overflow-y-auto">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const routeMap: Record<string, string> = {
            home: '/',
            portfolio: '/portfolio',
            blog: '/blog',
            forum: '/forum',
            courses: '/courses',
            freelance: '/freelance',
            jobs: '/jobs',
            proyectos: '/proyectos',
            concursos: '/concursos',
          };
          const href = routeMap[item.id] || '/';
          const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));

          if (item.comingSoon) {
            return (
              <div
                key={item.id}
                className="relative group w-10 h-10 flex items-center justify-center rounded-lg text-content-3/40 cursor-default"
              >
                <item.icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={href}
              className={`
                relative w-10 h-10 flex items-center justify-center rounded-lg
                transition-all duration-200 ease-smooth
                ${isActive
                  ? isDevMode
                    ? 'bg-dev-subtle text-dev-400'
                    : 'bg-accent-subtle text-accent-500'
                  : 'text-content-3 hover:text-content-2 hover:bg-dark-3/50'
                }
              `}
            >
              <item.icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {isActive && (
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r ${isDevMode ? 'bg-dev-500' : 'bg-accent-500'}`} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="py-3 flex flex-col items-center gap-1.5 border-t border-dark-5/50" ref={profileRef}>
        <button
          onClick={onToggleContentMode}
          className={`
            w-10 h-10 flex items-center justify-center rounded-lg
            transition-all duration-200 ease-smooth
            ${isDevMode
              ? 'bg-dev-subtle text-dev-400 hover:bg-dev-subtle/150'
              : 'bg-accent-subtle text-accent-500 hover:bg-accent-glow'
            }
          `}
          title={isDevMode ? 'Modo Dev' : 'Modo Creativo'}
        >
          {isDevMode ? <Code className="w-[18px] h-[18px]" /> : <Palette className="w-[18px] h-[18px]" />}
        </button>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-dark-5 hover:ring-dark-6 transition-all"
            >
              <Image
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=FF4D00&color=fff&size=64`}
                alt=""
                width={32}
                height={32}
                className="object-cover"
                unoptimized
              />
            </button>

            {profileOpen && (
              <div className="absolute left-full bottom-0 ml-2 w-48 py-1 bg-dark-2 border border-dark-5 rounded-xl shadow-lg z-50 animate-scale-in">
                <div className="px-3 py-2.5 border-b border-dark-5">
                  <p className="text-sm font-medium text-content-1 truncate">{user.name}</p>
                  <p className="text-xs text-content-3 truncate">@{user.username || 'usuario'}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { router.push(`/user/${user.username}`); setProfileOpen(false); }} className="w-full px-3 py-2 flex items-center gap-2.5 text-sm text-content-2 hover:text-content-1 hover:bg-dark-3/50 transition-colors">
                    <User className="w-4 h-4" /> Perfil
                  </button>
                  <button onClick={() => { router.push('/settings'); setProfileOpen(false); }} className="w-full px-3 py-2 flex items-center gap-2.5 text-sm text-content-2 hover:text-content-1 hover:bg-dark-3/50 transition-colors">
                    <Settings className="w-4 h-4" /> Configuración
                  </button>
                </div>
                <div className="border-t border-dark-5 pt-1">
                  <button onClick={handleLogout} className="w-full px-3 py-2 flex items-center gap-2.5 text-sm text-danger hover:bg-dark-3/50 transition-colors">
                    <LogOut className="w-4 h-4" /> Salir
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="w-8 h-8 rounded-full bg-dark-3 flex items-center justify-center text-content-3 hover:text-content-2 hover:bg-dark-4 transition-all">
            <User className="w-4 h-4" />
          </Link>
        )}
      </div>
    </aside>
  );
};

// ============================================
// SECONDARY SIDEBAR
// ============================================

interface SecondarySidebarProps {
  activeModule: string;
  contentMode: ContentMode;
  onClose?: () => void;
}

export const SecondarySidebar: React.FC<SecondarySidebarProps> = ({ activeModule, contentMode }) => {
  const pathname = usePathname();
  const sections: NavSection[] = contentMode === 'dev' ? NAV_SECTIONS_DEV : NAV_SECTIONS;
  const moduleItem = PRIMARY_NAV_ITEMS.find(item => item.id === activeModule);
  const isDevMode = contentMode === 'dev';

  return (
    <aside className="hidden lg:flex flex-col w-52 h-screen sticky top-0 bg-dark-1 border-r border-dark-5/50">
      {/* Header */}
      <div className="h-14 px-4 flex items-center">
        <h2 className="text-sm font-medium text-content-1">{moduleItem?.label || 'Explorar'}</h2>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-4">
            <p className="px-2 mb-1.5 text-2xs font-semibold text-content-3 uppercase tracking-widest">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const itemPath = `/${activeModule}/${item.slug || ''}`;
                const isActive = pathname?.includes(item.slug || '') && item.slug;
                return (
                  <Link
                    key={item.slug || item.label}
                    href={itemPath}
                    className={`
                      flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm
                      transition-all duration-150 ease-smooth
                      ${isActive
                        ? isDevMode
                          ? 'bg-dev-subtle text-dev-400'
                          : 'bg-accent-subtle text-accent-500'
                        : 'text-content-2 hover:text-content-1 hover:bg-dark-3/50'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

// ============================================
// MOBILE SIDEBAR
// ============================================

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: string;
  onModuleSelect: (moduleId: string) => void;
  contentMode: ContentMode;
  onToggleContentMode: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  activeModule,
  onModuleSelect,
  contentMode,
  onToggleContentMode
}) => {
  const router = useRouter();
  const { state, actions } = useAppStore();
  const { user } = state;
  const isDevMode = contentMode === 'dev';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    actions.setUser(null);
    onClose();
    router.push('/');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <aside className="absolute inset-y-0 left-0 w-72 bg-dark-1 overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-dark-5/50">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <span className="text-md font-semibold">Latam<span style={{ color: isDevMode ? '#60A5FA' : '#F59E0B', position: 'relative', top: '1px' }}>Creativa</span></span>
          </Link>
          <button onClick={onClose} className="p-1.5 text-content-3 hover:text-content-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User */}
        {user && (
          <div className="p-4 border-b border-dark-5/50">
            <div className="flex items-center gap-3">
              <Image
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=FF4D00&color=fff&size=80`}
                alt=""
                width={40}
                height={40}
                className="rounded-full"
                unoptimized
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-content-1 truncate">{user.name}</p>
                <p className="text-xs text-content-3 truncate">@{user.username || 'usuario'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mode toggle */}
        <div className="p-3 border-b border-dark-5/50">
          <button
            onClick={onToggleContentMode}
            className={`
              w-full py-2.5 flex items-center justify-center gap-2 rounded-lg text-sm font-medium
              transition-colors
              ${isDevMode ? 'bg-dev-subtle text-dev-400' : 'bg-accent-subtle text-accent-500'}
            `}
          >
            {isDevMode ? <Code className="w-4 h-4" /> : <Palette className="w-4 h-4" />}
            {isDevMode ? 'Modo Dev' : 'Modo Creativo'}
          </button>
        </div>

        {/* Modules */}
        <div className="p-3 border-b border-dark-5/50">
          <p className="px-2 mb-2 text-2xs font-semibold text-content-3 uppercase tracking-widest">Módulos</p>
          <div className="space-y-0.5">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onModuleSelect(item.id); onClose(); }}
                  className={`
                    w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-sm
                    transition-colors
                    ${isActive
                      ? isDevMode ? 'bg-dev-subtle text-dev-400' : 'bg-accent-subtle text-accent-500'
                      : 'text-content-2 hover:bg-dark-3/50 hover:text-content-1'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4" strokeWidth={1.5} />
                    {item.label}
                  </div>
                  <ChevronRight className="w-4 h-4 text-content-3" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-3">
          {user ? (
            <div className="space-y-0.5">
              <button onClick={() => { router.push(`/user/${user.username}`); onClose(); }} className="w-full flex items-center gap-2.5 px-2 py-2.5 text-sm text-content-2 hover:bg-dark-3/50 hover:text-content-1 rounded-lg transition-colors">
                <User className="w-4 h-4" /> Perfil
              </button>
              <button onClick={() => { router.push('/settings'); onClose(); }} className="w-full flex items-center gap-2.5 px-2 py-2.5 text-sm text-content-2 hover:bg-dark-3/50 hover:text-content-1 rounded-lg transition-colors">
                <Settings className="w-4 h-4" /> Configuración
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-2 py-2.5 text-sm text-danger hover:bg-dark-3/50 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/login" onClick={onClose} className="block w-full py-2.5 text-center text-sm text-content-2 border border-dark-5 rounded-lg hover:bg-dark-3/50 transition-colors">
                Entrar
              </Link>
              <Link href="/register" onClick={onClose} className={`block w-full py-2.5 text-center text-sm font-medium text-white rounded-lg transition-colors ${isDevMode ? 'bg-dev-500 hover:bg-dev-600' : 'bg-accent-500 hover:bg-accent-600'}`}>
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

const NavigationComponents = { PrimarySidebar, SecondarySidebar, MobileSidebar };
export default NavigationComponents;
