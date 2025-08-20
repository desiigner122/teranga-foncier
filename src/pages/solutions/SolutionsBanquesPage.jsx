import React from 'react';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, BarChart3, FileSearch, Users, ArrowRight, CheckSquare, Settings2, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Helmet } from 'react-helmet-async';
import FundingRequestsPage from '@/pages/dashboards/banque/FundingRequestsPage';// <<< CORRECTION DU CHEMIN ICI

const SolutionsBanquesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleDashboardAccess = () => {
    if (isAuthenticated) {
      navigate('/solutions/banques/dashboard');
    } else {
      navigate('/login', { state: { from: { pathname: '/solutions/banques/dashboard' } } });
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
      title: "évaluation Fiable des Garanties Fonciéres",
      description: "Accédez é des données vérifiées et é des analyses de marché pour évaluer avec précision la valeur des terrains proposés en garantie. Réduisez vos risques et optimisez vos décisions de crédit.",
    },
    {
      icon: BarChart3,
      title: "Analyse de Portefeuille et Gestion des Risques",
      description: "Visualisez la composition de votre portefeuille foncier, identifiez les risques potentiels et prenez des décisions éclairées gréce é des tableaux de bord intuitifs et des rapports détaillés.",
    },
    {
      icon: FileSearch,
      title: "Accés Sécurisé aux Documents Officiels",
      description: "Consultez et vérifiez les titres de propriété, les plans cadastraux et autres documents légaux directement depuis la plateforme, garantissant la conformité et la transparence.",
    },
    {
      icon: Users,
      title: "Collaboration Simplifiée avec les Notaires et Mairies",
      description: "Facilitez les échanges et les validations avec les acteurs clés de l'écosystéme foncier, accélérant ainsi les processus d'authentification et d'enregistrement.",
    },
    {
      icon: CheckSquare,
      title: "Conformité Réglementaire Automatisée",
      description: "Assurez-vous que toutes vos opérations respectent les réglementations fonciéres sénégalaises gréce é des outils de vérification intégrés et des alertes en cas de non-conformité.",
    },
    {
      icon: Settings2,
      title: "Personnalisation et Intégration Facile",
      description: "Adaptez la plateforme é vos besoins spécifiques et intégrez-la facilement é vos systémes existants pour une gestion fonciére centralisée et efficace.",
    },
  ];

  const caseStudies = [
    {
      title: "Optimisation des Processus de Crédit Immobilier",
      description: "Une grande banque sénégalaise a réduit de 30% le temps de traitement des dossiers de crédit immobilier gréce é notre solution d'évaluation fonciére rapide et fiable.",
      link: "#",
    },
    {
      title: "Sécurisation des Portefeuilles de Garanties",
      description: "Une institution financiére a minimisé ses risques de défaut de paiement en utilisant nos outils d'analyse prédictive pour mieux évaluer la liquidité des garanties fonciéres.",
      link: "#",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground"
    >
      <Helmet>
        <title>Solutions pour Banques - Teranga Foncier</title>
        <meta name="description" content="Découvrez comment Teranga Foncier aide les banques et institutions financiéres é sécuriser leurs garanties fonciéres au Sénégal." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 to-sky-500 text-white py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight"
          >
            Teranga Foncier pour les Banques & Institutions Financiéres
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
          >
            Sécurisez vos opérations de crédit et optimisez la gestion de vos garanties fonciéres au Sénégal.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Button size="lg" onClick={handleDashboardAccess} className="bg-white text-blue-700 hover:bg-blue-100 shadow-xl text-lg px-8 py-3 rounded-full">
              Accéder au Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
        {/* Background pattern */}
        <div className="absolute inset-0 z-0 opacity-20">
          <svg className="w-full h-full" fill="none" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <path d="M0 0h100v100H0z" fill="url(#grid)" />
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M10 0L0 0 0 10" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="0.5" />
              </pattern>
            </defs>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-800 dark:text-blue-300">
            Nos Solutions Clés pour les Banques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={featureVariants}
                className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-border"
              >
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-blue-700 dark:text-blue-200">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action - Dashboard Access */}
      <section className="py-16 md:py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-blue-700">Renforcez Votre Expertise Fonciére avec Nos Outils</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Accédez é un tableau de bord dédié pour visualiser les évaluations, suivre les portefeuilles et gérer les risques liés aux garanties fonciéres.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" onClick={handleDashboardAccess} className="bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg">
              Accéder au Dashboard Banques <BarChart3 className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
           <p className="text-sm text-muted-foreground mt-4">Ou <Link to="/contact?subject=SolutionsBanques" className="underline hover:text-primary">contactez-nous pour un partenariat</Link>.</p>
        </div>
      </section>

      {/* Testimonials/Case Studies Section */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-800 dark:text-blue-300">
            études de Cas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {caseStudies.map((study, index) => (
              <Card key={index} className="p-6 shadow-lg rounded-lg border border-border">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold mb-3 text-blue-700 dark:text-blue-200">{study.title}</h3>
                  <p className="text-muted-foreground mb-4">{study.description}</p>
                  <div className="flex justify-end">
                    <Button variant="link" className="text-blue-600 hover:underline p-0">
                      Lire plus d'études de cas <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-20 bg-blue-700 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prét é Transformer Votre Gestion Fonciére ?</h2>
          <p className="text-lg md:text-xl mb-8 max-w-xl mx-auto">
            Contactez notre équipe pour une démonstration personnalisée de nos solutions pour les banques.
          </p>
          <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-100 shadow-xl text-lg px-8 py-3 rounded-full">
            <Link to="/contact?subject=DémonstrationBanques">Demander une Démonstration <Share2 className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </motion.div>
  );
};

export default SolutionsBanquesPage;

