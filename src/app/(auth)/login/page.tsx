import { AuthForm } from '@/components/auth/AuthForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Inicia sesión en tu cuenta de LatamCreativa',
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
