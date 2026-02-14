/**
 * Servicio de Colecciones (Supabase)
 * 
 * @module services/supabase/collections
 */
import { supabase } from '../../lib/supabase';
import { CollectionItem } from '../../types';

interface DbCollection {
    id: string;
    user_id: string;
    title: string;
    is_private: boolean;
    item_count: number;
    thumbnails: string[] | null;
    created_at: string;
    updated_at: string;
}

const mapDbCollectionToCollection = (c: DbCollection): CollectionItem => ({
    id: c.id,
    title: c.title,
    isPrivate: c.is_private,
    itemCount: c.item_count,
    thumbnails: c.thumbnails || [],
    items: []
});

export const collectionsService = {
    /**
     * Obtiene las colecciones de un usuario.
     */
    getUserCollections: async (userId: string): Promise<CollectionItem[]> => {
        try {
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return ((data || []) as unknown as DbCollection[]).map(mapDbCollectionToCollection);
        } catch (error) {
            console.error("Error fetching collections:", error);
            return [];
        }
    },

    /**
     * Crea una nueva colección.
     */
    createCollection: async (
        userId: string,
        title: string,
        isPrivate = false
    ): Promise<CollectionItem | null> => {
        try {
            const { data, error } = await supabase
                .from('collections')
                .insert({
                    user_id: userId,
                    title,
                    is_private: isPrivate,
                    item_count: 0,
                    thumbnails: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                } as never)
                .select()
                .single();

            if (error) throw error;
            return data ? mapDbCollectionToCollection(data as unknown as DbCollection) : null;
        } catch (error) {
            console.error("Error creating collection:", error);
            throw error;
        }
    },

    /**
     * Elimina una colección.
     */
    deleteCollection: async (userId: string, collectionId: string): Promise<void> => {
        try {
            // Delete collection items first
            await supabase
                .from('collection_items')
                .delete()
                .eq('collection_id', collectionId);

            const { error } = await supabase
                .from('collections')
                .delete()
                .eq('id', collectionId)
                .eq('user_id', userId);

            if (error) throw error;
        } catch (error) {
            console.error("Error deleting collection:", error);
            throw error;
        }
    },

    /**
     * Añade un item a una colección.
     */
    addToCollection: async (
        userId: string,
        collectionId: string,
        item: { id: string; type: string; image?: string }
    ): Promise<void> => {
        try {
            // Check if already in collection
            const { data: existing } = await supabase
                .from('collection_items')
                .select('id')
                .eq('collection_id', collectionId)
                .eq('item_id', item.id)
                .maybeSingle();

            if (existing) return;

            // Add item
            const { error: insertError } = await supabase
                .from('collection_items')
                .insert({
                    collection_id: collectionId,
                    item_id: item.id,
                    item_type: item.type,
                    added_at: new Date().toISOString()
                } as never);

            if (insertError) throw insertError;

            // Update collection metadata
            const { data: collection } = await supabase
                .from('collections')
                .select('item_count, thumbnails')
                .eq('id', collectionId)
                .single();

            if (collection) {
                const c = collection as unknown as { item_count: number; thumbnails: string[] | null };
                const newThumbnails = item.image
                    ? [item.image, ...(c.thumbnails || []).slice(0, 3)]
                    : c.thumbnails;

                await supabase
                    .from('collections')
                    .update({
                        item_count: (c.item_count || 0) + 1,
                        thumbnails: newThumbnails,
                        updated_at: new Date().toISOString()
                    } as never)
                    .eq('id', collectionId);
            }
        } catch (error) {
            console.error("Error adding to collection:", error);
            throw error;
        }
    },

    /**
     * Elimina un item de una colección.
     */
    removeFromCollection: async (
        userId: string,
        collectionId: string,
        itemId: string
    ): Promise<void> => {
        try {
            const { error } = await supabase
                .from('collection_items')
                .delete()
                .eq('collection_id', collectionId)
                .eq('item_id', itemId);

            if (error) throw error;

            // Update collection item count
            await supabase.rpc('decrement_collection_items', { collection_id: collectionId } as never);
        } catch (error) {
            console.error("Error removing from collection:", error);
            throw error;
        }
    },

    /**
     * Obtiene los items de una colección.
     */
    getCollectionItems: async (collectionId: string) => {
        try {
            const { data, error } = await supabase
                .from('collection_items')
                .select('*')
                .eq('collection_id', collectionId)
                .order('added_at', { ascending: false });

            if (error) throw error;

            return ((data || []) as unknown as { item_id: string; item_type: string; added_at: string }[]).map(i => ({
                id: i.item_id,
                type: i.item_type,
                addedAt: i.added_at
            }));
        } catch (error) {
            console.error("Error fetching collection items:", error);
            return [];
        }
    },

    /**
     * Verifica si un item está en alguna colección del usuario.
     */
    isItemInAnyCollection: async (userId: string, itemId: string): Promise<boolean> => {
        try {
            const { data: collections } = await supabase
                .from('collections')
                .select('id')
                .eq('user_id', userId);

            if (!collections || collections.length === 0) return false;

            const collectionIds = (collections as unknown as { id: string }[]).map(c => c.id);

            const { data, error } = await supabase
                .from('collection_items')
                .select('id')
                .in('collection_id', collectionIds)
                .eq('item_id', itemId)
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            return data !== null;
        } catch (error) {
            console.error("Error checking item in collections:", error);
            return false;
        }
    },

    /**
     * Actualiza una colección.
     */
    updateCollection: async (
        userId: string,
        collectionId: string,
        updates: { title?: string; isPrivate?: boolean }
    ): Promise<void> => {
        try {
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString()
            };

            if (updates.title !== undefined) updateData.title = updates.title;
            if (updates.isPrivate !== undefined) updateData.is_private = updates.isPrivate;

            const { error } = await supabase
                .from('collections')
                .update(updateData as never)
                .eq('id', collectionId)
                .eq('user_id', userId);

            if (error) throw error;
        } catch (error) {
            console.error("Error updating collection:", error);
            throw error;
        }
    }
};
