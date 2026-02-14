'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, Bell, Plus, Menu, X, User, Settings, LogOut,
  ChevronDown, Home, Compass
} from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { getSupabaseClient } from '@/lib/supabase/client';
import { MENU_GROUPS, BOTTOM_NAV_ITEMS, PRIMARY_NAV_ITEMS } from '@/data/navigation';

// ============================================
// MEGA MENU DROPDOWN
// ============================================

function MegaMenu({
  isOpen,
  onClose,
  isDevMode
}: {
  isOpen: boolean;
  onClose: () => void;
  isDevMode: boolean;
}) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full left-0 right-0 bg-dark-2 border-b border-dark-5 shadow-xl z-50 animate-slide-down"
      onMouseLeave={onClose}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-8">
          {MENU_GROUPS.map((group) => (
            <div key={group.id}>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${isDevMode ? 'text-dev-400' : 'text-accent-500'
                }`}>
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        group flex items-start gap-3 p-3 rounded-lg transition-all duration-200
                        ${isActive
                          ? isDevMode ? 'bg-dev-subtle' : 'bg-accent-subtle'
                          : 'hover:bg-dark-3/50'
                        }
                      `}
                    >
                      <div className={`
                        mt-0.5 p-2 rounded-lg transition-colors
                        ${isActive
                          ? isDevMode ? 'bg-dev-500/20 text-dev-400' : 'bg-accent-500/20 text-accent-500'
                          : 'bg-dark-4 text-content-3 group-hover:text-content-1'
                        }
                      `}>
                        <Icon className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isActive ? 'text-content-1' : 'text-content-2 group-hover:text-content-1'
                            }`}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-2xs font-medium bg-dark-4 text-content-3 rounded">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-content-3 mt-0.5 truncate">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MOBILE DRAWER
// ============================================

function MobileDrawer({
  isOpen,
  onClose,
  isDevMode
}: {
  isOpen: boolean;
  onClose: () => void;
  isDevMode: boolean;
}) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dark-0/80 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-dark-1 border-r border-dark-5 z-50 lg:hidden animate-slide-up overflow-y-auto">
        <div className="p-4 border-b border-dark-5 flex items-center justify-between">
          <span className="text-lg font-semibold">Latam<span style={{ color: isDevMode ? '#60A5FA' : '#F59E0B', position: 'relative', top: '1px' }}>Creativa</span></span>
          <button
            onClick={onClose}
            className="p-2 text-content-3 hover:text-content-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4">
          {/* Home */}
          <Link
            href="/"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-2 transition-colors ${pathname === '/'
              ? isDevMode ? 'bg-dev-subtle text-dev-400' : 'bg-accent-subtle text-accent-500'
              : 'text-content-2 hover:bg-dark-3/50 hover:text-content-1'
              }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Inicio</span>
          </Link>

          {/* Groups */}
          {MENU_GROUPS.map((group) => (
            <div key={group.id} className="mt-6">
              <h3 className={`px-3 text-xs font-semibold uppercase tracking-wider mb-2 ${isDevMode ? 'text-dev-400' : 'text-accent-500'
                }`}>
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                        ${isActive
                          ? isDevMode ? 'bg-dev-subtle text-dev-400' : 'bg-accent-subtle text-accent-500'
                          : 'text-content-2 hover:bg-dark-3/50 hover:text-content-1'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-2xs font-medium bg-dark-4 text-content-3 rounded">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}

// ============================================
// MAIN HEADER
// ============================================

interface HeaderProps {
  onMenuClick?: () => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, actions } = useAppStore();
  const { user, notifications, contentMode } = state;

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const createRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  const isDevMode = contentMode === 'dev';

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (createRef.current && !createRef.current.contains(e.target as Node)) setCreateOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    actions.setUser(null);
    setProfileOpen(false);
    router.push('/');
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className={`
        sticky top-0 z-40 h-14 
        bg-dark-1/95 backdrop-blur-md border-b border-dark-5/50
        transition-shadow duration-200
        ${scrolled ? 'shadow-lg' : ''}
      `}>
        <div className="h-full max-w-[1600px] mx-auto flex items-center justify-between px-4 lg:px-6">

          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 -ml-2 text-content-3 hover:text-content-1 transition-colors"
              aria-label="Menú"
            >
              <Menu className="w-5 h-5" />
            </button>


            <Link href="/" className="flex items-center">
              <span className="text-md font-semibold tracking-tight">Latam<span style={{ color: isDevMode ? '#60A5FA' : '#F59E0B', position: 'relative', top: '1px' }}>Creativa</span></span>
            </Link>
          </div>

          {/* Center - Search */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar proyectos, artículos, cursos..."
                className="w-full h-10 pl-10 pr-4 bg-dark-2 border border-dark-5 rounded-xl text-sm text-content-1 placeholder:text-content-3 focus:outline-none focus:border-dark-6 transition-colors"
              />
            </form>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2.5 text-content-3 hover:text-content-1 transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <button
                  className="relative p-2.5 text-content-3 hover:text-content-1 transition-colors"
                  aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className={`absolute top-1.5 right-1.5 min-w-[16px] h-4 flex items-center justify-center text-2xs font-bold text-white rounded-full px-1 ${isDevMode ? 'bg-dev-500' : 'bg-accent-500'}`}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Create */}
                <div ref={createRef} className="relative">
                  <button
                    onClick={() => setCreateOpen(!createOpen)}
                    className={`
                      ml-1 h-9 px-4 flex items-center gap-2 text-sm font-medium rounded-lg
                      transition-all duration-200 ease-smooth
                      ${isDevMode
                        ? 'bg-dev-500 text-white hover:bg-dev-600'
                        : 'bg-accent-500 text-white hover:bg-accent-600'
                      }
                    `}
                    aria-label="Crear"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2} />
                    <span className="hidden sm:inline">Crear</span>
                  </button>

                  {createOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 py-1.5 bg-dark-2 border border-dark-5 rounded-xl shadow-lg z-50 animate-scale-in">
                      <button
                        onClick={() => { router.push('/create/portfolio'); setCreateOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-content-2 hover:text-content-1 hover:bg-dark-3/50 transition-colors"
                      >
                        Nuevo proyecto
                      </button>
                      <button
                        onClick={() => { router.push('/create/article'); setCreateOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-content-2 hover:text-content-1 hover:bg-dark-3/50 transition-colors"
                      >
                        Nuevo artículo
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile */}
                <div ref={profileRef} className="relative ml-2">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-dark-5 hover:ring-dark-6 transition-all"
                    aria-label="Perfil"
                  >
                    <Image
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=FF4D00&color=fff&size=72`}
                      alt=""
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 py-1.5 bg-dark-2 border border-dark-5 rounded-xl shadow-lg z-50 animate-scale-in">
                      <div className="px-4 py-3 border-b border-dark-5">
                        <p className="text-sm font-medium text-content-1 truncate">{user.name}</p>
                        <p className="text-xs text-content-3 truncate">@{user.username || 'usuario'}</p>
                      </div>
                      <div className="py-1">
                        <button onClick={() => { router.push(`/user/${user.username}`); setProfileOpen(false); }} className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-content-2 hover:text-content-1 hover:bg-dark-3/50 transition-colors">
                          <User className="w-4 h-4" /> Perfil
                        </button>
                        <button onClick={() => { router.push('/settings'); setProfileOpen(false); }} className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-content-2 hover:text-content-1 hover:bg-dark-3/50 transition-colors">
                          <Settings className="w-4 h-4" /> Configuración
                        </button>
                      </div>
                      <div className="border-t border-dark-5 pt-1">
                        <button onClick={handleLogout} className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-danger hover:bg-dark-3/50 transition-colors">
                          <LogOut className="w-4 h-4" /> Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm text-content-2 hover:text-content-1 transition-colors">
                  Entrar
                </Link>
                <Link href="/register" className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isDevMode ? 'bg-dev-500 hover:bg-dev-600' : 'bg-accent-500 hover:bg-accent-600'}`}>
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mega Menu */}
        <MegaMenu
          isOpen={megaMenuOpen}
          onClose={() => setMegaMenuOpen(false)}
          isDevMode={isDevMode}
        />
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        isDevMode={isDevMode}
      />

      {/* Mobile search */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-dark-1 p-4 md:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(false)} className="p-2 text-content-3 hover:text-content-1 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <form onSubmit={handleSearch} className="flex-1">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full h-11 px-4 bg-dark-2 border border-dark-5 rounded-xl text-content-1 placeholder:text-content-3 focus:outline-none focus:border-dark-6"
              />
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
