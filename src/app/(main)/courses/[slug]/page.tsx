'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, Star, Clock, Users, PlayCircle, CheckCircle,
  BookOpen, Award, Share2, Heart, ShoppingCart, Play,
  ChevronDown, ChevronUp, Lock
} from 'lucide-react';

// Mock data - en producción vendría de la base de datos
const MOCK_COURSE = {
  id: '1',
  slug: 'blender-desde-cero',
  title: 'Blender desde Cero hasta Avanzado',
  description: 'Aprende modelado 3D, texturizado, iluminación y animación con Blender 4.0. Este curso te llevará desde los fundamentos hasta técnicas avanzadas utilizadas en la industria.',
  longDescription: `
    <p>Este curso completo de Blender te enseñará todo lo que necesitas saber para crear increíbles modelos 3D, animaciones y renders profesionales.</p>
    <h3>Lo que aprenderás:</h3>
    <ul>
      <li>Interfaz y navegación en Blender 4.0</li>
      <li>Modelado poligonal y escultura digital</li>
      <li>Materiales y texturas con Shader Editor</li>
      <li>Iluminación y renderizado con Cycles y Eevee</li>
      <li>Rigging y animación de personajes</li>
      <li>Composición y post-producción</li>
    </ul>
  `,
  instructor: {
    name: 'Carlos Mendoza',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=6366f1&color=fff',
    bio: 'Artista 3D con más de 10 años de experiencia en la industria del cine y videojuegos.',
    students: 15000,
    courses: 8,
    rating: 4.9
  },
  image: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=1200&h=600&fit=crop',
  category: '3D & CGI',
  level: 'Principiante a Avanzado',
  duration: '24 horas',
  lessons: 48,
  students: 1234,
  rating: 4.9,
  reviews: 342,
  price: 49.99,
  originalPrice: 99.99,
  language: 'Español',
  lastUpdated: '2024-01-15',
  certificate: true,
  lifetime: true,
  sections: [
    {
      title: 'Introducción a Blender',
      lessons: [
        { title: 'Bienvenida al curso', duration: '5:30', free: true },
        { title: 'Descarga e instalación', duration: '8:15', free: true },
        { title: 'Interfaz y navegación', duration: '15:20', free: false },
        { title: 'Atajos de teclado esenciales', duration: '12:45', free: false },
      ]
    },
    {
      title: 'Modelado Básico',
      lessons: [
        { title: 'Primitivas y transformaciones', duration: '18:30', free: false },
        { title: 'Modo edición', duration: '22:15', free: false },
        { title: 'Modificadores básicos', duration: '25:40', free: false },
        { title: 'Proyecto: Modelar una taza', duration: '35:00', free: false },
      ]
    },
    {
      title: 'Materiales y Texturas',
      lessons: [
        { title: 'Introducción al Shader Editor', duration: '20:00', free: false },
        { title: 'Materiales PBR', duration: '28:30', free: false },
        { title: 'UV Mapping', duration: '32:15', free: false },
        { title: 'Texturas procedurales', duration: '25:45', free: false },
      ]
    },
  ],
  requirements: [
    'Computadora con Windows, Mac o Linux',
    'Tarjeta gráfica compatible con OpenGL 3.3',
    'No se requiere experiencia previa en 3D'
  ],
  tags: ['Blender', 'Modelado 3D', 'Animación', 'Render', 'CGI']
};

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);
  const [isLiked, setIsLiked] = useState(false);

  // En producción, buscaríamos el curso por slug
  const course = MOCK_COURSE;

  const toggleSection = (index: number) => {
    setExpandedSections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-neutral-900 to-[#0a0a0a] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a cursos
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-full">
                  {course.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {course.title}
              </h1>

              <p className="text-lg text-neutral-400">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-neutral-400">({course.reviews} reseñas)</span>
                </div>
                <span className="text-neutral-400">{course.students.toLocaleString()} estudiantes</span>
              </div>

              <div className="flex items-center gap-4">
                <Image
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                  unoptimized
                />
                <div>
                  <p className="text-white font-medium">Creado por {course.instructor.name}</p>
                  <p className="text-sm text-neutral-400">{course.instructor.bio}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration} de contenido
                </span>
                <span className="flex items-center gap-1">
                  <PlayCircle className="w-4 h-4" />
                  {totalLessons} lecciones
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {course.level}
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Certificado incluido
                </span>
              </div>
            </div>

            {/* Card de compra */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
                <div className="aspect-video relative">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-white">${course.price}</span>
                    <span className="text-lg text-neutral-500 line-through">${course.originalPrice}</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded">
                      {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                    </span>
                  </div>

                  <button className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Comprar ahora
                  </button>

                  <button className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl transition-colors">
                    Añadir al carrito
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${isLiked ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      Guardar
                    </button>
                    <button className="flex-1 py-2 bg-neutral-800 text-neutral-400 hover:text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <Share2 className="w-4 h-4" />
                      Compartir
                    </button>
                  </div>

                  <div className="pt-4 border-t border-neutral-800 space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-neutral-400">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Acceso de por vida
                    </p>
                    <p className="flex items-center gap-2 text-neutral-400">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Certificado de finalización
                    </p>
                    <p className="flex items-center gap-2 text-neutral-400">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Garantía de 30 días
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            {/* Temario */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-amber-400" />
                Contenido del curso
              </h2>
              <p className="text-neutral-400 mb-6">
                {course.sections.length} secciones • {totalLessons} lecciones • {course.duration} de duración total
              </p>

              <div className="space-y-3">
                {course.sections.map((section, idx) => (
                  <div key={idx} className="bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden">
                    <button
                      onClick={() => toggleSection(idx)}
                      className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedSections.includes(idx) ? (
                          <ChevronUp className="w-5 h-5 text-neutral-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-neutral-400" />
                        )}
                        <span className="font-medium text-white">{section.title}</span>
                      </div>
                      <span className="text-sm text-neutral-400">{section.lessons.length} lecciones</span>
                    </button>

                    {expandedSections.includes(idx) && (
                      <div className="border-t border-neutral-800">
                        {section.lessons.map((lesson, lessonIdx) => (
                          <div
                            key={lessonIdx}
                            className="flex items-center justify-between px-4 py-3 hover:bg-neutral-800/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.free ? (
                                <PlayCircle className="w-4 h-4 text-amber-400" />
                              ) : (
                                <Lock className="w-4 h-4 text-neutral-500" />
                              )}
                              <span className="text-neutral-300">{lesson.title}</span>
                              {lesson.free && (
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                                  Gratis
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-neutral-500">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Requisitos */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Requisitos</h2>
              <ul className="space-y-2">
                {course.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-neutral-400">
                    <CheckCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </section>

            {/* Instructor */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Instructor</h2>
              <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
                <div className="flex items-start gap-4">
                  <Image
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    width={80}
                    height={80}
                    className="rounded-full"
                    unoptimized
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-white">{course.instructor.name}</h3>
                    <p className="text-neutral-400 mt-1">{course.instructor.bio}</p>
                    <div className="flex gap-6 mt-4 text-sm">
                      <div>
                        <p className="text-white font-semibold">{course.instructor.students.toLocaleString()}</p>
                        <p className="text-neutral-400">Estudiantes</p>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{course.instructor.courses}</p>
                        <p className="text-neutral-400">Cursos</p>
                      </div>
                      <div>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-current" />
                          {course.instructor.rating}
                        </p>
                        <p className="text-neutral-400">Calificación</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar con tags */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Temas del curso</h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-neutral-800 text-neutral-300 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
