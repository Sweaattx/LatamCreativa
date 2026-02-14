# LatamCreativa Next.js

Plataforma de comunidad creativa para artistas y desarrolladores de Latinoamérica.

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 16.1.6 | Framework React con SSR |
| React | 19.0.0 | UI Library |
| TypeScript | 5.7.2 | Type safety |
| Supabase | 2.49.1 | Backend-as-a-Service |
| Zustand | 5.0.3 | State management |
| TanStack Query | 5.66.0 | Server state |
| TailwindCSS | 3.4.17 | Styling |
| TipTap | 2.14.0 | Rich text editor |

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/latamcreativa-next.git
cd latamcreativa-next

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con credenciales de Supabase

# Iniciar desarrollo
npm run dev
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Ejecutar ESLint |
| `npm run type-check` | Verificar tipos TypeScript |
| `npm run test` | Ejecutar tests con Vitest |
| `npm run test:watch` | Tests en modo watch |

## Estructura del Proyecto

```
src/
├── app/          # App Router (páginas)
│   ├── (auth)/   # Rutas de autenticación
│   └── (main)/   # Rutas principales
├── components/   # Componentes React
├── hooks/        # Custom hooks + Zustand store
├── services/     # API services (Supabase)
├── types/        # TypeScript types
├── utils/        # Utilidades
└── data/         # Datos estáticos
```

## Características

- 🎨 **Portafolio** - Muestra tus proyectos creativos
- 📝 **Blog** - Artículos y tutoriales
- 💬 **Foro** - Comunidad de discusión
- 👤 **Perfiles** - Sistema de usuarios completo
- 🔍 **Búsqueda** - Encuentra contenido y usuarios
- 🌐 **Bilingüe** - Soporte para Creative y Dev domains

## Contribuir

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para guía de contribución.

## Licencia

MIT
