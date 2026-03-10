import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Términos y Condiciones',
    description: 'Términos y condiciones de uso de la plataforma LatamCreativa.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-dark-950">
            <div className="max-w-3xl mx-auto px-6 py-16">
                <Link
                    href="/"
                    className="text-sm text-neutral-500 hover:text-white transition-colors mb-8 inline-block"
                >
                    ← Volver al inicio
                </Link>

                <h1 className="text-3xl font-bold text-white mb-2">Términos y Condiciones</h1>
                <p className="text-neutral-500 text-sm mb-12">Última actualización: Febrero 2026</p>

                <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">1. Aceptación de los Términos</h2>
                        <p>
                            Al acceder y utilizar LatamCreativa (&quot;la Plataforma&quot;), aceptas estar sujeto a estos
                            Términos y Condiciones. Si no estás de acuerdo con alguno de estos términos, no debes
                            utilizar la Plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">2. Descripción del Servicio</h2>
                        <p>
                            LatamCreativa es una plataforma comunitaria para profesionales creativos de Latinoamérica.
                            Ofrecemos herramientas para compartir portafolios, conectar con otros creativos, publicar
                            artículos, participar en foros de discusión, y acceder a oportunidades laborales.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">3. Registro y Cuenta</h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Debes proporcionar información veraz y actualizada al registrarte.</li>
                            <li>Eres responsable de mantener la confidencialidad de tu contraseña.</li>
                            <li>Debes tener al menos 16 años para crear una cuenta.</li>
                            <li>Una persona puede tener solo una cuenta activa.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">4. Contenido del Usuario</h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Conservas todos los derechos sobre el contenido que publicas.</li>
                            <li>Al publicar contenido, otorgas a LatamCreativa una licencia no exclusiva para mostrar,
                                distribuir y promocionar dicho contenido dentro de la Plataforma.</li>
                            <li>No debes publicar contenido que infrinja derechos de autor de terceros.</li>
                            <li>Nos reservamos el derecho de eliminar contenido que viole estos términos.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">5. Conducta del Usuario</h2>
                        <p className="mb-2">Los usuarios se comprometen a no:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Publicar contenido ofensivo, discriminatorio o ilegal.</li>
                            <li>Hacer spam o publicidad no autorizada.</li>
                            <li>Intentar acceder a cuentas de otros usuarios.</li>
                            <li>Utilizar la plataforma para actividades fraudulentas.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">6. Propiedad Intelectual</h2>
                        <p>
                            La Plataforma, incluyendo su diseño, código, logos y marcas, es propiedad de LatamCreativa.
                            No se permite la reproducción o distribución sin autorización previa.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">7. Limitación de Responsabilidad</h2>
                        <p>
                            LatamCreativa se proporciona &quot;tal cual&quot;. No garantizamos la disponibilidad
                            ininterrumpida del servicio ni nos hacemos responsables de pérdidas derivadas del uso
                            de la Plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">8. Modificaciones</h2>
                        <p>
                            Nos reservamos el derecho de modificar estos términos en cualquier momento.
                            Las modificaciones entrarán en vigor al ser publicadas en la Plataforma.
                            El uso continuado del servicio implica la aceptación de los términos modificados.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-white mb-3">9. Contacto</h2>
                        <p>
                            Para preguntas sobre estos términos, contáctanos en{' '}
                            <a href="mailto:legal@latamcreativa.com" className="text-accent-500 hover:text-accent-400 transition-colors">
                                legal@latamcreativa.com
                            </a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
