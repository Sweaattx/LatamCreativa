'use client';

import React, { useRef } from 'react';
import { X, Camera, Plus, Trash2, Save } from 'lucide-react';
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
    { id: 'general', label: 'Información General' },
    { id: 'experience', label: 'Experiencia' },
    { id: 'education', label: 'Educación' },
    { id: 'social', label: 'Social y Habilidades' },
  ] as const;


  const addExperience = () => {
    updateCollection('experience', [
      ...collections.experience,
      { id: Date.now(), role: 'Nuevo Rol', company: 'Empresa', period: '2023 - Presente', location: 'Ciudad, País', description: '' },
    ]);
  };
  const updateExperienceItem = (id: number | string, field: string, value: string) => {
    updateCollection('experience', collections.experience.map(exp => (exp.id === id ? { ...exp, [field]: value } : exp)));
  };
  const removeExperience = (id: number | string) => {
    updateCollection('experience', collections.experience.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    updateCollection('education', [
      ...collections.education,
      { id: Date.now(), degree: '', school: '', period: '', description: '' },
    ]);
  };
  const updateEducationItem = (id: number | string, field: string, value: string) => {
    updateCollection('education', collections.education.map(edu => (edu.id === id ? { ...edu, [field]: value } : edu)));
  };
  const removeEducation = (id: number | string) => {
    updateCollection('education', collections.education.filter(edu => edu.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-dark-0 w-full max-w-[680px] rounded-2xl border border-dark-5/50 flex flex-col max-h-[90vh] overflow-hidden shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══ Header ═══ */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-dark-5/40">
          <h2 className="text-xl font-bold text-content-1">Editar Perfil</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-content-3 hover:text-content-1 hover:bg-dark-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ═══ Tabs ═══ */}
        <div className="flex border-b border-dark-5/40 px-7 gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-3 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                ? 'border-accent-500 text-accent-400'
                : 'border-transparent text-content-3 hover:text-content-2'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ Scrollable Content ═══ */}
        <div className="flex-1 overflow-y-auto px-7 py-6 custom-scrollbar">

          {/* ──── GENERAL TAB ──── */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* Cover Banner */}
              <div>
                <div className="relative h-36 rounded-xl overflow-hidden bg-dark-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={images.previewCover || formData.coverUrl || ''}
                    src={images.previewCover || formData.coverUrl || (user as unknown as Record<string, string>).cover_image || user.coverImage || 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800'}
                    alt="" className="w-full h-full object-cover"
                    style={{ objectPosition: `center ${formData.coverPosition ?? 50}%` }}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800'; }}
                  />
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[10px] text-white/60">
                    Imagen o GIF
                  </span>
                  <input ref={coverInputRef} type="file" accept="image/*,image/gif" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageChange(f, 'cover'); }} className="hidden" />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="text"
                    placeholder="Pegar URL de GIF o imagen..."
                    value={formData.coverUrl || ''}
                    onChange={(e) => handleInputChange('coverUrl' as keyof typeof formData, e.target.value as never)}
                    className="flex-1 h-8 px-3 text-xs bg-dark-2 border border-dark-5 rounded-lg text-content-1 placeholder:text-content-3 focus:outline-none focus:border-dark-6 transition-colors"
                  />
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs text-content-3 hover:text-content-1 transition-colors flex-shrink-0"
                  >
                    <Camera className="w-3.5 h-3.5" /> Subir archivo
                  </button>
                </div>
                {/* Cover Position Slider */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-content-3 uppercase tracking-wider font-semibold">Ajustar posición</span>
                    <span className="text-[10px] text-accent-400 font-mono">{formData.coverPosition ?? 50}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.coverPosition ?? 50}
                    onChange={(e) => handleInputChange('coverPosition' as keyof typeof formData, Number(e.target.value) as never)}
                    className="w-full h-1.5 bg-dark-3 rounded-full appearance-none cursor-pointer accent-accent-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-500 [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between">
                    {[{ label: 'Arriba', val: 0 }, { label: 'Centro', val: 50 }, { label: 'Abajo', val: 100 }].map(p => (
                      <button
                        key={p.val}
                        onClick={() => handleInputChange('coverPosition' as keyof typeof formData, p.val as never)}
                        className={`text-[9px] font-medium transition-colors ${formData.coverPosition === p.val ? 'text-accent-400' : 'text-content-3/50 hover:text-content-3'}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Avatar + Name fields */}
              <div className="flex gap-5 items-start">
                <div className="relative group flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images.previewAvatar || user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                    alt="Avatar"
                    className="w-[88px] h-[88px] rounded-2xl object-cover"
                  />
                  <button onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageChange(f, 'avatar'); }} className="hidden" />
                </div>
                <div className="flex-1 space-y-3">
                  <FieldGroup label="Nombres *">
                    <input type="text" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="modal-input" placeholder="Tu nombre" />
                  </FieldGroup>
                  <FieldGroup label="Apellidos *">
                    <input type="text" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="modal-input" placeholder="Tus apellidos" />
                  </FieldGroup>
                </div>
              </div>

              {/* Rol Profesional */}
              <FieldGroup label="Rol Profesional *">
                <input type="text" value={formData.role} onChange={(e) => handleInputChange('role', e.target.value)}
                  className="modal-input" placeholder="Ej: 3D Artist & Designer" />
              </FieldGroup>

              {/* Username */}
              <FieldGroup label="Nombre de Usuario *">
                <input type="text" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)}
                  className="modal-input" placeholder="username" />
                <p className="text-[10px] text-content-3 mt-1">latamcreativa.com/user/{formData.username || 'tu-usuario'}</p>
              </FieldGroup>

              {/* País + Ciudad */}
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="País *">
                  <select value={formData.country} onChange={(e) => handleInputChange('country', e.target.value)}
                    className="modal-input appearance-none">
                    <option value="">Seleccionar</option>
                    {LATAM_COUNTRIES.map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </FieldGroup>
                <FieldGroup label="Ciudad">
                  <input type="text" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)}
                    className="modal-input" placeholder="Ciudad" />
                </FieldGroup>
              </div>

              {/* Bio */}
              <FieldGroup label="Biografía">
                <textarea value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3} className="modal-input resize-none" placeholder="Cuéntanos sobre ti..." />
              </FieldGroup>
            </div>
          )}

          {/* ──── EXPERIENCE TAB ──── */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-content-1">Historial Laboral</h3>
                <button onClick={addExperience}
                  className="px-4 py-2 text-sm bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 transition-colors flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Añadir Puesto
                </button>
              </div>

              {collections.experience.length === 0 ? (
                <div className="text-center py-16 border border-dark-5/30 rounded-xl bg-dark-1/30">
                  <p className="text-content-3 text-sm">No has agregado experiencia laboral aún</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {collections.experience.map((exp) => (
                    <div key={exp.id} className="p-5 rounded-xl border border-dark-5/40 space-y-4 relative bg-dark-1/20">
                      <button onClick={() => removeExperience(exp.id)}
                        className="absolute top-4 right-4 p-1.5 text-content-3 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-2 gap-4 pr-8">
                        <FieldGroup label="Cargo">
                          <input type="text" value={exp.role} onChange={(e) => updateExperienceItem(exp.id, 'role', e.target.value)}
                            className="modal-input" placeholder="Nuevo Rol" />
                        </FieldGroup>
                        <FieldGroup label="Empresa">
                          <input type="text" value={exp.company} onChange={(e) => updateExperienceItem(exp.id, 'company', e.target.value)}
                            className="modal-input" placeholder="Empresa" />
                        </FieldGroup>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FieldGroup label="Período">
                          <input type="text" value={exp.period} onChange={(e) => updateExperienceItem(exp.id, 'period', e.target.value)}
                            className="modal-input" placeholder="2023 - Presente" />
                        </FieldGroup>
                        <FieldGroup label="Ubicación">
                          <input type="text" value={exp.location || ''} onChange={(e) => updateExperienceItem(exp.id, 'location', e.target.value)}
                            className="modal-input" placeholder="Ciudad, País" />
                        </FieldGroup>
                      </div>
                      <FieldGroup label="Descripción">
                        <textarea value={exp.description} onChange={(e) => updateExperienceItem(exp.id, 'description', e.target.value)}
                          rows={3} className="modal-input resize-y" placeholder="Descripción del puesto..." />
                      </FieldGroup>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ──── EDUCATION TAB ──── */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-content-1">Formación Académica</h3>
                <button onClick={addEducation}
                  className="px-4 py-2 text-sm bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 transition-colors flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Añadir Estudio
                </button>
              </div>

              {collections.education.length === 0 ? (
                <div className="text-center py-16 border border-dark-5/30 rounded-xl bg-dark-1/30">
                  <p className="text-content-3 text-sm">No has agregado educación aún</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {collections.education.map((edu) => (
                    <div key={edu.id} className="p-5 rounded-xl border border-dark-5/40 space-y-4 relative bg-dark-1/20">
                      <button onClick={() => removeEducation(edu.id)}
                        className="absolute top-4 right-4 p-1.5 text-content-3 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-2 gap-4 pr-8">
                        <FieldGroup label="Título">
                          <input type="text" value={edu.degree} onChange={(e) => updateEducationItem(edu.id, 'degree', e.target.value)}
                            className="modal-input" placeholder="Título obtenido" />
                        </FieldGroup>
                        <FieldGroup label="Institución">
                          <input type="text" value={edu.school} onChange={(e) => updateEducationItem(edu.id, 'school', e.target.value)}
                            className="modal-input" placeholder="Universidad / Instituto" />
                        </FieldGroup>
                      </div>
                      <FieldGroup label="Período">
                        <input type="text" value={edu.period} onChange={(e) => updateEducationItem(edu.id, 'period', e.target.value)}
                          className="modal-input" placeholder="2019 - 2023" />
                      </FieldGroup>
                      <FieldGroup label="Descripción">
                        <textarea value={edu.description || ''} onChange={(e) => updateEducationItem(edu.id, 'description', e.target.value)}
                          rows={2} className="modal-input resize-y" placeholder="Descripción..." />
                      </FieldGroup>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ──── SOCIAL & SKILLS TAB ──── */}
          {activeTab === 'social' && (
            <div className="space-y-8">
              {/* Skills */}
              <div>
                <h3 className="text-base font-bold text-content-1 mb-4">Habilidades</h3>
                <TagInput
                  tags={collections.skills}
                  onAddTag={(tag) => updateCollection('skills', [...collections.skills, tag])}
                  onRemoveTag={(tag) => updateCollection('skills', collections.skills.filter(t => t !== tag))}
                  suggestions={COMMON_TAGS}
                  placeholder="Busca o añade una habilidad..."
                />
              </div>

              <div className="border-t border-dark-5/30" />

              {/* Social Links */}
              <div>
                <h3 className="text-base font-bold text-content-1 mb-4">Redes</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="Instagram">
                    <input type="text" value={collections.socialLinks.instagram || ''} placeholder="https://instagram.com/usuario"
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, instagram: e.target.value })} className="modal-input" />
                  </FieldGroup>
                  <FieldGroup label="X (Twitter)">
                    <input type="text" value={collections.socialLinks.twitter || ''} placeholder="https://x.com/usuario"
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, twitter: e.target.value })} className="modal-input" />
                  </FieldGroup>
                  <FieldGroup label="YouTube">
                    <input type="text" value={collections.socialLinks.youtube || ''} placeholder="https://youtube.com/@canal"
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, youtube: e.target.value })} className="modal-input" />
                  </FieldGroup>
                  <FieldGroup label="TikTok">
                    <input type="text" value={collections.socialLinks.tiktok || ''} placeholder="https://tiktok.com/@usuario"
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, tiktok: e.target.value })} className="modal-input" />
                  </FieldGroup>
                  <FieldGroup label="GitHub">
                    <input type="text" value={collections.socialLinks.github || ''} placeholder="https://github.com/usuario"
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, github: e.target.value })} className="modal-input" />
                  </FieldGroup>
                  <FieldGroup label="LinkedIn">
                    <input type="text" value={collections.socialLinks.linkedin || ''} placeholder="https://linkedin.com/in/usuario"
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, linkedin: e.target.value })} className="modal-input" />
                  </FieldGroup>
                  <FieldGroup label="Behance">
                    <input type="text" value={collections.socialLinks.behance || ''} placeholder="https://behance.net/usuario"
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, behance: e.target.value })} className="modal-input" />
                  </FieldGroup>
                  <FieldGroup label="Dribbble">
                    <input type="text" value={collections.socialLinks.dribbble || ''} placeholder="https://dribbble.com/usuario"
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, dribbble: e.target.value })} className="modal-input" />
                  </FieldGroup>
                  <FieldGroup label="Artstation">
                    <input type="text" value={collections.socialLinks.artstation || ''} placeholder="https://artstation.com/usuario"
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, artstation: e.target.value })} className="modal-input" />
                  </FieldGroup>
                  <FieldGroup label="Pinterest">
                    <input type="text" value={collections.socialLinks.pinterest || ''} placeholder="https://pinterest.com/usuario"
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, pinterest: e.target.value })} className="modal-input" />
                  </FieldGroup>
                  <FieldGroup label="Vimeo">
                    <input type="text" value={collections.socialLinks.vimeo || ''} placeholder="https://vimeo.com/usuario"
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, vimeo: e.target.value })} className="modal-input" />
                  </FieldGroup>
                  <FieldGroup label="Website Personal">
                    <input type="text" value={collections.socialLinks.website || ''} placeholder="https://miweb.com"
                      onChange={(e) => updateCollection('socialLinks', { ...collections.socialLinks, website: e.target.value })} className="modal-input" />
                  </FieldGroup>
                </div>
              </div>

              <div className="border-t border-dark-5/30" />

              {/* Available for work toggle */}
              <div className="flex items-center justify-between p-5 bg-dark-1/40 rounded-xl border border-dark-5/30">
                <div>
                  <p className="text-sm font-semibold text-content-1">Disponible para trabajar</p>
                  <p className="text-xs text-content-3 mt-0.5">Muestra en tu perfil que estás buscando nuevas oportunidades.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                  <input type="checkbox" checked={formData.availableForWork}
                    onChange={(e) => handleInputChange('availableForWork', e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-dark-3 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border border-dark-5/50 peer-checked:border-green-600" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ═══ Footer ═══ */}
        <div className="flex items-center justify-end gap-3 px-7 py-4 border-t border-dark-5/40">
          <button onClick={onClose} className="px-5 py-2.5 text-sm text-content-3 hover:text-content-1 transition-colors font-medium">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className="px-6 py-2.5 bg-accent-500 text-white text-sm font-semibold rounded-xl hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {isSaving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
            ) : (
              <><Save className="w-4 h-4" /> Guardar Cambios</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Reusable label + field wrapper ─── */
function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-content-3 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default EditProfileModal;
