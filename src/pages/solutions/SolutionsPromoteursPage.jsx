import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Search, FileCheck, TrendingUp, Users, ArrowRight, LayoutDashboard, BarChart2, UserCog, HeartHandshake as Handshake } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Helmet } from 'react-helmet-async';

const SolutionsPromoteursPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleDashboardAccess = () => {
    if (isAuthenticated) {
      if (user?.type === 'Promoteur') {
        navigate('/solutions/promoteurs/dashboard');
      } else {
        navigate('/dashboard'); 
      }
    } else {
      navigate('/login', { state: { from: { pathname: '/solutions/promoteurs/dashboard' } } });
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const features = [
    {
      icon: Search,
      title: "Identification de Terrains Stratégiques",
      description: "Accédez à un catalogue exclusif de terrains vérifiés, adaptés à vos projets résidentiels, commerciaux ou mixtes. Filtrez par zone, superficie, statut juridique et potentiel de développement.",
      imageDesc: "Illustration conceptuelle épurée d'une carte stylisée avec des icônes de localisation et des zones de développement mises en évidence, sur fond clair."
    },
    {
      icon: FileCheck,
      title: "Études de Faisabilité Accélérées (Simulées)",
      description: "Obtenez des informations clés sur la réglementation d'urbanisme, les contraintes techniques et le potentiel de marché pour chaque parcelle. Prenez des décisions éclairées plus rapidement.",
      imageDesc: "Schéma illustratif abstrait et minimaliste d'un rapport de faisabilité avec des graphiques stylisés et des icônes de validation, sur fond neutre."
    },
    {
      icon: TrendingUp,
      title: "Analyse de Potentiel et de Rentabilité",
      description: "Utilisez nos outils d'analyse (simulés) pour évaluer le potentiel de plus-value et la rentabilité de vos futurs projets en fonction des tendances du marché et des développements environnants.",
      imageDesc: "Illustration conceptuelle minimaliste d'un graphique de croissance stylisé avec des silhouettes de bâtiments abstraites en arrière-plan, sur fond clair."
    },
    {
      icon: Users,
      title: "Mise en Relation avec des Partenaires Clés",
      description: "Connectez-vous avec des propriétaires fonciers, des investisseurs, des architectes et d'autres acteurs essentiels de l'écosystème immobilier sénégalais via notre réseau.",
      imageDesc: "Illustration conceptuelle de silhouettes de professionnels stylisées et épurées se serrant la main, symbolisant le networking, sur fond neutre."
    }
  ];

  const processSteps = [
    { icon: BarChart2, title: "Analysez le marché", description: "Utilisez nos données et tendances pour identifier les zones à fort potentiel pour votre type de projet." },
    { icon: UserCog, title: "Configurez vos alertes", description: "Soyez notifié dès qu'un terrain correspondant à vos critères est disponible et vérifié." },
    { icon: Handshake, title: "Développez et Vendez", description: "Gérez vos projets, suivez leur avancement et connectez-vous à des acheteurs potentiels via la plateforme." }
  ];

  return (
    <>
      <Helmet>
        <title>Solutions Promoteurs Immobiliers - Teranga Foncier</title>
        <meta name="description" content="Solutions pour promoteurs immobiliers au Sénégal. Identifiez des terrains stratégiques, analysez le potentiel et optimisez vos projets de développement." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-background"
      >
        <section className="py-16 md:py-24 text-center bg-purple-600/10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container mx-auto px-4"
          >
            <Building2 className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-6 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-purple-700 mb-4">
              Solutions pour Promoteurs Immobiliers
            </h1>
            <p className="text-lg md:text-xl text-purple-800/80 max-w-3xl mx-auto">
              Teranga Foncier accompagne les promoteurs dans la recherche de terrains sécurisés et l'optimisation de leurs projets de développement au Sénégal.
            </p>
          </motion.div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-purple-700">Optimisez Vos Projets Immobiliers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {features.map((feature, index) => (
                <motion.custom
                  key={index}
                  variants={featureVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  custom={index}
                  className="bg-card p-6 md:p-8 rounded-xl shadow-lg border border-purple-200 hover:shadow-purple-100 transition-shadow flex flex-col"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-full mr-4">
                      <feature.icon className="h-7 w-7 text-purple-600" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed flex-grow">{feature.description}</p>
                   <div className="aspect-video bg-purple-50 rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <img  className="max-h-full max-w-full object-contain" alt={feature.imageDesc} src="https://images.unsplash.com/photo-1477426691505-4bf455d0e04e" />
                  </div>
                </motion.custom>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-purple-700">Fluidifiez Votre Cycle de Promotion</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {processSteps.map((step, index) => (
                <motion.custom
                  key={index}
                  variants={featureVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  custom={index + features.length}
                  className="bg-card p-6 rounded-xl shadow-lg text-center flex flex-col items-center"
                >
                  <div className="p-4 bg-purple-500/10 rounded-full mb-4">
                    <step.icon className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </motion.custom>
              ))}
            </div>
          </div>
        </section>

         <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-semibold text-center text-purple-700 mb-6">Étude de Cas : Les Bâtisseurs de Demain (Simulation)</h3>
            <Card className="max-w-3xl mx-auto bg-card shadow-xl overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  "Les Bâtisseurs de Demain", un promoteur axé sur les logements de standing, utilisait Teranga Foncier pour identifier des terrains à Diamniadio. La plateforme leur a permis de filtrer les options selon le potentiel de développement et la proximité des infrastructures. L'outil d'analyse de rentabilité (simulé) a aidé à sélectionner le terrain offrant le meilleur retour sur investissement. Leur projet "Les Terrasses de Diamniadio" est maintenant en cours de commercialisation.
                </p>
                <div className="flex justify-end">
                  <Button variant="link" className="text-purple-600 hover:underline p-0">
                    Lire plus d'études de cas <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-purple-700">Pilotez Vos Projets avec Efficacité</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Accédez à votre tableau de bord promoteur pour suivre vos acquisitions, gérer vos projets en cours et analyser les données de marché pertinentes.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={handleDashboardAccess} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
                Accéder au Dashboard Promoteur <LayoutDashboard className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
             <p className="text-sm text-muted-foreground mt-4">Ou <Link to="/parcelles?verified=true" className="underline hover:text-primary">explorez les terrains adaptés à la promotion</Link>.</p>
          </div>
        </section>
      </motion.div>
    </>
  );
};

export default SolutionsPromoteursPage;