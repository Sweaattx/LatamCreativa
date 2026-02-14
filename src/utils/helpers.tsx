import React from 'react';

export const timeAgo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return "hace " + Math.floor(interval) + " años";
    interval = seconds / 2592000;
    if (interval > 1) return "hace " + Math.floor(interval) + " meses";
    interval = seconds / 86400;
    if (interval > 1) return "hace " + Math.floor(interval) + " días";
    interval = seconds / 3600;
    if (interval > 1) return "hace " + Math.floor(interval) + " horas";
    interval = seconds / 60;
    if (interval > 1) return "hace " + Math.floor(interval) + " min";
    return "hace un momento";
};

export const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Extrae el ID del modelo de una URL de Sketchfab.
 * Soporta formatos:
 * - https://sketchfab.com/3d-models/model-name-{MODEL_ID}
 * - https://sketchfab.com/models/{MODEL_ID}
 * - https://sketchfab.com/models/{MODEL_ID}/embed
 */
export const getSketchfabModelId = (url: string): string | null => {
    if (!url) return null;

    // Pattern: Extract the ID from common Sketchfab URL formats
    // IDs can be alphanumeric (both 32-char hex and shorter base62-like IDs)
    // Note: .*- is greedy, so it captures everything up to the LAST hyphen before the ID
    const pattern = /sketchfab\.com\/(?:3d-models\/.*-|models\/)([a-zA-Z0-9]+)/i;
    const match = url.match(pattern);
    if (match && match[1]) return match[1];

    return null;
};

export const renderDescriptionWithLinks = (text: string) => {
    const urlRegex = /((?:https?:\/\/|www\.)[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
        if (part.match(urlRegex)) {
            const href = part.startsWith('www.') ? `https://${part}` : part;
            return (
                <a
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500 hover:underline break-all"
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};

/**
 * Extrae el mensaje de un error de tipo unknown de forma type-safe.
 * Útil para catch blocks con `catch (err: unknown)`.
 * 
 * @param error - El error capturado (tipo unknown)
 * @param fallback - Mensaje a devolver si no se puede extraer uno (default: 'Error desconocido')
 * @returns El mensaje del error o el fallback
 */
export const getErrorMessage = (error: unknown, fallback = 'Error desconocido'): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as { message: unknown }).message);
    }
    return fallback;
};

/**
 * Mapea errores de autenticación a mensajes amigables en español.
 * Compatible con errores de Supabase Auth.
 * 
 * @param error - El error capturado (tipo unknown)
 * @param fallback - Mensaje por defecto
 * @returns Mensaje de error traducido
 */
export const getAuthError = (error: unknown, fallback = 'Ocurrió un error al autenticar.'): string => {
    if (typeof error === 'object' && error !== null) {
        // Handle Supabase error format
        if ('message' in error) {
            const message = String((error as { message: string }).message).toLowerCase();
            const errorMessages: Record<string, string> = {
                'invalid login credentials': 'Credenciales inválidas.',
                'email not confirmed': 'Debes confirmar tu email antes de iniciar sesión.',
                'user not found': 'No existe una cuenta con este correo.',
                'invalid email': 'El correo electrónico no es válido.',
                'email already registered': 'Este correo ya está registrado.',
                'password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
                'rate limit exceeded': 'Demasiados intentos. Intenta de nuevo más tarde.',
                'network error': 'Error de conexión. Verifica tu internet.',
            };
            for (const [key, value] of Object.entries(errorMessages)) {
                if (message.includes(key)) return value;
            }
        }
        // Legacy error code support
        if ('code' in error) {
            const code = (error as { code: string }).code;
            const errorMessages: Record<string, string> = {
                'auth/invalid-email': 'El correo electrónico no es válido.',
                'auth/user-not-found': 'No existe una cuenta con este correo.',
                'auth/wrong-password': 'Contraseña incorrecta.',
                'auth/email-already-in-use': 'Este correo ya está registrado.',
                'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
                'auth/too-many-requests': 'Demasiados intentos. Intenta de nuevo más tarde.',
                'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
                'auth/popup-closed-by-user': 'Inicio de sesión cancelado.',
                'auth/invalid-credential': 'Credenciales inválidas.'
            };
            return errorMessages[code] || fallback;
        }
    }
    return getErrorMessage(error, fallback);
};


