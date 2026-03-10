CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    company_logo TEXT,
    location TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Tiempo completo', 'Medio tiempo', 'Freelance', 'Contrato')),
    remote BOOLEAN DEFAULT false,
    salary_min NUMERIC(10,2),
    salary_max NUMERIC(10,2),
    salary_currency TEXT DEFAULT 'USD',
    salary_hourly BOOLEAN DEFAULT false,
    skills TEXT[] DEFAULT '{}',
    description TEXT,
    featured BOOLEAN DEFAULT false,
    applicants INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
    posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Jobs are publicly readable" ON jobs;
CREATE POLICY "Jobs are publicly readable" ON jobs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can create jobs" ON jobs;
CREATE POLICY "Authenticated users can create jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Job creators can update their jobs" ON jobs;
CREATE POLICY "Job creators can update their jobs" ON jobs FOR UPDATE USING (auth.uid() = posted_by);
DROP POLICY IF EXISTS "Job creators can delete their jobs" ON jobs;
CREATE POLICY "Job creators can delete their jobs" ON jobs FOR DELETE USING (auth.uid() = posted_by);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(job_id, applicant_id)
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own applications" ON job_applications;
CREATE POLICY "Users can see their own applications" ON job_applications FOR SELECT USING (auth.uid() = applicant_id OR auth.uid() = (SELECT posted_by FROM jobs WHERE id = job_id));
DROP POLICY IF EXISTS "Users can apply to jobs" ON job_applications;
CREATE POLICY "Users can apply to jobs" ON job_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE TABLE IF NOT EXISTS freelancer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    title TEXT NOT NULL,
    location TEXT,
    hourly_rate NUMERIC(10,2),
    skills TEXT[] DEFAULT '{}',
    available BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    rating NUMERIC(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    bio TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_available ON freelancer_profiles(available) WHERE available = true;
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_featured ON freelancer_profiles(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_rating ON freelancer_profiles(rating DESC);

ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Freelancer profiles are publicly readable" ON freelancer_profiles;
CREATE POLICY "Freelancer profiles are publicly readable" ON freelancer_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage their own freelancer profile" ON freelancer_profiles;
CREATE POLICY "Users can manage their own freelancer profile" ON freelancer_profiles FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    instructor_name TEXT NOT NULL,
    instructor_avatar TEXT,
    image TEXT,
    category TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('Principiante', 'Intermedio', 'Avanzado')),
    duration TEXT,
    lessons INTEGER DEFAULT 0,
    students INTEGER DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 0,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    original_price NUMERIC(10,2),
    featured BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published courses are publicly readable" ON courses;
CREATE POLICY "Published courses are publicly readable" ON courses FOR SELECT USING (status = 'published' OR auth.uid() = instructor_id);
DROP POLICY IF EXISTS "Instructors can manage their courses" ON courses;
CREATE POLICY "Instructors can manage their courses" ON courses FOR ALL USING (auth.uid() = instructor_id);

CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id, student_id)
);

ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can see their enrollments" ON course_enrollments;
CREATE POLICY "Students can see their enrollments" ON course_enrollments FOR SELECT USING (auth.uid() = student_id OR auth.uid() = (SELECT instructor_id FROM courses WHERE id = course_id));
DROP POLICY IF EXISTS "Students can enroll" ON course_enrollments;
CREATE POLICY "Students can enroll" ON course_enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE TABLE IF NOT EXISTS contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    prize TEXT,
    deadline TIMESTAMPTZ,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'ended')),
    featured BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contests_category ON contests(category);
CREATE INDEX IF NOT EXISTS idx_contests_featured ON contests(featured) WHERE featured = true;

ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contests are publicly readable" ON contests;
CREATE POLICY "Contests are publicly readable" ON contests FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage contests" ON contests;
CREATE POLICY "Admins can manage contests" ON contests FOR ALL USING (auth.uid() = created_by);

CREATE TABLE IF NOT EXISTS contest_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    submission_url TEXT,
    submission_notes TEXT,
    is_winner BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(contest_id, user_id)
);

