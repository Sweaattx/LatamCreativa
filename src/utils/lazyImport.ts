import React, { ComponentType, LazyExoticComponent } from 'react';

/**
 * Wrapper para React.lazy que recarga la página una vez si el import falla.
 * Útil para manejar errores "ChunkLoadError" o "Failed to fetch dynamically imported module"
 * que ocurren cuando se despliega una nueva versión y los chunks antiguos ya no están disponibles.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lazyImport = <T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> => {
    return React.lazy(async () => {
        try {
            return await factory();
        } catch (error: unknown) {
            const pageHasAlreadyBeenForceRefreshed = JSON.parse(
                window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
            );

            if (!pageHasAlreadyBeenForceRefreshed) {
                // Marcar que estamos forzando un refresh para no hacerlo infinitamente
                window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
                window.location.reload();

                // Retornar una promesa que nunca resuelve (ya que estamos recargando) para evitar que React lance el error inmediatamente
                return new Promise(() => { });
            }

            // Si ya recargamos y aún falla, lanzar el error
            throw error;
        }
    });
};
