/**
 * API Route: File Upload
 * 
 * Endpoint para subir archivos al almacenamiento (R2 o Supabase Storage).
 * Recibe archivos via FormData y los sube al storage configurado.
 * 
 * POST /api/upload
 * 
 * FormData fields:
 * - file: File (required) - El archivo a subir
 * - path: string (required) - Ruta de destino en storage (ej: "avatars/user123.jpg")
 * - maxSizeMB: string (optional) - Tamaño máximo en MB (default: "10")
 * 
 * @module app/api/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Determinar qué storage usar
const STORAGE_PROVIDER = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'supabase';

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado. Inicia sesión para subir archivos.' },
                { status: 401 }
            );
        }

        // Parsear FormData
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const path = formData.get('path') as string | null;
        const maxSizeMB = parseInt(formData.get('maxSizeMB') as string || '10', 10);

        if (!file) {
            return NextResponse.json(
                { error: 'No se proporcionó ningún archivo.' },
                { status: 400 }
            );
        }

        if (!path) {
            return NextResponse.json(
                { error: 'No se proporcionó la ruta de destino.' },
                { status: 400 }
            );
        }

        // Validar tipo de archivo (solo imágenes)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `Tipo de archivo no permitido: ${file.type}. Solo se permiten imágenes.` },
                { status: 400 }
            );
        }

        // Validar tamaño
        if (file.size > maxSizeMB * 1024 * 1024) {
            return NextResponse.json(
                { error: `El archivo excede el límite de ${maxSizeMB}MB.` },
                { status: 400 }
            );
        }

        let publicUrl: string;

        if (STORAGE_PROVIDER === 'r2') {
            // Subir a Cloudflare R2
            const { r2StorageService } = await import('@/services/cloudflare/r2');

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            publicUrl = await r2StorageService.uploadFile(buffer, path, file.type, { maxSizeMB });
        } else {
            // Subir a Supabase Storage (comportamiento actual)
            const { data, error: uploadError } = await supabase.storage
                .from('public')
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: file.type,
                });

            if (uploadError) {
                console.error('Error subiendo a Supabase:', uploadError);
                return NextResponse.json(
                    { error: 'Error al subir el archivo.' },
                    { status: 500 }
                );
            }

            const { data: { publicUrl: url } } = supabase.storage
                .from('public')
                .getPublicUrl(data.path);

            publicUrl = url;
        }

        return NextResponse.json({ url: publicUrl }, { status: 200 });

    } catch (error) {
        console.error('Error en /api/upload:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor al subir el archivo.' },
            { status: 500 }
        );
    }
}

/**
 * Configuración para permitir archivos grandes
 */
export const config = {
    api: {
        bodyParser: false,
    },
};
