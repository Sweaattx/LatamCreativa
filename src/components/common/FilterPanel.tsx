
import React from 'react';
import { X, Globe, MapPin, Tag } from 'lucide-react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  topics: string[];
}

const COUNTRIES = [
  "Todos", "Argentina", "Bolivia", "Brasil", "Chile", "Colombia",
  "Costa Rica", "Ecuador", "El Salvador", "España", "Guatemala",
  "Honduras", "México", "Nicaragua", "Panamá", "Paraguay",
  "Perú", "Rep. Dominicana", "Uruguay", "Venezuela"
];

const LANGUAGES = ["Español", "Inglés", "Portugués"];

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, topics }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} aria-hidden="true"></div>

      <div
        role="dialog"
        aria-labelledby="filter-panel-title"
        className="absolute top-full right-0 mt-2 w-80 bg-dark-2 border border-dark-5/50 rounded-xl shadow-xl z-50 p-5 animate-fadeIn origin-top-right"
      >
        <div className="flex justify-between items-center mb-4 border-b border-dark-5/50 pb-2">
          <h3 id="filter-panel-title" className="font-medium text-content-1">Filtrar por</h3>
          <button onClick={onClose} className="text-content-3 hover:text-content-1 transition-colors" aria-label="Cerrar filtros">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">

          {/* Country Filter */}
          <div>
            <label className="flex items-center gap-2 text-2xs font-medium text-content-3 uppercase tracking-wider mb-2">
              <MapPin className="h-3 w-3" /> País
            </label>
            <select className="w-full bg-dark-3 border border-dark-5 rounded-lg px-3 py-2 text-sm text-content-1 focus:outline-none focus:border-accent-500/50">
              {COUNTRIES.map(country => (
                <option key={country} value={country} className="bg-dark-2">{country}</option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label className="flex items-center gap-2 text-2xs font-medium text-content-3 uppercase tracking-wider mb-2">
              <Globe className="h-3 w-3" /> Idioma
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <label key={lang} className="flex items-center gap-2 cursor-pointer bg-dark-3 px-3 py-1.5 rounded-lg border border-transparent hover:border-dark-5 transition-colors">
                  <input type="checkbox" className="rounded border-dark-5 text-accent-500 focus:ring-accent-500 bg-transparent" />
                  <span className="text-sm text-content-2">{lang}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Topics Filter */}
          <div>
            <label className="flex items-center gap-2 text-2xs font-medium text-content-3 uppercase tracking-wider mb-2">
              <Tag className="h-3 w-3" /> Temas
            </label>
            <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1 pr-1">
              {topics.map(topic => (
                <label key={topic} className="flex items-center gap-2 p-1.5 hover:bg-dark-3/50 rounded-lg cursor-pointer transition-colors">
                  <input type="checkbox" className="rounded border-dark-5 text-accent-500 focus:ring-accent-500 bg-transparent" />
                  <span className="text-sm text-content-2">{topic}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-dark-5/50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 text-sm font-medium text-content-3 hover:text-content-1 transition-colors">
            Limpiar
          </button>
          <button onClick={onClose} className="flex-1 py-2 bg-accent-500 text-white font-medium rounded-lg text-sm hover:bg-accent-600 transition-colors shadow-lg shadow-glow-orange">
            Aplicar
          </button>
        </div>
      </div>
    </>
  );
};
