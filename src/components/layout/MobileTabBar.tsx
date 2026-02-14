'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, BookOpen, MessageSquare, User } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

const navItems = [
  { id: 'home', label: 'Inicio', icon: Home, path: '/' },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase, path: '/portfolio' },
  { id: 'blog', label: 'Blog', icon: BookOpen, path: '/blog' },
  { id: 'forum', label: 'Foro', icon: MessageSquare, path: '/forum' },
  { id: 'profile', label: 'Perfil', icon: User, path: '/settings' },
];

export const MobileTabBar: React.FC = () => {
  const pathname = usePathname();
  const { state } = useAppStore();

  const getProfilePath = () => {
    if (state.user) {
      return `/user/${state.user.username || state.user.id}`;
    }
    return '/login';
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-dark-0/95 backdrop-blur-xl border-t border-dark-5/30 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const path = item.id === 'profile' ? getProfilePath() : item.path;
          const isActive = item.id === 'home'
            ? pathname === '/'
            : pathname?.startsWith(item.path);

          return (
            <Link
              key={item.id}
              href={path}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${isActive ? 'text-accent-500' : 'text-content-3'
                }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-500" />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabBar;
