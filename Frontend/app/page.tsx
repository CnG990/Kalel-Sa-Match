'use client'

import Logo from './components/Logo'
import Image from 'next/image'

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Navigation */}
            <nav className="bg-white/90 backdrop-blur-sm shadow-lg fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <a href="/" className="flex items-center">
                                <Logo className="h-12 w-auto" />
                                <div className="ml-2 flex flex-col">
                                    <span className="text-xl font-bold text-kalel-primary">Kalèl sa</span>
                                    <span className="text-lg font-semibold text-kalel-secondary">Match</span>
                                </div>
                            </a>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a href="/docs" className="text-gray-600 hover:text-kalel-primary px-3 py-2 rounded-md text-sm font-medium">
                                Documentation
                            </a>
                            <a href="/connexion" className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition">
                                Connexion
                            </a>
                            <a href="/inscription" className="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">
                                Inscription
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative min-h-screen flex items-center justify-center">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/hero-bg.jpg"
                            alt="Terrain de mini-foot en Afrique"
                            fill
                            className="object-cover brightness-125"
                            priority
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-kalel-primary/30 to-kalel-primary/90"></div>
                    </div>
                    <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-16">
                        <div className="mb-8">
                            <Image
                                src="/logo sans background.png"
                                alt="Kalèl sa Match"
                                width={200}
                                height={200}
                                className="mx-auto"
                                priority
                            />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl shadow-black">
                            Réservez votre terrain à Dakar en un clic !
                        </h1>
                        <p className="text-xl md:text-2xl text-white mb-8 drop-shadow-md">
                            Trouvez, réservez et jouez sur les meilleurs terrains synthétiques
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <a
                                href="/inscription"
                                className="inline-block bg-white text-orange-500 border border-orange-500 px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-50 transform hover:scale-105 transition-all shadow-lg"
                            >
                                Créer un compte
                            </a>
                            <a
                                href="/docs"
                                className="inline-block bg-white text-orange-500 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg"
                            >
                                En savoir plus
                            </a>
                        </div>
                    </div>
                </section>

                {/* Comment ça marche */}
                <section className="py-20 bg-white">
                    <div className="max-w-6xl mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-16 text-kalel-primary">
                            Comment ça marche ?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="text-center shadow-md p-6 rounded-lg bg-white">
                                <div className="mb-6 bg-orange-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                    <span className="text-3xl font-bold text-kalel-primary">1</span>
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-kalel-primary">Inscrivez-vous</h3>
                                <p className="text-gray-600">Créez votre compte en quelques clics pour accéder à tous les terrains</p>
                            </div>
                            <div className="text-center shadow-md p-6 rounded-lg bg-white">
                                <div className="mb-6 bg-yellow-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                    <span className="text-3xl font-bold text-kalel-primary">2</span>
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-kalel-primary">Choisissez un terrain</h3>
                                <p className="text-gray-600">Parcourez notre sélection de terrains et trouvez celui qui vous convient</p>
                            </div>
                            <div className="text-center shadow-md p-6 rounded-lg bg-white">
                                <div className="mb-6 bg-green-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                    <span className="text-3xl font-bold text-kalel-primary">3</span>
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-kalel-primary">Réservez et jouez</h3>
                                <p className="text-gray-600">Payez en ligne et recevez votre confirmation instantanément</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
