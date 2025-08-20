import React from 'react';
import { useRealtime } from '@/context/RealtimeContext.jsx';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, ShieldCheck, BarChart3, FileSearch, Users, ArrowRight, CheckSquare, Settings2, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Helmet } from 'react-helmet-async';
import FundingRequestsPage from '@/pages/dashboards/banque/FundingRequestsPage'; // <<< CORRECTION DU CHEMIN ICI

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
      title: "�valuation Fiable des Garanties Fonci�res",
      description: "Acc�dez � des donn�es v�rifi�es et � des analyses de march� pour �valuer avec pr�cision la valeur des terrains propos�s en garantie. R�duisez vos risques et optimisez vos d�cisions de cr�dit.",
    },
    {
      icon: BarChart3,
      title: "Analyse de Portefeuille et Gestion des Risques",
      description: "Visualisez la composition de votre portefeuille foncier, identifiez les risques potentiels et prenez des d�cisions �clair�es gr�ce � des tableaux de bord intuitifs et des rapports d�taill�s.",
    },
    {
      icon: FileSearch,
      title: "Acc�s S�curis� aux Documents Officiels",
      description: "Consultez et v�rifiez les titres de propri�t�, les plans cadastraux et autres documents l�gaux directement depuis la plateforme, garantissant la conformit� et la transparence.",
    },
    {
      icon: Users,
      title: "Collaboration Simplifi�e avec les Notaires et Mairies",
      description: "Facilitez les �changes et les validations avec les acteurs cl�s de l'�cosyst�me foncier, acc�l�rant ainsi les processus d'authentification et d'enregistrement.",
    },
    {
      icon: CheckSquare,
      title: "Conformit� R�glementaire Automatis�e",
      description: "Assurez-vous que toutes vos op�rations respectent les r�glementations fonci�res s�n�galaises gr�ce � des outils de v�rification int�gr�s et des alertes en cas de non-conformit�.",
    },
    {
      icon: Settings2,
      title: "Personnalisation et Int�gration Facile",
      description: "Adaptez la plateforme � vos besoins sp�cifiques et int�grez-la facilement � vos syst�mes existants pour une gestion fonci�re centralis�e et efficace.",
    },
  ];

  const caseStudies = [
    {
      title: "Optimisation des Processus de Cr�dit Immobilier",
      description: "Une grande banque s�n�galaise a r�duit de 30% le temps de traitement des dossiers de cr�dit immobilier gr�ce � notre solution d'�valuation fonci�re rapide et fiable.",
      link: "#",
    },
    {
      title: "S�curisation des Portefeuilles de Garanties",
      description: "Une institution financi�re a minimis� ses risques de d�faut de paiement en utilisant nos outils d'analyse pr�dictive pour mieux �valuer la liquidit� des garanties fonci�res.",
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
        <meta name="description" content="D�couvrez comment Teranga Foncier aide les banques et institutions financi�res � s�curiser leurs garanties fonci�res au S�n�gal." />
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
            Teranga Foncier pour les Banques & Institutions Financi�res
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
          >
            S�curisez vos op�rations de cr�dit et optimisez la gestion de vos garanties fonci�res au S�n�gal.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Button size="lg" onClick={handleDashboardAccess} className="bg-white text-blue-700 hover:bg-blue-100 shadow-xl text-lg px-8 py-3 rounded-full">
              Acc�der au Dashboard <ArrowRight className="ml-2 h-5 w-5" />
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
            Nos Solutions Cl�s pour les Banques
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
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-blue-700">Renforcez Votre Expertise Fonci�re avec Nos Outils</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Acc�dez � un tableau de bord d�di� pour visualiser les �valuations, suivre les portefeuilles et g�rer les risques li�s aux garanties fonci�res.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" onClick={handleDashboardAccess} className="bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg">
              Acc�der au Dashboard Banques <BarChart3 className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
           <p className="text-sm text-muted-foreground mt-4">Ou <Link to="/contact?subject=SolutionsBanques" className="underline hover:text-primary">contactez-nous pour un partenariat</Link>.</p>
        </div>
      </section>

      {/* Testimonials/Case Studies Section */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-800 dark:text-blue-300">
            �tudes de Cas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {caseStudies.map((study, index) => (
              <Card key={index} className="p-6 shadow-lg rounded-lg border border-border">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold mb-3 text-blue-700 dark:text-blue-200">{study.title}</h3>
                  <p className="text-muted-foreground mb-4">{study.description}</p>
                  <div className="flex justify-end">
                    <Button variant="link" className="text-blue-600 hover:underline p-0">
                      Lire plus d'�tudes de cas <ArrowRight className="ml-1 h-4 w-4" />
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pr�t � Transformer Votre Gestion Fonci�re ?</h2>
          <p className="text-lg md:text-xl mb-8 max-w-xl mx-auto">
            Contactez notre �quipe pour une d�monstration personnalis�e de nos solutions pour les banques.
          </p>
          <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-100 shadow-xl text-lg px-8 py-3 rounded-full">
            <Link to="/contact?subject=D�monstrationBanques">Demander une D�monstration <Share2 className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </motion.div>
  );
};

export default SolutionsBanquesPage;

