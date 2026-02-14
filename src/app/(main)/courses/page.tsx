'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  GraduationCap, Search, Star, Clock, Users,
  PlayCircle, Sparkles, Award, BookOpen, Zap
} from 'lucide-react';

const MOCK_COURSES = [
  {
    id: '1',
    slug: 'blender-desde-cero',
    title: 'Blender desde Cero',
    description: 'Aprende modelado 3D, texturizado y animación con Blender 4.0',
    instructor: 'Carlos Mendoza',
    instructorAvatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=6366f1&color=fff',
    image: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&h=450&fit=crop',
    category: '3D & CGI',
    level: 'Principiante',
    duration: '24 horas',
    lessons: 48,
    students: 1234,
    rating: 4.9,
    price: 49.99,
    originalPrice: 99.99,
    featured: true,
    tags: ['Blender', 'Modelado 3D', 'Animación']
  },
  {
    id: '2',
    slug: 'motion-graphics-after-effects',
    title: 'Motion Graphics con After Effects',
    description: 'Domina las técnicas de animación y efectos visuales profesionales',
    instructor: 'María García',
    instructorAvatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=ec4899&color=fff',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=450&fit=crop',
    category: 'Animación',
    level: 'Intermedio',
    duration: '18 horas',
    lessons: 36,
    students: 892,
    rating: 4.8,
    price: 39.99,
    originalPrice: 79.99,
    featured: false,
    tags: ['After Effects', 'Motion', 'Animación']
  },
  {
    id: '3',
    slug: 'react-next-profesional',
    title: 'React & Next.js Profesional',
    description: 'Desarrollo web moderno con React 18 y Next.js 14',
    instructor: 'Diego Fernández',
    instructorAvatar: 'https://ui-avatars.com/api/?name=Diego+Fernandez&background=10b981&color=fff',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
    category: 'Desarrollo',
    level: 'Avanzado',
    duration: '32 horas',
    lessons: 64,
    students: 2156,
    rating: 4.95,
    price: 59.99,
    originalPrice: 129.99,
    featured: true,
    tags: ['React', 'Next.js', 'TypeScript']
  },
  {
    id: '4',
    slug: 'ilustracion-digital',
    title: 'Ilustración Digital Profesional',
    description: 'Técnicas avanzadas de ilustración en Procreate y Photoshop',
    instructor: 'Ana López',
    instructorAvatar: 'https://ui-avatars.com/api/?name=Ana+Lopez&background=f59e0b&color=fff',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=450&fit=crop',
    category: 'Arte 2D',
    level: 'Intermedio',
    duration: '20 horas',
    lessons: 40,
    students: 678,
    rating: 4.7,
    price: 44.99,
    originalPrice: 89.99,
    featured: false,
    tags: ['Procreate', 'Photoshop', 'Ilustración']
  }
];

const CATEGORIES = ['Todos', '3D & CGI', 'Animación', 'Desarrollo', 'Arte 2D', 'Videojuegos'];
const LEVELS = ['Todos', 'Principiante', 'Intermedio', 'Avanzado'];

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedLevel, setSelectedLevel] = useState('Todos');

  const filteredCourses = MOCK_COURSES.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'Todos' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const featuredCourse = MOCK_COURSES.find(c => c.featured);

  return (
    <div className="min-h-screen bg-dark-1">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-dark-5/50">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-dev-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 rounded-full text-accent-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Aprende de los mejores profesionales
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-content-1 mb-4">
              Cursos para Creativos
            </h1>
            <p className="text-xl text-content-3 max-w-2xl mx-auto">
              Domina las herramientas y técnicas que necesitas para destacar en la industria creativa.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-content-1">50+</p>
                <p className="text-sm text-content-3">Cursos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-dev-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-dev-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-content-1">10K+</p>
                <p className="text-sm text-content-3">Estudiantes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-light text-content-1">98%</p>
                <p className="text-sm text-content-3">Satisfacción</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        {/* Featured Course */}
        {featuredCourse && (
          <div className="mb-12">
            <h2 className="text-xl font-medium text-content-1 mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent-400" />
              Curso Destacado
            </h2>
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-accent-500/10 to-dev-500/10 border border-dark-5/50">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 aspect-video lg:aspect-auto relative">
                  <Image
                    src={featuredCourse.image}
                    alt={featuredCourse.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-1 hidden lg:block" />
                </div>
                <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-500/20 text-accent-400 text-sm rounded-full w-fit mb-4">
                    <Star className="w-4 h-4 fill-current" />
                    Más vendido
                  </span>
                  <h3 className="text-2xl lg:text-3xl font-medium text-content-1 mb-3">
                    {featuredCourse.title}
                  </h3>
                  <p className="text-content-2 mb-6">{featuredCourse.description}</p>
                  <div className="flex items-center gap-4 mb-6">
                    <Image
                      src={featuredCourse.instructorAvatar}
                      alt={featuredCourse.instructor}
                      width={40}
                      height={40}
                      className="rounded-full"
                      unoptimized
                    />
                    <span className="text-content-1">{featuredCourse.instructor}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-content-3 mb-6">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredCourse.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" />
                      {featuredCourse.lessons} lecciones
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400" />
                      {featuredCourse.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/courses/${featuredCourse.slug}`}
                      className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-xl transition-colors"
                    >
                      Ver Curso
                    </Link>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-medium text-content-1">${featuredCourse.price}</span>
                      <span className="text-content-3 line-through">${featuredCourse.originalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-content-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cursos..."
              className="w-full h-11 pl-10 pr-4 bg-dark-2 border border-dark-5 rounded-xl text-content-1 placeholder:text-content-3 focus:outline-none focus:border-accent-500/50 transition-colors"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-11 px-4 bg-dark-2 border border-dark-5 rounded-xl text-content-1 focus:outline-none focus:border-accent-500/50"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="h-11 px-4 bg-dark-2 border border-dark-5 rounded-xl text-content-1 focus:outline-none focus:border-accent-500/50"
          >
            {LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group bg-dark-2/50 rounded-xl border border-dark-5 overflow-hidden hover:border-accent-500/30 transition-all hover:-translate-y-1"
            >
              <div className="aspect-video relative">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-dark-0/60 backdrop-blur-sm text-content-1 text-xs rounded-md">
                    {course.level}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <span className="text-xs text-accent-500 font-medium">{course.category}</span>
                <h3 className="text-content-1 font-medium mt-1 mb-2 line-clamp-2 group-hover:text-accent-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-content-2 line-clamp-2 mb-3">{course.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <Image
                    src={course.instructorAvatar}
                    alt={course.instructor}
                    width={24}
                    height={24}
                    className="rounded-full"
                    unoptimized
                  />
                  <span className="text-sm text-content-2">{course.instructor}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-content-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      {course.rating}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-content-1 font-medium">${course.price}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <GraduationCap className="w-16 h-16 text-content-3 mx-auto mb-4" />
            <p className="text-content-2">No se encontraron cursos con esos filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}
