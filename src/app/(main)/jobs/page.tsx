'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Building2, Search, MapPin, Clock, DollarSign, Briefcase,
  Globe, Users, Sparkles, Bookmark, Check
} from 'lucide-react';

const MOCK_JOBS = [
  {
    id: '1',
    title: 'Senior 3D Artist',
    company: 'Pixelworks Studio',
    companyLogo: 'https://ui-avatars.com/api/?name=Pixelworks&background=6366f1&color=fff',
    location: 'Ciudad de México, México',
    type: 'Tiempo completo',
    remote: true,
    salary: { min: 3000, max: 5000, currency: 'USD' },
    skills: ['Blender', 'Maya', 'ZBrush', 'Substance Painter'],
    description: 'Buscamos un artista 3D senior para unirse a nuestro equipo de desarrollo de videojuegos.',
    postedAt: '2024-01-28',
    featured: true,
    applicants: 45
  },
  {
    id: '2',
    title: 'UI/UX Designer',
    company: 'TechLatam',
    companyLogo: 'https://ui-avatars.com/api/?name=TechLatam&background=10b981&color=fff',
    location: 'Buenos Aires, Argentina',
    type: 'Tiempo completo',
    remote: true,
    salary: { min: 2500, max: 4000, currency: 'USD' },
    skills: ['Figma', 'Diseño UI', 'Prototipado', 'Investigación UX'],
    description: 'Únete a nuestro equipo de producto para diseñar experiencias digitales increíbles.',
    postedAt: '2024-01-27',
    featured: false,
    applicants: 78
  },
  {
    id: '3',
    title: 'Motion Graphics Designer',
    company: 'Creative Agency',
    companyLogo: 'https://ui-avatars.com/api/?name=Creative+Agency&background=ec4899&color=fff',
    location: 'Bogotá, Colombia',
    type: 'Freelance',
    remote: true,
    salary: { min: 30, max: 50, currency: 'USD', hourly: true },
    skills: ['After Effects', 'Cinema 4D', 'Premiere Pro'],
    description: 'Buscamos motion designer freelance para proyectos de publicidad y branding.',
    postedAt: '2024-01-26',
    featured: true,
    applicants: 32
  },
  {
    id: '4',
    title: 'Game Developer - Unity',
    company: 'IndieGames Latam',
    companyLogo: 'https://ui-avatars.com/api/?name=IndieGames&background=f59e0b&color=fff',
    location: 'Santiago, Chile',
    type: 'Tiempo completo',
    remote: false,
    salary: { min: 2000, max: 3500, currency: 'USD' },
    skills: ['Unity', 'C#', 'Diseño de Juegos', 'Multijugador'],
    description: 'Desarrollador de juegos con experiencia en Unity para proyecto indie.',
    postedAt: '2024-01-25',
    featured: false,
    applicants: 56
  }
];

const JOB_TYPES = ['Todos', 'Tiempo completo', 'Medio tiempo', 'Freelance', 'Contrato'];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const filteredJobs = MOCK_JOBS.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'Todos' || job.type === selectedType;
    const matchesRemote = !remoteOnly || job.remote;
    return matchesSearch && matchesType && matchesRemote;
  });

  const toggleSave = (jobId: string) => {
    setSavedJobs(prev => {
      const isSaved = prev.includes(jobId);
      showToast(isSaved ? 'Trabajo removido de guardados' : 'Trabajo guardado');
      return isSaved
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId];
    });
  };

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const formatSalary = (salary: typeof MOCK_JOBS[0]['salary']) => {
    if (salary.hourly) {
      return `$${salary.min}-${salary.max}/hora`;
    }
    return `$${salary.min.toLocaleString()}-${salary.max.toLocaleString()}/mes`;
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return `Hace ${Math.floor(diffDays / 7)} semanas`;
  };

  return (
    <div className="min-h-screen bg-dark-1">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-sm font-medium shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            {toast}
          </div>
        </div>
      )}
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-dark-5/50">
        <div className="absolute inset-0 bg-gradient-to-br from-dev-500/5 via-transparent to-accent-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-dev-500/10 rounded-full text-dev-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Oportunidades para creativos
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-content-1 mb-4">
              Bolsa de Trabajo
            </h1>
            <p className="text-xl text-content-3 max-w-2xl mx-auto">
              Encuentra las mejores oportunidades laborales en la industria creativa de Latinoamérica.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-dev-500/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-dev-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-content-1">500+</p>
                <p className="text-sm text-content-3">Trabajos activos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-content-1">200+</p>
                <p className="text-sm text-content-3">Empresas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Globe className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-content-1">80%</p>
                <p className="text-sm text-content-3">Remoto</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-content-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, empresa o habilidad..."
              className="w-full h-12 pl-10 pr-4 bg-dark-2 border border-dark-5 rounded-xl text-content-1 placeholder:text-content-3 focus:outline-none focus:border-accent-500/50 transition-colors"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-12 px-4 bg-dark-2 border border-dark-5 rounded-xl text-content-1 focus:outline-none focus:border-accent-500/50"
          >
            {JOB_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-4 h-12 bg-dark-2 border border-dark-5 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="w-4 h-4 rounded border-dark-5 text-accent-500 focus:ring-accent-500"
            />
            <span className="text-content-2 text-sm whitespace-nowrap">Solo remoto</span>
          </label>
        </div>

        {/* Lista de trabajos */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className={`bg-dark-2/50 rounded-2xl border p-6 hover:border-accent-500/30 transition-all ${job.featured ? 'border-accent-500/30' : 'border-dark-5'
                }`}
            >
              {job.featured && (
                <div className="flex items-center gap-1 text-accent-400 text-xs font-medium mb-4">
                  <Sparkles className="w-3 h-3" />
                  Destacado
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <Image
                  src={job.companyLogo}
                  alt={job.company}
                  width={56}
                  height={56}
                  className="rounded-xl"
                  unoptimized
                />

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-medium text-content-1 hover:text-accent-400 transition-colors cursor-pointer">
                        {job.title}
                      </h3>
                      <p className="text-content-2">{job.company}</p>
                    </div>
                    <button
                      onClick={() => toggleSave(job.id)}
                      className={`p-2 rounded-lg transition-colors ${savedJobs.includes(job.id)
                        ? 'bg-accent-500/20 text-accent-400'
                        : 'bg-dark-3 text-content-3 hover:text-content-1'
                        }`}
                    >
                      <Bookmark className={`w-5 h-5 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-content-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {job.type}
                    </span>
                    {job.remote && (
                      <span className="flex items-center gap-1 text-green-400">
                        <Globe className="w-4 h-4" />
                        Remoto
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-green-400">
                      <DollarSign className="w-4 h-4" />
                      {formatSalary(job.salary)}
                    </span>
                  </div>

                  <p className="text-content-3 mt-3 line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-dark-3 text-content-2 text-xs rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-5">
                    <div className="flex items-center gap-4 text-sm text-content-3">
                      <span>{getTimeAgo(job.postedAt)}</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job.applicants} aplicantes
                      </span>
                    </div>
                    <button
                      onClick={() => showToast(`Solicitud enviada a ${job.company}`)}
                      className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >  Aplicar ahora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-content-3 mx-auto mb-4" />
            <p className="text-content-2">No se encontraron trabajos con esos filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}
