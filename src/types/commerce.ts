// Commerce Types - Courses, Assets, Services, Sales

export interface CourseItem {
    id: string;
    title: string;
    instructor: string;
    instructorAvatar: string;
    thumbnail: string;
    rating: number;
    reviewCount: number;
    students: number;
    price: number;
    originalPrice?: number;
    duration: string;
    lectures: number;
    level: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Todos los niveles';
    bestseller?: boolean;
    category: string;
    updatedDate: string;
    domain?: 'creative' | 'dev';
}

export interface AssetItem {
    id: string;
    title: string;
    creator: string;
    creatorAvatar: string;
    thumbnail: string;
    images: string[];
    price: number;
    rating: number;
    reviewCount: number;
    category: string;
    formats: string[];
    fileSize: string;
    license: 'Standard' | 'Editorial';
    likes: number;
    description: string;
    technicalSpecs?: {
        vertices?: string;
        polygons?: string;
        textures?: boolean;
        materials?: boolean;
        rigged?: boolean;
        animated?: boolean;
        uvMapped?: boolean;
    };
    domain?: 'creative' | 'dev';
}

export interface FreelanceServiceItem {
    id: string;
    title: string;
    seller: string;
    sellerAvatar: string;
    sellerLevel: 'Nuevo' | 'Nivel 1' | 'Nivel 2' | 'Top Rated';
    thumbnail: string;
    images: string[];
    startingPrice: number;
    rating: number;
    reviewCount: number;
    category: string;
    deliveryTime: string;
    description: string;
    packages: {
        basic: { price: number; title: string; desc: string; delivery: string; revisions: number };
        standard: { price: number; title: string; desc: string; delivery: string; revisions: number };
        premium: { price: number; title: string; desc: string; delivery: string; revisions: number };
    };
    domain?: 'creative' | 'dev';
}

export interface MembershipTier {
    id: string;
    name: string;
    price: number;
    description: string;
    color: string;
    perks: string[];
    recommended?: boolean;
}

export interface CartItem {
    id: string;
    title: string;
    price: number;
    thumbnail: string;
    type: 'course' | 'asset' | 'service';
}

export type SaleStatus = 'Active' | 'Paused' | 'Draft';

export interface SaleItem {
    id: string;
    title: string;
    image: string;
    dateCreated: string;
    price: number;
    salesCount: number;
    totalRevenue: number;
    status: SaleStatus;
    rating: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
    key: keyof SaleItem;
    direction: SortDirection;
}
