/**
 * Cloudflare R2 Storage Service
 * 
 * Servicio de almacenamiento usando Cloudflare R2 (compatible con S3).
 * Expone la misma interfaz que storageService de Supabase para intercambiabilidad.
 * 
 * @module services/cloudflare/r2
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

/**
 * Opciones para subida de imágenes a R2
 */
interface R2UploadOptions {
    /** Tamaño máximo en MB */
    maxSizeMB?: number;
    /** Bucket de destino (se usa el default del env) */
    bucket?: string;
}

/**
 * Crea un cliente S3 configurado para Cloudflare R2
 */
function createR2Client(): S3Client {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
        throw new Error('Faltan credenciales de R2. Configura R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, y R2_SECRET_ACCESS_KEY');
    }

    return new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
}

/**
 * Obtiene el nombre del bucket desde las variables de entorno
 */
function getBucketName(): string {
    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) {
        throw new Error('Falta R2_BUCKET_NAME en las variables de entorno');
    }
    return bucket;
}

/**
 * Obtiene la URL pública base del bucket R2
 */
function getPublicBaseUrl(): string {
    const url = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    if (!url) {
        throw new Error('Falta NEXT_PUBLIC_R2_PUBLIC_URL en las variables de entorno');
    }
    // Eliminar slash final si existe
    return url.replace(/\/$/, '');
}

/**
 * Servicio de Storage para Cloudflare R2
 */
export const r2StorageService = {
    /**
     * Sube un archivo a R2.
     * NOTA: Esto debe ejecutarse en el servidor (API Route), NO en el cliente.
     * 
     * @param fileBuffer - Buffer del archivo
     * @param path - Ruta en storage
     * @param contentType - MIME type del archivo
     * @param options - Configuración para la subida
     * @returns URL pública del archivo subido
     */
    uploadFile: async (
        fileBuffer: Buffer | Uint8Array,
        path: string,
        contentType: string,
        options: R2UploadOptions = {}
    ): Promise<string> => {
        const { maxSizeMB = 10 } = options;
        const client = createR2Client();
        const bucket = getBucketName();

        // Validar tamaño
        if (fileBuffer.byteLength > maxSizeMB * 1024 * 1024) {
            throw new Error(`El archivo excede el límite de ${maxSizeMB}MB.`);
        }

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: path,
            Body: fileBuffer,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000',
        });

        await client.send(command);

        return `${getPublicBaseUrl()}/${path}`;
    },

    /**
     * Elimina un archivo de R2 usando su path.
     * 
     * @param path - Path del archivo a eliminar
     * @returns true si la eliminación fue exitosa
     */
    deleteFromPath: async (path: string): Promise<boolean> => {
        if (!path) return false;

        try {
            const client = createR2Client();
            const bucket = getBucketName();

            const command = new DeleteObjectCommand({
                Bucket: bucket,
                Key: path,
            });

            await client.send(command);
            return true;
        } catch (error) {
            console.warn('No se pudo eliminar archivo de R2:', error);
            return false;
        }
    },

    /**
     * Elimina un archivo de R2 usando su URL pública.
     * 
     * @param url - URL pública del archivo
     * @returns true si la eliminación fue exitosa
     */
    deleteFromUrl: async (url: string): Promise<boolean> => {
        if (!url) return false;

        try {
            const baseUrl = getPublicBaseUrl();
            if (!url.startsWith(baseUrl)) {
                console.warn('URL no es de R2:', url);
                return false;
            }

            const path = url.replace(`${baseUrl}/`, '');
            return await r2StorageService.deleteFromPath(path);
        } catch (error) {
            console.warn('No se pudo eliminar archivo de R2:', error);
            return false;
        }
    },

    /**
     * Elimina múltiples archivos de R2.
     * 
     * @param paths - Array de paths a eliminar
     */
    deleteMultiple: async (paths: string[]): Promise<void> => {
        if (paths.length === 0) return;

        try {
            const client = createR2Client();
            const bucket = getBucketName();

            const command = new DeleteObjectsCommand({
                Bucket: bucket,
                Delete: {
                    Objects: paths.map(path => ({ Key: path })),
                },
            });

            await client.send(command);
        } catch (error) {
            console.warn('Error eliminando archivos de R2:', error);
        }
    },

    /**
     * Lista archivos en una carpeta de R2.
     * 
     * @param prefix - Prefijo/carpeta para listar
     * @returns Lista de archivos
     */
    listFiles: async (prefix: string) => {
        const client = createR2Client();
        const bucket = getBucketName();

        const command = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix,
        });

        const response = await client.send(command);
        return response.Contents || [];
    },

    /**
     * Obtiene la URL pública de un archivo.
     * 
     * @param path - Path del archivo
     * @returns URL pública
     */
    getPublicUrl: (path: string): string => {
        return `${getPublicBaseUrl()}/${path}`;
    },
};
