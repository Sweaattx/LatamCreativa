import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Política de Privacidad',
    description: 'Política de privacidad y protección de datos de LatamCreativa.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-dark-950">
            <div className="max-w-3xl mx-auto px-6 py-16">
                <Link
                    href="/"
                    className="text-sm text-neutral-500 hover:text-white transition-colors mb-8 inline-block"
                >
                    ← Volver al inicio
                </Link>

                <h1 className="text-3xl font-bold text-white mb-2">Política de Privacidad</h1>
                <p className="text-neutral-500 text-sm mb-12">Última actualización: Febrero 2026</p>

                <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">1. Información que Recopilamos</h2>
                        <p className="mb-2">Recopilamos los siguientes tipos de información:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Información de registro:</strong> nombre, correo electrónico, contraseña (encriptada), y foto de perfil opcional.</li>
                            <li><strong>Contenido del usuario:</strong> proyectos, artículos, comentarios y demás contenido que publiques.</li>
                            <li><strong>Datos de uso:</strong> páginas visitadas, interacciones dentro de la plataforma, y preferencias.</li>
                            <li><strong>Información técnica:</strong> dirección IP, tipo de navegador, y dispositivo utilizado.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">2. Uso de la Información</h2>
                        <p className="mb-2">Utilizamos tu información para:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Proporcionar y mantener el servicio de la Plataforma.</li>
                            <li>Personalizar la experiencia del usuario.</li>
                            <li>Enviar notificaciones relevantes sobre actividad en tu cuenta.</li>
                            <li>Mejorar la Plataforma mediante análisis de uso agregado.</li>
                            <li>Prevenir fraude y garantizar la seguridad del servicio.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">3. Compartición de Datos</h2>
                        <p>
                            No vendemos ni compartimos tu información personal con terceros para fines comerciales.
                            Podemos compartir datos con:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mt-2">
                            <li><strong>Proveedores de servicios:</strong> como alojamiento (Cloudflare), autenticación (Supabase), y almacenamiento de archivos.</li>
                            <li><strong>Requerimientos legales:</strong> si es necesario para cumplir con la ley o responder a procesos legales.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">4. Seguridad de los Datos</h2>
                        <p>
                            Implementamos medidas de seguridad estándar de la industria para proteger tu información,
                            incluyendo encriptación de contraseñas, comunicaciones HTTPS, y acceso restringido a los datos.
                            Sin embargo, ningún sistema es 100% seguro.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">5. Tus Derechos</h2>
                        <p className="mb-2">Tienes derecho a:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Acceder a tu información personal almacenada.</li>
                            <li>Solicitar la corrección de datos inexactos.</li>
                            <li>Solicitar la eliminación de tu cuenta y datos asociados.</li>
                            <li>Exportar tu contenido publicado.</li>
                            <li>Retirar tu consentimiento en cualquier momento.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">6. Cookies</h2>
                        <p>
                            Utilizamos cookies esenciales para el funcionamiento del servicio, incluyendo cookies
                            de autenticación de sesión. No utilizamos cookies de seguimiento de terceros con fines
                            publicitarios.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">7. Retención de Datos</h2>
                        <p>
                            Mantenemos tu información mientras tu cuenta esté activa. Si solicitas la eliminación
                            de tu cuenta, eliminaremos tus datos personales dentro de 30 días, aunque algunos datos
                            agregados y anonimizados podrán conservarse para análisis.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">8. Menores de Edad</h2>
                        <p>
                            La Plataforma no está dirigida a menores de 16 años. No recopilamos intencionalmente
                            información de menores de esta edad.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">9. Cambios en esta Política</h2>
                        <p>
                            Podemos actualizar esta política de privacidad periódicamente. Te notificaremos de
                            cambios significativos por correo electrónico o mediante un aviso en la Plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">10. Contacto</h2>
                        <p>
                            Para ejercer tus derechos o realizar consultas sobre privacidad, escríbenos a{' '}
                            <a href="mailto:privacidad@latamcreativa.com" className="text-accent-500 hover:text-accent-400 transition-colors">
                                privacidad@latamcreativa.com
                            </a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
