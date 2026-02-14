import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from './useAppStore';
import { usersService } from '../services/supabase/users';
import { storageService } from '../services/supabase/storage';
import { User, ExperienceItem, EducationItem, SocialLinks } from '../types';
import { COMMON_ROLES } from '../data/roles';

interface EditProfileState {
    firstName: string;
    lastName: string;
    username: string;
    role: string;
    country: string;
    city: string;
    bio: string;
    availableForWork: boolean;
}

interface ImageState {
    previewAvatar: string;
    previewCover: string;
    avatarFile: File | null;
    coverFile: File | null;
}

interface CollectionState {
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: string[];
    socialLinks: SocialLinks;
}

export const useEditProfile = (isOpen: boolean, onClose: () => void) => {
    const { state: { user }, actions: { showToast, setUser } } = useAppStore();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [usernameError, setUsernameError] = useState('');

    const [formData, setFormData] = useState<EditProfileState>({
        firstName: '',
        lastName: '',
        username: '',
        role: '',
        country: '',
        city: '',
        bio: '',
        availableForWork: false
    });

    const [collections, setCollections] = useState<CollectionState>({
        experience: [],
        education: [],
        skills: [],
        socialLinks: {}
    });

    const [images, setImages] = useState<ImageState>({
        previewAvatar: '',
        previewCover: '',
        avatarFile: null,
        coverFile: null
    });

    const [suggestions, setSuggestions] = useState({
        showRole: false,
        filteredRoles: COMMON_ROLES
    });

    // Reset and Load Data when modal opens
    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                firstName: user.firstName || user.name.split(' ')[0] || '',
                lastName: user.lastName || user.name.split(' ').slice(1).join(' ') || '',
                username: user.username || '',
                role: user.role || '',
                country: user.country || user.location || '',
                city: user.city || '',
                bio: user.bio || '',
                availableForWork: user.availableForWork || false
            });

            setCollections({
                experience: user.experience || [],
                education: user.education || [],
                skills: user.skills || [],
                socialLinks: user.socialLinks || {}
            });

            setImages({
                previewAvatar: '',
                previewCover: '',
                avatarFile: null,
                coverFile: null
            });

            setActiveTab('general');
            setUsernameError('');
            setSuggestions({ showRole: false, filteredRoles: COMMON_ROLES });
        }
    }, [isOpen, user]);

    const handleInputChange = <K extends keyof EditProfileState>(field: K, value: EditProfileState[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === 'role') {
            const filtered = COMMON_ROLES.filter(r =>
                r.toLowerCase().includes((value as string).toLowerCase())
            );
            setSuggestions(prev => ({ ...prev, filteredRoles: filtered }));
        }

        if (field === 'username') {
            const usernameValue = value as string;
            // Basic validation
            if (usernameValue.length < 3) {
                setUsernameError('Mínimo 3 caracteres');
            } else if (!/^[a-z0-9_]+$/.test(usernameValue)) {
                setUsernameError('Solo letras minúsculas, números y guiones bajos');
            } else {
                setUsernameError('');
            }
        }
    };

    const updateCollection = <K extends keyof CollectionState>(key: K, value: CollectionState[K]) => {
        setCollections(prev => ({ ...prev, [key]: value }));
    };

    const handleImageChange = (file: File, type: 'avatar' | 'cover') => {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setImages(prev => ({
                ...prev,
                [type === 'avatar' ? 'previewAvatar' : 'previewCover']: objectUrl,
                [type === 'avatar' ? 'avatarFile' : 'coverFile']: file
            }));
        }
    };

    const handleSave = async () => {
        if (!user) return;
        if (usernameError && formData.username !== user.username) {
            showToast('El nombre de usuario tiene un formato inválido.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            // Verificación de disponibilidad del username si ha cambiado
            if (formData.username !== user.username) {
                const isAvailable = await usersService.checkUsernameAvailability(formData.username);
                if (!isAvailable) {
                    throw new Error('Este nombre de usuario ya está en uso.');
                }
            }

            let avatarUrl = user.avatar;
            let coverUrl = user.coverImage;

            // 1. Upload Images if changed (delete old ones first to save storage)
            if (images.avatarFile) {
                // Delete old avatar if it exists
                if (user.avatar) {
                    await storageService.deleteFromUrl(user.avatar);
                }
                avatarUrl = await storageService.uploadImage(images.avatarFile, `users/${user.id}/avatar_${Date.now()}`);
            }
            if (images.coverFile) {
                // Delete old cover if it exists
                if (user.coverImage) {
                    await storageService.deleteFromUrl(user.coverImage);
                }
                coverUrl = await storageService.uploadImage(images.coverFile, `users/${user.id}/cover_${Date.now()}`);
            }

            // 2. Prepare Updates
            const updates: Partial<User> = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                username: formData.username,
                role: formData.role,
                country: formData.country, // Ensure both fields are synced if needed
                location: formData.city ? `${formData.city}, ${formData.country}` : formData.country,
                city: formData.city,
                bio: formData.bio,
                availableForWork: formData.availableForWork,
                avatar: avatarUrl,
                photoURL: avatarUrl, // Sync photoURL
                coverImage: coverUrl,
                experience: collections.experience,
                education: collections.education,
                skills: collections.skills,
                socialLinks: collections.socialLinks,
                isProfileComplete: true
            };

            // 3. Optimistic Update
            setUser({ ...user, ...updates } as User);

            // 4. Backend Update
            await usersService.updateUserProfile(user.id, updates);

            showToast('Perfil actualizado correctamente', 'success');
            onClose();

            // Navegar a la nueva URL si el username cambió
            if (formData.username && formData.username !== user.username) {
                router.push(`/user/${formData.username}`);
            }

        } catch (error) {
            console.error('Error saving profile:', error);
            const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error al guardar.';
            showToast(errorMessage, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return {
        user,
        activeTab,
        setActiveTab,
        formData,
        handleInputChange,
        collections,
        updateCollection,
        images,
        handleImageChange,
        suggestions,
        setSuggestions,
        usernameError,
        isSaving,
        handleSave
    };
};
