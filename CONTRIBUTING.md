# Contribuir a LatamCreativa

¡Gracias por tu interés en contribuir a LatamCreativa! Este documento te guiará en el proceso.

## Requisitos Previos

- Node.js 20+
- npm o yarn
- Git

## Configuración del Entorno

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/latamcreativa-next.git
   cd latamcreativa-next
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Configura variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   Edita `.env.local` con tus credenciales de Supabase.

4. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

## Estructura del Proyecto

```
src/
├── app/          # App Router (páginas)
├── components/   # Componentes React
├── hooks/        # Custom hooks + Zustand store
├── services/     # API services (Supabase)
├── types/        # TypeScript types
├── utils/        # Utilidades
└── data/         # Datos estáticos
```

## Guía de Estilo

### TypeScript
- Usa tipos estrictos, evita `any`
- Documenta funciones públicas con JSDoc
- Define interfaces para props de componentes

### Componentes
- Usa componentes funcionales con hooks
- Prefiere composición sobre herencia
- Mantén componentes pequeños y enfocados

### Commits
Usamos [Conventional Commits](https://conventionalcommits.org/):

```
feat: agregar nueva funcionalidad
fix: corregir bug
docs: actualizar documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

## Flujo de Trabajo

1. **Crea una rama** desde `develop`
   ```bash
   git checkout -b feat/mi-nueva-funcionalidad
   ```

2. **Haz tus cambios** y asegúrate de que:
   - [ ] `npm run type-check` pasa sin errores
   - [ ] `npm run lint` no tiene warnings
   - [ ] `npm run test` todos los tests pasan
   - [ ] `npm run build` compila correctamente

3. **Envía un Pull Request** a `develop`

## Reportar Issues

Al reportar un bug, incluye:
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica
- Versión del navegador

## Código de Conducta

- Sé respetuoso y constructivo
- Acepta feedback con mente abierta
- Ayuda a otros contribuidores

## Licencia

Al contribuir, aceptas que tu código será licenciado bajo la misma licencia del proyecto.

---

¿Preguntas? Abre un issue o contacta al equipo.
