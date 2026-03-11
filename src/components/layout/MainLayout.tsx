'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileTabBar } from './MobileTabBar';
import { SaveToCollectionModal } from '../modals/SaveToCollectionModal';
import { ShareModal } from '../modals/ShareModal';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { state, actions } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Store actions in refs to avoid dependency issues
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  // Sync URL with state
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo(0, 0);
    }

    const path = pathname || '/';
    if (path === '/') {
      if (state.activeModule !== 'home') actionsRef.current.handleModuleSelect('home');
    } else {
      const moduleName = path.split('/')[1];
      if (moduleName && state.activeModule !== moduleName) {
        actionsRef.current.handleModuleSelect(moduleName);
      }
    }
  }, [pathname, state.activeModule]);

  // Notifications - use stable callback
  const userId = state.user?.id;
  useEffect(() => {
    if (userId) {
      actionsRef.current.subscribeToNotifications(userId);
    }
    return () => {
      actionsRef.current.cleanupNotifications();
    };
  }, [userId]);

  const isLearningMode = state.activeModule === 'learning';

  const handleModuleNavigation = (moduleId: string) => {
    actions.handleModuleSelect(moduleId);
    if (moduleId === 'home') router.push('/');
    else if (moduleId === 'learning') router.push('/education');
    else router.push(`/${moduleId}`);
  };


  const isDevMode = state.contentMode === 'dev';

  return (
    <div className="flex w-full h-screen max-w-[100vw] overflow-x-hidden bg-dark-1 text-content-1 font-sans antialiased">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-black focus:rounded-lg focus:font-medium"
      >
        Saltar al contenido principal
      </a>

      {/* Fixed Logo — top-left corner */}
      <Link
        href="/"
        className="fixed top-0 left-3 z-50 p-2"
        aria-label="Inicio"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 43.02 61.5"
          className="w-6 h-8 hover:scale-110 transition-transform duration-200"
          aria-hidden="true"
        >
          <path
            d="M1.51,50.24c-.36.2-.78.16-1.02.02s-.49-.51-.49-.92V10.19c0-.46.19-.83.56-1.03L16.45.08c.25-.15.76-.08.96.05s.45.5.45.89l.06,39.15c0,.49-.21.87-.61,1.1L1.51,50.24Z"
            fill="#fff"
          />
          <path
            d="M13.42,61.32c-.51.28-.93.2-1.32-.04L.9,54.36c-.23-.14-.44-.55-.44-.77,0-.3.19-.61.47-.87l28.57-16.33c.44-.25.87-.25,1.3,0l11.73,6.97c.27.16.49.57.49.81,0,.35-.2.65-.53.9l-29.08,16.24Z"
            fill={isDevMode ? '#60A5FA' : '#F59E0B'}
          />
        </svg>
      </Link>


      {/* Main Content */}
      <main id="main-content" className="relative flex min-w-0 flex-1 flex-col" role="main">
        {/* Header */}
        {!isLearningMode && (
          <Header />
        )}

        {/* Page Content */}
        <div className="relative flex-1 overflow-hidden">
          <div
            ref={mainScrollRef}
            data-scroll-container=""
            className={`h-full overflow-y-auto overflow-x-hidden pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0`}
            style={{
              scrollBehavior: 'auto',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onScroll={(e) => {
              const el = e.currentTarget;
              const track = el.parentElement?.querySelector('[data-scrollbar-thumb]') as HTMLElement;
              if (track && el.scrollHeight > el.clientHeight) {
                const ratio = el.scrollTop / (el.scrollHeight - el.clientHeight);
                const thumbHeight = Math.max(30, (el.clientHeight / el.scrollHeight) * el.clientHeight);
                track.style.height = `${thumbHeight}px`;
                track.style.top = `${ratio * (el.clientHeight - thumbHeight)}px`;
                track.style.opacity = '1';
              }
            }}
          >
            <div className="flex flex-col min-h-full">
              <div className="flex-1">
                {children}
              </div>
              {!isLearningMode && (
                <Footer />
              )}
            </div>
          </div>
          {/* Custom scrollbar thumb */}
          <div
            data-scrollbar-thumb=""
            className="absolute right-0.5 w-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors pointer-events-none"
            style={{ top: 0, height: 30, opacity: 0 }}
          />
          {/* Hide native scrollbar */}
          <style>{`
            [data-scrollbar-thumb] { z-index: 50; }
            div::-webkit-scrollbar { display: none !important; width: 0 !important; }
          `}</style>
        </div>
      </main>

      {/* Mobile Tab Bar */}
      {!isLearningMode && (
        <MobileTabBar />
      )}

      {/* Modals */}
      <SaveToCollectionModal
        isOpen={state.isSaveModalOpen}
        onClose={actions.closeSaveModal}
        itemId={state.itemToSave?.id || ''}
        itemType={state.itemToSave?.type === 'article' ? 'article' : 'project'}
        userId={state.user?.id || ''}
      />

      <ShareModal
        isOpen={state.isShareModalOpen}
        onClose={actions.closeShareModal}
      />

      {/* Toast */}
      {state.toast && (
        <div className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom,0px))] md:bottom-8 left-1/2 -translate-x-1/2 z-[110]">
          <div className={`
            px-5 py-3 rounded-full flex items-center gap-3 text-sm font-medium backdrop-blur-md border border-white/[0.06]
            ${state.toast.type === 'success' ? 'bg-[#161616] text-white' : ''}
            ${state.toast.type === 'error' ? 'bg-red-950/90 text-red-200' : ''}
            ${state.toast.type === 'info' ? 'bg-[#161616] text-white' : ''}
          `}>
            {state.toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {state.toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
            {state.toast.type === 'info' && <Info className="w-4 h-4 text-white/60" />}
            {state.toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