ALTER TABLE contest_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants visible to all" ON contest_participants;
CREATE POLICY "Participants visible to all" ON contest_participants FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can participate" ON contest_participants;
CREATE POLICY "Users can participate" ON contest_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS collaborative_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    roles_needed TEXT[] DEFAULT '{}',
    members INTEGER DEFAULT 1,
    max_members INTEGER DEFAULT 10,
    deadline TEXT,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'in_progress', 'completed')),
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collab_projects_status ON collaborative_projects(status);
CREATE INDEX IF NOT EXISTS idx_collab_projects_category ON collaborative_projects(category);
CREATE INDEX IF NOT EXISTS idx_collab_projects_author ON collaborative_projects(author_id);

ALTER TABLE collaborative_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Collaborative projects are publicly readable" ON collaborative_projects;
CREATE POLICY "Collaborative projects are publicly readable" ON collaborative_projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can create collab projects" ON collaborative_projects;
CREATE POLICY "Authenticated users can create collab projects" ON collaborative_projects FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Authors can update their collab projects" ON collaborative_projects;
CREATE POLICY "Authors can update their collab projects" ON collaborative_projects FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Authors can delete their collab projects" ON collaborative_projects;
CREATE POLICY "Authors can delete their collab projects" ON collaborative_projects FOR DELETE USING (auth.uid() = author_id);

CREATE TABLE IF NOT EXISTS collab_project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES collaborative_projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, user_id)
);

ALTER TABLE collab_project_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Collab members visible to all" ON collab_project_members;
CREATE POLICY "Collab members visible to all" ON collab_project_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can join collab projects" ON collab_project_members;
CREATE POLICY "Users can join collab projects" ON collab_project_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_id);

ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Follows are publicly readable" ON followers;
CREATE POLICY "Follows are publicly readable" ON followers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can follow" ON followers;
CREATE POLICY "Users can follow" ON followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
DROP POLICY IF EXISTS "Users can unfollow" ON followers;
CREATE POLICY "Users can unfollow" ON followers FOR DELETE USING (auth.uid() = follower_id);

INSERT INTO jobs (title, company, company_logo, location, type, remote, salary_min, salary_max, salary_currency, salary_hourly, skills, description, featured, applicants) VALUES
('Senior 3D Artist', 'Pixelworks Studio', 'https://ui-avatars.com/api/?name=Pixelworks&background=6366f1&color=fff', 'Ciudad de México, México', 'Tiempo completo', true, 3000, 5000, 'USD', false, '{"Blender","Maya","ZBrush","Substance Painter"}', 'Buscamos un artista 3D senior para unirse a nuestro equipo de desarrollo de videojuegos.', true, 45),
('UI/UX Designer', 'TechLatam', 'https://ui-avatars.com/api/?name=TechLatam&background=10b981&color=fff', 'Buenos Aires, Argentina', 'Tiempo completo', true, 2500, 4000, 'USD', false, '{"Figma","Diseño UI","Prototipado","Investigación UX"}', 'Únete a nuestro equipo de producto para diseñar experiencias digitales increíbles.', false, 78),
('Motion Graphics Designer', 'Creative Agency', 'https://ui-avatars.com/api/?name=Creative+Agency&background=ec4899&color=fff', 'Bogotá, Colombia', 'Freelance', true, 30, 50, 'USD', true, '{"After Effects","Cinema 4D","Premiere Pro"}', 'Buscamos motion designer freelance para proyectos de publicidad y branding.', true, 32),
('Game Developer - Unity', 'IndieGames Latam', 'https://ui-avatars.com/api/?name=IndieGames&background=f59e0b&color=fff', 'Santiago, Chile', 'Tiempo completo', false, 2000, 3500, 'USD', false, '{"Unity","C#","Diseño de Juegos","Multijugador"}', 'Desarrollador de juegos con experiencia en Unity para proyecto indie.', false, 56),
('Product Designer (UX/UI)', 'Finanzas LATAM', 'https://ui-avatars.com/api/?name=Finanzas+LATAM&background=0ea5e9&color=fff', 'São Paulo, Brasil', 'Tiempo completo', true, 3500, 6000, 'USD', false, '{"Figma","Diseño de Producto","Design System","Investigación UX"}', 'Diseñador de producto para fintech en rápido crecimiento.', true, 112),
('Frontend Developer (React)', 'DevsLatam Co.', 'https://ui-avatars.com/api/?name=DevsLatam&background=3b82f6&color=fff', 'Quito, Ecuador', 'Tiempo completo', true, 2800, 4500, 'USD', false, '{"React","TypeScript","TailwindCSS","Next.js"}', 'Desarrollador frontend para plataforma SaaS educativa.', false, 94)
ON CONFLICT DO NOTHING;

