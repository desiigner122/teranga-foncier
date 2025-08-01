import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Briefcase, BarChartHorizontalBig, ArrowRight, SearchCheck, PieChart, Network } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Helmet } from 'react-helmet-async';

const SolutionsInvestisseursPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleDashboardAccess = () => {
    if (isAuthenticated) {
      navigate('/solutions/investisseurs/dashboard');
    } else {
      navigate('/login', { state: { from: { pathname: '/solutions/investisseurs/dashboard' } } });
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
      icon: ShieldCheck,
      title: "Opportunités d'Investissement Vérifiées",
      description: "Investissez en toute confiance dans des terrains au statut juridique clair et au potentiel de valorisation. Chaque bien est rigoureusement vérifié par nos experts.",
      imageDesc: "Illustration conceptuelle épurée d'un document d'investissement sécurisé avec un sceau de vérification et une flèche de croissance stylisée, sur fond clair."
    },
    {
      icon: BarChartHorizontalBig,
      title: "Analyse de Rendement Potentiel (Simulée)",
      description: "Visualisez les perspectives de plus-value basées sur les tendances du marché, les projets de développement urbain et les analyses comparatives de zones similaires.",
      imageDesc: "Schéma illustratif abstrait et minimaliste de graphique de rendement avec des barres ascendantes stylisées et des icônes monétaires, sur fond neutre."
    },
    {
      icon: Briefcase,
      title: "Portefeuille Foncier Diversifié",
      description: "Accédez à une large gamme de terrains : résidentiels, commerciaux, industriels, agricoles ou touristiques. Diversifiez vos actifs fonciers en fonction de votre stratégie.",
      imageDesc: "Illustration conceptuelle minimaliste de différentes icônes de types de terrains (maison, usine, champ) stylisées et connectées, sur fond clair."
    },
    {
      icon: TrendingUp,
      title: "Accompagnement Stratégique Personnalisé",
      description: "Bénéficiez des conseils de nos experts pour identifier les meilleures opportunités, structurer vos acquisitions et optimiser votre stratégie d'investissement foncier au Sénégal.",
      imageDesc: "Illustration conceptuelle d'un conseiller et d'un investisseur stylisés et épurés discutant devant un graphique de croissance abstrait, sur fond neutre."
    }
  ];

  const processSteps = [
    { icon: SearchCheck, title: "Identifiez les opportunités", description: "Utilisez nos filtres avancés et nos alertes pour trouver les biens correspondant à votre profil d'investisseur." },
    { icon: PieChart, title: "Analysez le potentiel", description: "Accédez aux données de marché, aux simulations de rendement et aux rapports de diligence (simulés)." },
    { icon: Network, title: "Investissez en toute sécurité", description: "Profitez de notre processus sécurisé pour l'acquisition et la gestion de vos actifs fonciers." }
  ];


  return (
    <>
      <Helmet>
        <title>Solutions Investisseurs - Teranga Foncier</title>
        <meta name="description" content="Solutions d'investissement foncier au Sénégal. Découvrez des opportunités vérifiées, analysez le rendement potentiel et diversifiez votre portefeuille en toute sécurité." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-background"
      >
        <section className="py-16 md:py-24 text-center bg-red-600/10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container mx-auto px-4"
          >
            <TrendingUp className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-6 text-red-600" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-red-700 mb-4">
              Solutions d'Investissement Foncier
            </h1>
            <p className="text-lg md:text-xl text-red-800/80 max-w-3xl mx-auto">
              Teranga Foncier guide les investisseurs (particuliers et institutionnels) vers des opportunités foncières sécurisées et à fort potentiel au Sénégal.
            </p>
          </motion.div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-red-700">Maximisez Votre Retour sur Investissement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {features.map((feature, index) => (
                <motion.custom
                  key={index}
                  variants={featureVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  custom={index}
                  className="bg-card p-6 md:p-8 rounded-xl shadow-lg border border-red-200 hover:shadow-red-100 transition-shadow flex flex-col"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-red-500/10 rounded-full mr-4">
                      <feature.icon className="h-7 w-7 text-red-600" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed flex-grow">{feature.description}</p>
                   <div className="aspect-video bg-red-50 rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <img  className="max-h-full max-w-full object-contain" alt={feature.imageDesc} src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e" />
                  </div>
                </motion.custom>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-red-700">Votre Parcours d'Investissement Simplifié</h2>
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
                  <div className="p-4 bg-red-500/10 rounded-full mb-4">
                    <step.icon className="h-10 w-10 text-red-600" />
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
            <h3 className="text-2xl font-semibold text-center text-red-700 mb-6">Étude de Cas : Diaspora Invest (Simulation)</h3>
            <Card className="max-w-3xl mx-auto bg-card shadow-xl overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Un groupe d'investisseurs de la diaspora souhaitait acquérir un terrain commercial à Dakar. Via Teranga Foncier, ils ont accédé à des options vérifiées, analysé le potentiel de rendement du quartier des Almadies, et finalisé l'acquisition en 3 mois. Leur tableau de bord personnalisé leur permet de suivre la valorisation de leur actif et d'explorer d'autres opportunités.
                </p>
                <div className="flex justify-end">
                  <Button variant="link" className="text-red-600 hover:underline p-0">
                    Lire plus d'études de cas <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>


        <section className="py-16 md:py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-red-700">Faites Fructifier Votre Capital en Toute Confiance</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Explorez notre tableau de bord dédié aux investisseurs pour suivre vos actifs, analyser les performances et découvrir de nouvelles opportunités exclusives.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={handleDashboardAccess} className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
                Accéder au Dashboard Investisseur <BarChartHorizontalBig className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
             <p className="text-sm text-muted-foreground mt-4">Ou <Link to="/parcelles?type=investissement" className="underline hover:text-primary">consultez les terrains à potentiel d'investissement</Link>.</p>
          </div>
        </section>
      </motion.div>
    </>
  );
};

export default SolutionsInvestisseursPage;