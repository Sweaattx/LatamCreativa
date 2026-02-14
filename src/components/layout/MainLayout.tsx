'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PrimarySidebar, SecondarySidebar, MobileSidebar } from './Navigation';
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

  // Modules that should hide the secondary sidebar
  const hideSidebar = isLearningMode ||
    ['landing', 'home', 'settings', 'pro', 'search', 'collections', 'cart', 'people', 'community', 'events', 'profile'].includes(state.activeModule) ||
    state.activeModule.startsWith('earnings') ||
    state.activeModule.startsWith('info-') ||
    !!state.viewingAuthor;

  return (
    <div className="flex w-full h-screen overflow-hidden bg-dark-1 text-content-1 font-sans antialiased">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-black focus:rounded-lg focus:font-medium"
      >
        Saltar al contenido principal
      </a>

      {/* Primary Sidebar */}
      {!isLearningMode && (
        <PrimarySidebar
          activeModule={state.activeModule}
          onModuleSelect={handleModuleNavigation}
          contentMode={state.contentMode}
          onToggleContentMode={actions.toggleContentMode}
        />
      )}

      {/* Secondary Sidebar */}
      {!hideSidebar && (
        <SecondarySidebar
          activeModule={state.activeModule}
          contentMode={state.contentMode}
        />
      )}

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={state.isSidebarOpen}
        onClose={() => actions.setIsSidebarOpen(false)}
        activeModule={state.activeModule}
        onModuleSelect={handleModuleNavigation}
        contentMode={state.contentMode}
        onToggleContentMode={actions.toggleContentMode}
      />

      {/* Main Content */}
      <main id="main-content" className="relative flex min-w-0 flex-1 flex-col" role="main">
        {/* Header */}
        {!isLearningMode && (
          <Header
            onMenuClick={() => actions.setIsSidebarOpen(true)}
            onLoginClick={() => router.push('/login')}
            onRegisterClick={() => router.push('/register')}
          />
        )}

        {/* Page Content */}
        <div className="relative flex-1 overflow-hidden">
          <div
            ref={mainScrollRef}
            className={`h-full overflow-y-auto pb-20 md:pb-0`}
            style={{
              scrollBehavior: 'smooth',
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
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[110]">
          <div className={`
            px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 text-sm font-medium backdrop-blur-md border border-white/[0.06]
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
