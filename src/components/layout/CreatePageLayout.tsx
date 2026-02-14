
import React, { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface CreatePageLayoutProps {
  title: string;
  onBack: () => void;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  actionColorClass?: string;
  isLoading?: boolean;
}

export const CreatePageLayout: React.FC<CreatePageLayoutProps> = ({
  title,
  onBack,
  actionLabel = 'Publicar',
  onAction,
  children,
  actionColorClass = 'bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90',
  isLoading = false
}) => {
  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in pb-20">
      {/* Navbar Overlay */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-[#0d0d0f]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.06] px-6 h-16 flex items-center justify-between transition-colors">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
        <button
          onClick={onAction}
          disabled={isLoading}
          className={`px-4 py-2 font-bold rounded-lg text-sm transition-all shadow-lg ${actionColorClass} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Publicando...' : actionLabel}
        </button>
      </div>

      <div className="p-6 md:p-10">
        {children}
      </div>
    </div>
  );
};
