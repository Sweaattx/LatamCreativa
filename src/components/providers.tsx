'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, type ReactNode } from 'react';
import { AuthListener } from './auth/AuthListener';
import { appStoreApi } from '@/hooks/useAppStore';

interface ProvidersProps {
  children: ReactNode;
}

function ContentModeHydrator() {
  useEffect(() => {
    // Sync data-mode attribute with the current store value (including persist rehydration)
    const syncDataMode = (mode: string) => {
      if (mode === 'dev') {
        document.documentElement.setAttribute('data-mode', 'dev');
      } else {
        document.documentElement.removeAttribute('data-mode');
      }
    };

    // Sync on mount (covers persist middleware rehydration)
    syncDataMode(appStoreApi.getState().contentMode);

    // Subscribe to future changes
    const unsub = appStoreApi.subscribe((state) => {
      syncDataMode(state.contentMode);
    });

    return unsub;
  }, []);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Con SSR, queremos un staleTime más alto para evitar
            // refetch inmediato en el cliente
            staleTime: 60 * 1000, // 1 minuto
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthListener />
      <ContentModeHydrator />
      {children}
    </QueryClientProvider>
  );
}
