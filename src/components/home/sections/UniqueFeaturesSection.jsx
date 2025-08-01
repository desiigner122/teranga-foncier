import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, MapPinned, BellRing, FileLock2, Users2, CheckSquare } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: "Vérification Cadastrale Multi-Niveaux",
    description: "Nous examinons chaque titre foncier, bail, et délibération auprès des autorités compétentes (cadastre, domaines, mairies) pour garantir l'authenticité et l'absence de litiges.",
    color: "text-green-600",
    bgColor: "bg-green-100/50",
  },
  {
    icon: MapPinned,
    title: "Carte Interactive Intelligente",
    description: "Visualisez les parcelles avec des filtres avancés (zone, superficie, prix) et des couches d'informations contextuelles (écoles, commerces, projets d'infrastructures à proximité - simulé).",
    color: "text-blue-600",
    bgColor: "bg-blue-100/50",
  },
  {
    icon: BellRing,
    title: "Alertes Personnalisées en Temps Réel",
    description: "Soyez notifié instantanément des nouvelles parcelles correspondant à vos critères, des baisses de prix ou des changements de statut importants pour ne manquer aucune opportunité.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100/50",
  },
  {
    icon: FileLock2,
    title: "Espace Documentaire Sécurisé",
    description: "Accédez à tous les documents vérifiés relatifs à votre transaction (titres, plans, rapports de vérification) dans un espace personnel en ligne, crypté et confidentiel.",
    color: "text-purple-600",
    bgColor: "bg-purple-100/50",
  },
  {
    icon: Users2,
    title: "Accompagnement Juridique Intégré",
    description: "Bénéficiez de notre réseau de notaires et juristes partenaires pour vous conseiller et sécuriser toutes les étapes légales de votre acquisition, de la promesse de vente à l'acte final.",
    color: "text-red-600",
    bgColor: "bg-red-100/50",
  },
  {
    icon: CheckSquare,
    title: "Processus Simplifié et Transparent",
    description: "Suivez l'avancement de votre dossier en ligne, communiquez facilement avec nos agents et comprenez chaque étape grâce à une plateforme intuitive et des explications claires.",
    color: "text-teal-600",
    bgColor: "bg-teal-100/50",
  }
];

const UniqueFeaturesSection = () => {
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="container mx-auto px-4">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="text-center mb-10 md:mb-14"
      >
        <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-primary mb-3">
          Ce qui Rend Teranga Foncier Unique
        </motion.h2>
        <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Nous allons au-delà d'une simple plateforme d'annonces. Découvrez les fonctionnalités conçues pour votre sécurité et votre tranquillité d'esprit.
        </motion.p>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={itemVariants} className="h-full">
            <Card className="h-full flex flex-col text-center shadow-sm hover:shadow-md transition-shadow duration-300 border rounded-xl overflow-hidden">
              <CardHeader className="items-center pt-6 pb-4">
                <div className={`p-3.5 rounded-full ${feature.bgColor} ${feature.color} mb-3 inline-block ring-2 ring-current/30`}>
                  <feature.icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <CardTitle className="text-lg md:text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default UniqueFeaturesSection;