INSERT INTO courses (slug, title, description, instructor_name, instructor_avatar, image, category, level, duration, lessons, students, rating, price, original_price, featured, tags) VALUES
('blender-desde-cero', 'Blender desde Cero', 'Aprende modelado 3D, texturizado y animación con Blender 4.0', 'Carlos Mendoza', 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=6366f1&color=fff', 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&h=450&fit=crop', '3D & CGI', 'Principiante', '24 horas', 48, 1234, 4.9, 49.99, 99.99, true, '{"Blender","Modelado 3D","Animación"}'),
('motion-graphics-after-effects', 'Motion Graphics con After Effects', 'Domina las técnicas de animación y efectos visuales profesionales', 'María García', 'https://ui-avatars.com/api/?name=Maria+Garcia&background=ec4899&color=fff', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=450&fit=crop', 'Animación', 'Intermedio', '18 horas', 36, 892, 4.8, 39.99, 79.99, false, '{"After Effects","Motion","Animación"}'),
('react-next-profesional', 'React & Next.js Profesional', 'Desarrollo web moderno con React 18 y Next.js 14', 'Diego Fernández', 'https://ui-avatars.com/api/?name=Diego+Fernandez&background=10b981&color=fff', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop', 'Desarrollo', 'Avanzado', '32 horas', 64, 2156, 4.95, 59.99, 129.99, true, '{"React","Next.js","TypeScript"}'),
('ilustracion-digital', 'Ilustración Digital Profesional', 'Técnicas avanzadas de ilustración en Procreate y Photoshop', 'Ana López', 'https://ui-avatars.com/api/?name=Ana+Lopez&background=f59e0b&color=fff', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=450&fit=crop', 'Arte 2D', 'Intermedio', '20 horas', 40, 678, 4.7, 44.99, 89.99, false, '{"Procreate","Photoshop","Ilustración"}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO contests (title, description, image, prize, deadline, category, status, featured) VALUES
('Desafío de Character Design 2024', 'Diseña un personaje original inspirado en la fauna latinoamericana.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80', '$500 USD', now() + interval '21 days', 'Ilustración', 'active', true),
('Logo Design Challenge', 'Crea un logotipo moderno para una startup de tecnología sustentable en LATAM.', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=80', '$300 USD', now() + interval '14 days', 'Diseño', 'active', false),
('Render CGI: Arquitectura Futurista', 'Imagina cómo serán las ciudades de Latinoamérica en 2050.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80', '$750 USD', now() + interval '30 days', '3D & CGI', 'active', false),
('Motion Graphics: Identidad Cultural', 'Crea una pieza de motion graphics de 15-30 segundos que capture la esencia cultural de tu país.', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80', '$400 USD', now() + interval '7 days', 'Animación', 'active', false),
('Branding Completo para ONG', 'Crea una identidad visual completa para una ONG dedicada a la educación digital.', 'https://images.unsplash.com/photo-1561070791-36c11767b26a?w=800&auto=format&fit=crop&q=80', '$600 USD', now() + interval '10 days', 'Diseño', 'active', false)
ON CONFLICT DO NOTHING;

INSERT INTO collaborative_projects (title, description, image, roles_needed, members, max_members, deadline, category, status, author_id) VALUES
('Cortometraje Animado: "Raíces"', 'Buscamos animadores 2D/3D, ilustradores de fondos y compositores musicales para un cortometraje sobre identidad cultural.', 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80', '{"Animador 3D","Ilustrador","Compositor"}', 8, 12, '15 días', 'Animación', 'open', (SELECT id FROM auth.users LIMIT 1)),
('App Móvil: Guía Turística AR', 'Proyecto de realidad aumentada para turismo en ciudades históricas de LATAM.', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80', '{"Desarrollador","Ilustrador"}', 4, 8, '30 días', 'Desarrollo', 'open', (SELECT id FROM auth.users LIMIT 1)),
('Videojuego Indie: "Selva Mágica"', 'RPG 2D ambientado en la selva amazónica con mecánicas de exploración y magia natural.', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80', '{"Game Designer","Ilustrador","Compositor"}', 6, 10, '45 días', 'Videojuegos', 'open', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;
