import { AuthForm } from '@/components/auth/AuthForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Únete a la comunidad creativa de Latinoamérica',
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
