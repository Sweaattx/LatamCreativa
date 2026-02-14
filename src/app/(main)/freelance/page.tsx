'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Briefcase, Search, Star, MapPin, DollarSign,
  Sparkles, Users, Shield, Zap
} from 'lucide-react';

const MOCK_FREELANCERS = [
  {
    id: '1',
    name: 'María García',
    username: 'mariagarcia',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=ec4899&color=fff',
    title: 'Diseñadora UI/UX Senior',
    location: 'Ciudad de México, México',
    rating: 4.9,
    reviews: 127,
    hourlyRate: 45,
    skills: ['Figma', 'Diseño UI', 'Investigación UX', 'Prototipado'],
    available: true,
    featured: true,
    completedProjects: 89
  },
  {
    id: '2',
    name: 'Carlos Mendoza',
    username: 'carlosmendoza',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=6366f1&color=fff',
    title: 'Artista 3D & Animator',
    location: 'Buenos Aires, Argentina',
    rating: 4.8,
    reviews: 94,
    hourlyRate: 55,
    skills: ['Blender', 'Maya', 'ZBrush', 'Animación'],
    available: true,
    featured: false,
    completedProjects: 67
  },
  {
    id: '3',
    name: 'Ana López',
    username: 'analopez',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Lopez&background=f59e0b&color=fff',
    title: 'Ilustradora Digital',
    location: 'Bogotá, Colombia',
    rating: 5.0,
    reviews: 156,
    hourlyRate: 40,
    skills: ['Procreate', 'Photoshop', 'Ilustración', 'Diseño de Personajes'],
    available: true,
    featured: true,
    completedProjects: 134
  },
  {
    id: '4',
    name: 'Diego Fernández',
    username: 'diegofernandez',
    avatar: 'https://ui-avatars.com/api/?name=Diego+Fernandez&background=10b981&color=fff',
    title: 'Desarrollador Full Stack',
    location: 'Santiago, Chile',
    rating: 4.7,
    reviews: 82,
    hourlyRate: 60,
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    available: false,
    featured: false,
    completedProjects: 45
  }
];

const CATEGORIES = ['Todos', 'Diseño UI/UX', '3D & CGI', 'Ilustración', 'Desarrollo', 'Motion Graphics'];

export default function FreelancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filteredFreelancers = MOCK_FREELANCERS.filter(freelancer => {
    const matchesSearch = freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAvailable = !showAvailableOnly || freelancer.available;
    return matchesSearch && matchesAvailable;
  });

  return (
    <div className="min-h-screen bg-dark-1">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-dark-5/50">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-dev-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 rounded-full text-accent-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Encuentra el talento perfecto
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-content-1 mb-4">
              Freelancers Creativos
            </h1>
            <p className="text-xl text-content-3 max-w-2xl mx-auto">
              Conecta con los mejores profesionales creativos de Latinoamérica para tu próximo proyecto.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-content-1">2,500+</p>
                <p className="text-sm text-content-3">Freelancers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-dev-500/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-dev-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-content-1">10K+</p>
                <p className="text-sm text-content-3">Proyectos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-content-1">100%</p>
                <p className="text-sm text-content-3">Seguro</p>
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
              placeholder="Buscar por nombre, especialidad o habilidad..."
              className="w-full h-12 pl-10 pr-4 bg-dark-2 border border-dark-5 rounded-xl text-content-1 placeholder:text-content-3 focus:outline-none focus:border-accent-500/50 transition-colors"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-12 px-4 bg-dark-2 border border-dark-5 rounded-xl text-content-1 focus:outline-none focus:border-accent-500/50"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-4 h-12 bg-dark-2 border border-dark-5 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded border-dark-5 text-accent-500 focus:ring-accent-500"
            />
            <span className="text-content-2 text-sm whitespace-nowrap">Disponibles</span>
          </label>
        </div>

        {/* Grid de freelancers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreelancers.map((freelancer) => (
            <Link
              key={freelancer.id}
              href={`/user/${freelancer.username}`}
              className="group bg-dark-2/50 rounded-2xl border border-dark-5 p-6 hover:border-accent-500/30 transition-all hover:-translate-y-1"
            >
              {freelancer.featured && (
                <div className="flex items-center gap-1 text-accent-400 text-xs font-medium mb-4">
                  <Zap className="w-3 h-3" />
                  Destacado
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <Image
                    src={freelancer.avatar}
                    alt={freelancer.name}
                    width={64}
                    height={64}
                    className="rounded-xl"
                    unoptimized
                  />
                  {freelancer.available && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-dark-1 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-content-1 group-hover:text-accent-400 transition-colors truncate">
                    {freelancer.name}
                  </h3>
                  <p className="text-sm text-content-2 truncate">{freelancer.title}</p>
                  <p className="text-xs text-content-3 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {freelancer.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium">{freelancer.rating}</span>
                  <span className="text-content-3">({freelancer.reviews})</span>
                </div>
                <div className="text-content-2">
                  {freelancer.completedProjects} proyectos
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {freelancer.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-dark-3 text-content-2 text-xs rounded-md"
                  >
                    {skill}
                  </span>
                ))}
                {freelancer.skills.length > 3 && (
                  <span className="px-2 py-1 bg-dark-3 text-content-3 text-xs rounded-md">
                    +{freelancer.skills.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-dark-5">
                <div className="flex items-center gap-1 text-content-1">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="font-medium">${freelancer.hourlyRate}</span>
                  <span className="text-content-3 text-sm">/hora</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${freelancer.available
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-dark-3 text-content-3'
                  }`}>
                  {freelancer.available ? 'Disponible' : 'Ocupado'}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredFreelancers.length === 0 && (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-content-3 mx-auto mb-4" />
            <p className="text-content-2">No se encontraron freelancers con esos filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}
