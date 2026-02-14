import React, { useRef } from 'react';
import { X, Camera, Briefcase, GraduationCap, Plus, Trash2, GripVertical } from 'lucide-react';
import { useEditProfile } from '../../hooks/useEditProfile';
import { TagInput } from '../ui/TagInput';
import { COMMON_TAGS } from '../../data/tags';
import { LATAM_COUNTRIES } from '../../data/countries';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    activeTab,
    setActiveTab,
    formData,
    handleInputChange,
    collections,
    updateCollection,
    images,
    handleImageChange,
    isSaving,
    handleSave,
  } = useEditProfile(isOpen, onClose);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !user) return null;

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'experience', label: 'Experiencia' },
    { id: 'education', label: 'Educación' },
    { id: 'social', label: 'Social' },
  ] as const;

  const onImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageChange(file, type);
    }
  };

  const addExperience = () => {
    updateCollection('experience', [
      ...collections.experience,
      {
        id: Date.now(),
        role: '',
        company: '',
        period: '',
        location: '',
        description: '',
      },
    ]);
  };

  const updateExperienceItem = (id: number | string, field: string, value: string) => {
    updateCollection(
      'experience',
      collections.experience.map(exp => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const removeExperience = (id: number | string) => {
    updateCollection(
      'experience',
      collections.experience.filter(exp => exp.id !== id)
    );
  };

  const addEducation = () => {
    updateCollection('education', [
      ...collections.education,
      {
        id: Date.now(),
        degree: '',
        school: '',
        period: '',
        description: '',
      },
    ]);
  };

  const updateEducationItem = (id: number | string, field: string, value: string) => {
    updateCollection(
      'education',
      collections.education.map(edu => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const removeEducation = (id: number | string) => {
    updateCollection(
      'education',
      collections.education.filter(edu => edu.id !== id)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 w-full max-w-3xl rounded-xl border border-neutral-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">Editar Perfil</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-neutral-500 hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Cover Image */}
              <div className="relative h-32 bg-neutral-800 rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images.previewCover || user.coverImage || 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800'}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Cambiar
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageSelect(e, 'cover')}
                  className="hidden"
                />
              </div>

              {/* Avatar */}
              <div className="flex items-end gap-4 -mt-12 ml-4 relative z-10">
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images.previewAvatar || user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                    alt="Avatar"
                    className="w-20 h-20 rounded-xl object-cover border-4 border-neutral-900"
                  />
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => onImageSelect(e, 'avatar')}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Apellido</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Usuario</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Rol</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    placeholder="Ej: Diseñador UI/UX"
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">País</label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Seleccionar país</option>
                    {LATAM_COUNTRIES.map(country => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Ciudad</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Tu ciudad"
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Available for work */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.availableForWork}
                  onChange={(e) => handleInputChange('availableForWork', e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-600 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-neutral-300">Disponible para trabajo</span>
              </label>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  Experiencia laboral
                </h3>
                <button
                  onClick={addExperience}
                  className="px-3 py-1.5 text-sm bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>

              {collections.experience.length === 0 ? (
                <p className="text-neutral-500 text-sm text-center py-8">
                  No has agregado experiencia laboral aún
                </p>
              ) : (
                <div className="space-y-4">
                  {collections.experience.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 text-neutral-500">
                          <GripVertical className="w-4 h-4 cursor-grab" />
                        </div>
                        <button
                          onClick={() => removeExperience(exp.id)}
                          className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Puesto"
                          value={exp.role}
                          onChange={(e) => updateExperienceItem(exp.id, 'role', e.target.value)}
                          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                        />
                        <input
                          type="text"
                          placeholder="Empresa"
                          value={exp.company}
                          onChange={(e) => updateExperienceItem(exp.id, 'company', e.target.value)}
                          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                        />
                        <input
                          type="text"
                          placeholder="Período (ej: 2020 - Presente)"
                          value={exp.period}
                          onChange={(e) => updateExperienceItem(exp.id, 'period', e.target.value)}
                          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                        />
                        <input
                          type="text"
                          placeholder="Ubicación"
                          value={exp.location || ''}
                          onChange={(e) => updateExperienceItem(exp.id, 'location', e.target.value)}
                          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <textarea
                        placeholder="Descripción del puesto..."
                        value={exp.description}
                        onChange={(e) => updateExperienceItem(exp.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-500" />
                  Educación
                </h3>
                <button
                  onClick={addEducation}
                  className="px-3 py-1.5 text-sm bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>

              {collections.education.length === 0 ? (
                <p className="text-neutral-500 text-sm text-center py-8">
                  No has agregado educación aún
                </p>
              ) : (
                <div className="space-y-4">
                  {collections.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 text-neutral-500">
                          <GripVertical className="w-4 h-4 cursor-grab" />
                        </div>
                        <button
                          onClick={() => removeEducation(edu.id)}
                          className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Título"
                          value={edu.degree}
                          onChange={(e) => updateEducationItem(edu.id, 'degree', e.target.value)}
                          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                        />
                        <input
                          type="text"
                          placeholder="Institución"
                          value={edu.school}
                          onChange={(e) => updateEducationItem(edu.id, 'school', e.target.value)}
                          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                        />
                        <input
                          type="text"
                          placeholder="Período"
                          value={edu.period}
                          onChange={(e) => updateEducationItem(edu.id, 'period', e.target.value)}
                          className="col-span-2 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <textarea
                        placeholder="Descripción..."
                        value={edu.description || ''}
                        onChange={(e) => updateEducationItem(edu.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Habilidades</label>
                <TagInput
                  tags={collections.skills}
                  onAddTag={(tag) => updateCollection('skills', [...collections.skills, tag])}
                  onRemoveTag={(tag) => updateCollection('skills', collections.skills.filter(t => t !== tag))}
                  suggestions={COMMON_TAGS}
                  placeholder="Añade tus habilidades..."
                />
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-neutral-400">Redes sociales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Twitter/X</label>
                    <input
                      type="text"
                      value={collections.socialLinks.twitter || ''}
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, twitter: e.target.value })}
                      placeholder="@usuario"
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">LinkedIn</label>
                    <input
                      type="text"
                      value={collections.socialLinks.linkedin || ''}
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, linkedin: e.target.value })}
                      placeholder="URL de LinkedIn"
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Instagram</label>
                    <input
                      type="text"
                      value={collections.socialLinks.instagram || ''}
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, instagram: e.target.value })}
                      placeholder="@usuario"
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Behance</label>
                    <input
                      type="text"
                      value={collections.socialLinks.behance || ''}
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, behance: e.target.value })}
                      placeholder="URL de Behance"
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Dribbble</label>
                    <input
                      type="text"
                      value={collections.socialLinks.dribbble || ''}
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, dribbble: e.target.value })}
                      placeholder="URL de Dribbble"
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
