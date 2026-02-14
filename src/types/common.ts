// Common Types - Shared across domains
type ItemType = 'project' | 'article' | 'portfolio' | 'course' | 'asset' | 'service' | 'job' | 'event' | 'forum' | 'collection';

export interface SavedItemReference {
    id: string;
    type: ItemType;
    addedAt: string;
}

export interface CollectionItem {
    id: string;
    title: string;
    itemCount: number;
    thumbnails: string[];
    isPrivate: boolean;
    items?: SavedItemReference[];
    createdAt?: string;
}
