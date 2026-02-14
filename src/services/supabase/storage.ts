/**
 * Storage Service (Supabase)
 * 
 * Maneja subida, eliminación y compresión de archivos en Supabase Storage.
 * 
 * @module services/supabase/storage
 */
import { supabase } from '../../lib/supabase';
import imageCompression from 'browser-image-compression';

/**
 * Opciones para subida de imágenes
 */
interface UploadOptions {
    /** Tamaño máximo en MB */
    maxSizeMB?: number;
    /** Si se debe comprimir la imagen */
    compress?: boolean;
    /** Calidad de compresión (0-1) */
    quality?: number;
    /** Bucket de destino (default: 'public') */
    bucket?: string;
}

/**
 * Servicio de Storage para Supabase
 * 
 * Maneja subida, eliminación y compresión de archivos.
 * 
 * @module services/storage
 */
export const storageService = {
    /**
     * Elimina una imagen de Supabase Storage usando su path.
     * 
     * @param path - Path del archivo a eliminar
     * @param bucket - Nombre del bucket (default: 'public')
     * @returns true si la eliminación fue exitosa, false si no
     */
    deleteFromPath: async (path: string, bucket = 'public'): Promise<boolean> => {
        if (!path) return false;

        try {
            const { error } = await supabase.storage.from(bucket).remove([path]);
            if (error) {
                console.warn('No se pudo eliminar imagen:', error);
                return false;
            }
            return true;
        } catch (error) {
            console.warn('No se pudo eliminar imagen:', error);
            return false;
        }
    },

    /**
     * Elimina una imagen de Supabase Storage usando su URL pública.
     * 
     * @param url - URL pública del archivo a eliminar
     * @param bucket - Nombre del bucket (default: 'public')
     * @returns true si la eliminación fue exitosa, false si no
     */
    deleteFromUrl: async (url: string, bucket = 'public'): Promise<boolean> => {
        if (!url) return false;

        try {
            // Extraer el path de la URL de Supabase Storage
            // URL format: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
            if (!supabaseUrl || !url.includes(supabaseUrl)) {
                console.warn('URL no es de Supabase Storage:', url);
                return false;
            }

            const pathMatch = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
            if (!pathMatch || !pathMatch[1]) {
                console.warn('No se pudo extraer path de la URL:', url);
                return false;
            }

            const filePath = decodeURIComponent(pathMatch[1]);
            return await storageService.deleteFromPath(filePath, bucket);
        } catch (error) {
            console.warn('No se pudo eliminar imagen:', error);
            return false;
        }
    },

    /**
     * Sube una imagen a Supabase Storage con validación y compresión opcional.
     * 
     * @param file - Archivo a subir
     * @param path - Ruta en storage (sin bucket)
     * @param options - Configuración para la subida
     * @returns URL pública de descarga del archivo subido
     */
    uploadImage: async (file: File, path: string, options: UploadOptions = {}): Promise<string> => {
        const { maxSizeMB = 10, compress = true, quality = 0.8, bucket = 'public' } = options;

        let fileToUpload = file;

        // Comprimir imagen si es necesario
        if (compress && file.type.startsWith('image/')) {
            try {
                fileToUpload = await imageCompression(file, {
                    maxSizeMB: 2,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                    initialQuality: quality,
                });
            } catch (compressionError) {
                console.warn('No se pudo comprimir la imagen, se intentará subir el original:', compressionError);
            }
        }

        // Validar tamaño después de compresión
        if (fileToUpload.size > maxSizeMB * 1024 * 1024) {
            throw new Error(`El archivo excede el límite de ${maxSizeMB}MB incluso después de comprimir.`);
        }

        // Subir a Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, fileToUpload, {
                cacheControl: '3600',
                upsert: true,
                contentType: fileToUpload.type
            });

        if (error) {
            console.error('Error subiendo archivo:', error);
            throw error;
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return publicUrl;
    },

    /**
     * Sube múltiples archivos a Supabase Storage.
     * 
     * @param files - Array de archivos a subir
     * @param basePath - Ruta base en storage
     * @param options - Configuración para la subida
     * @returns Array de URLs públicas
     */
    uploadMultiple: async (
        files: File[],
        basePath: string,
        options: UploadOptions = {}
    ): Promise<string[]> => {
        const uploadPromises = files.map(async (file, index) => {
            const timestamp = Date.now();
            const extension = file.name.split('.').pop() || 'jpg';
            const path = `${basePath}/${timestamp}_${index}.${extension}`;
            return storageService.uploadImage(file, path, options);
        });

        return Promise.all(uploadPromises);
    },

    /**
     * Lista archivos en una carpeta de storage.
     * 
     * @param path - Ruta de la carpeta
     * @param bucket - Nombre del bucket
     * @returns Lista de archivos
     */
    listFiles: async (path: string, bucket = 'public') => {
        const { data, error } = await supabase.storage.from(bucket).list(path);
        if (error) throw error;
        return data;
    },

    /**
     * Elimina múltiples archivos de storage.
     * 
     * @param paths - Array de paths a eliminar
     * @param bucket - Nombre del bucket
     */
    deleteMultiple: async (paths: string[], bucket = 'public'): Promise<void> => {
        if (paths.length === 0) return;
        const { error } = await supabase.storage.from(bucket).remove(paths);
        if (error) {
            console.warn('Error eliminando archivos:', error);
        }
    },

    /**
     * Obtiene la URL pública de un archivo.
     * 
     * @param path - Path del archivo
     * @param bucket - Nombre del bucket
     * @returns URL pública
     */
    getPublicUrl: (path: string, bucket = 'public'): string => {
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
        return publicUrl;
    },

    /**
     * Genera una URL firmada (temporal) para acceso privado.
     * 
     * @param path - Path del archivo
     * @param bucket - Nombre del bucket
     * @param expiresIn - Segundos hasta expiración (default: 3600)
     * @returns URL firmada
     */
    getSignedUrl: async (path: string, bucket = 'public', expiresIn = 3600): Promise<string> => {
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);

        if (error) throw error;
        return data.signedUrl;
    }
};
