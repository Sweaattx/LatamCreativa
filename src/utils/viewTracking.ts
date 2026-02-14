/**
 * Utilidad de Tracking de Vistas
 * 
 * Previene la inflación del conteo de vistas rastreando items vistos en localStorage.
 * Las vistas solo se cuentan una vez cada 24 horas por item.
 * 
 * @module utils/viewTracking
 */

const VIEW_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas

interface ViewRecord {
    timestamp: number;
}

/**
 * Verifica si un item debe contar como vista nueva.
 * 
 * @param type - Tipo de item ('project' | 'profile' | 'article')
 * @param id - Identificador único del item
 * @returns true si es una vista nueva que debe contarse
 */
export const shouldCountView = (type: 'project' | 'profile' | 'article', id: string): boolean => {
    if (!id) return false;

    const key = `view_${type}_${id}`;
    const now = Date.now();

    try {
        const stored = localStorage.getItem(key);

        if (stored) {
            const record: ViewRecord = JSON.parse(stored);
            const timeSinceLastView = now - record.timestamp;

            // Si se vio dentro del período de expiración, no contar de nuevo
            if (timeSinceLastView < VIEW_EXPIRY_MS) {
                return false;
            }
        }

        // Registrar esta vista
        const newRecord: ViewRecord = { timestamp: now };
        localStorage.setItem(key, JSON.stringify(newRecord));
        return true;

    } catch (error) {
        // Si localStorage falla, aún contar la vista (fail open)
        console.warn('Error de localStorage en view tracking:', error);
        return true;
    }
};

/**
 * Limpia registros de vistas antiguos del localStorage.
 * Llamar periódicamente para prevenir que localStorage crezca demasiado.
 */
export const cleanupOldViewRecords = (): void => {
    try {
        const now = Date.now();
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('view_')) {
                const stored = localStorage.getItem(key);
                if (stored) {
                    try {
                        const record: ViewRecord = JSON.parse(stored);
                        if (now - record.timestamp > VIEW_EXPIRY_MS * 7) { // Clean up after 7 days
                            keysToRemove.push(key);
                        }
                    } catch {
                        keysToRemove.push(key); // Remove corrupted records
                    }
                }
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
        console.warn('View tracking cleanup error:', error);
    }
};
