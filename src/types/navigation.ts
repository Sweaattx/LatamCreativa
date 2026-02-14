// Navigation Types
import { LucideIcon } from 'lucide-react';

export interface NavItem {
    id: string;
    icon: LucideIcon;
    label?: string;
    active?: boolean;
    badge?: string;
    comingSoon?: boolean;
}

export interface NavSection {
    title: string;
    items: CategoryItem[];
}

export interface CategoryItem {
    icon: LucideIcon;
    label: string;
    subLabel?: string;
    slug?: string;        // URL slug para SEO-friendly routes
    active?: boolean;
    hasUpdate?: boolean;
    subItems?: string[];
}

export interface Chip {
    id: string;
    label: string;
    image?: string;
    active?: boolean;
}
