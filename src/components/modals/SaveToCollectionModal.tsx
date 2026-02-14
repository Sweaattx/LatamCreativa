import React, { useState, useEffect } from 'react';
import { X, Plus, FolderPlus, Loader2, Check } from 'lucide-react';
import { collectionsService } from '../../services/supabase/collections';
import { CollectionItem } from '../../types';

// Use CollectionItem from types, mapping 'title' to display name

interface SaveToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemType: 'project' | 'article';
  userId: string;
}

export const SaveToCollectionModal: React.FC<SaveToCollectionModalProps> = ({
  isOpen,
  onClose,
  itemId,
  itemType,
  userId,
}) => {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [savedTo, setSavedTo] = useState<string[]>([]);

  useEffect(() => {
    const loadCollections = async () => {
      setLoading(true);
      try {
        const data = await collectionsService.getUserCollections(userId);
        setCollections(data || []);
      } catch (error) {
        console.error('Error loading collections:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && userId) {
      loadCollections();
    }
  }, [isOpen, userId]);

  const handleSaveToCollection = async (collectionId: string) => {
    setSaving(collectionId);
    try {
      await collectionsService.addToCollection(userId, collectionId, { id: itemId, type: itemType });
      setSavedTo((prev) => [...prev, collectionId]);
    } catch (error) {
      console.error('Error saving to collection:', error);
    } finally {
      setSaving(null);
    }
  };

  const handleCreateCollection = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const newCollection = await collectionsService.createCollection(newName, userId, false);
      if (newCollection) {
        setCollections((prev) => [...prev, newCollection]);
        setNewName('');
        setShowCreate(false);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h3 className="font-semibold text-white">Guardar en colección</h3>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-neutral-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {/* Collections List */}
              {collections.length > 0 ? (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {collections.map((collection) => {
                    const isSaved = savedTo.includes(collection.id);
                    const isSaving = saving === collection.id;
                    return (
                      <button
                        key={collection.id}
                        onClick={() => !isSaved && handleSaveToCollection(collection.id)}
                        disabled={isSaved || isSaving}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          isSaved
                            ? 'bg-green-500/10 border border-green-500/20'
                            : 'bg-neutral-800/50 hover:bg-neutral-800 border border-transparent'
                        }`}
                      >
                        <span className="text-sm text-white">{collection.title}</span>
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 text-neutral-500 animate-spin" />
                        ) : isSaved ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Plus className="w-4 h-4 text-neutral-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm text-neutral-500">No tienes colecciones aún</p>
                </div>
              )}

              {/* Create New */}
              {showCreate ? (
                <div className="pt-2 space-y-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre de la colección"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCreate(false)}
                      className="flex-1 px-3 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateCollection}
                      disabled={!newName.trim() || creating}
                      className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                      Crear
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreate(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-neutral-700 rounded-lg text-sm text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                >
                  <FolderPlus className="w-4 h-4" />
                  Nueva colección
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
