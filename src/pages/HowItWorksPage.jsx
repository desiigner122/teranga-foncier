import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Search, FileSearch, UserCheck, HeartHandshake as Handshake, FileText, Smile, ArrowRight, Settings2, Check, ListChecks } from 'lucide-react';

const buyerSteps = [
  { icon: Search, title: "1. Recherche Ciblée & Sélection Intuitive", description: "Explorez notre catalogue via des filtres puissants (zone, surface, type de bien, budget) ou naviguez sur notre carte interactive pour découvrir les parcelles qui correspondent précisément à vos critères. Enregistrez vos recherches pour des alertes personnalisées." },
  { icon: FileSearch, title: "2. Analyse Détaillée & Informations Clés", description: "Chaque fiche parcelle offre des photos de qualité, une description complète, et l'accès aux documents vérifiés disponibles (plan cadastral, certificat d'urbanisme, titre de propriété). Utilisez notre messagerie sécurisée pour poser vos questions à nos agents." },
  { icon: UserCheck, title: "3. Demande d'Intérêt & Vérification Accompagnée", description: "Exprimez votre intérêt pour une parcelle. Un agent Teranga Foncier dédié vous contactera rapidement pour valider votre profil, comprendre vos besoins spécifiques et planifier les prochaines étapes (visite, informations complémentaires)." },
  { icon: Handshake, title: "4. Négociation Transparente & Accord Sécurisé", description: "Votre agent vous accompagne et vous conseille durant la phase de négociation. Nous facilitons la rédaction des documents préliminaires (promesse de vente, offre d'achat) en collaboration avec les notaires partenaires pour sécuriser l'accord." },
  { icon: FileText, title: "5. Finalisation Juridique & Administrative Sereine", description: "Nous coordonnons toutes les démarches avec les notaires, le cadastre et les services administratifs pour la préparation et la signature de l'acte de vente authentique. Vous êtes informé à chaque étape." },
  { icon: Smile, title: "6. Devenez Propriétaire en Toute Confiance !", description: "Félicitations ! Vous recevez votre titre de propriété officiel. Teranga Foncier reste à votre disposition pour des conseils post-acquisition (mise en valeur, contacts utiles)." },
];

const verificationSteps = [
  "Vérification de l'identité du vendeur",
  "Contrôle du titre de propriété (TF, Bail, Délibération)",
  "Vérification de la situation au Cadastre",
  "Contrôle de l'état des droits réels (hypothèques, etc.)",
  "Vérification de la conformité au plan d'urbanisme",
  "Recherche de litiges en cours (mairie, tribunaux)",
  "Contrôle des taxes et impôts fonciers",
  "Visite physique et bornage contradictoire du terrain",
  "Validation du mandat de vente",
  "Rapport de synthèse de la diligence raisonnable"
];

const HowItWorksPage = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const listVariants = {
     hidden: { opacity: 0 },
     visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
   };

   const itemVariants = {
     hidden: { opacity: 0, y: 25, scale: 0.95 },
     visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
   };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-b from-background to-blue-50 dark:from-background dark:to-blue-900/20 min-h-screen"
    >
      <div className="container mx-auto py-16 px-4 space-y-16 md:space-y-24">
        {/* Hero Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="text-center pt-8"
        >
          <Settings2 className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Comment Ça Marche ?</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Acquérir un terrain au Sénégal n'a jamais été aussi simple, transparent et sécurisé. Découvrez notre processus optimisé pour vous.
          </p>
        </motion.section>

        {/* Buyer Steps Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-primary">Les Étapes Clés pour l'Acheteur</h2>
          <motion.div
            variants={listVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {buyerSteps.map((step, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full flex flex-col text-center p-6 border border-border/50 bg-card shadow-lg hover:shadow-primary/15 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="mb-5 inline-block mx-auto p-4 bg-primary/10 text-primary rounded-full ring-4 ring-primary/20">
                      <step.icon className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground text-sm flex-grow leading-relaxed">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Verification Process Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-card/50 dark:via-card/70 dark:to-card/50 rounded-xl p-8 md:p-12 shadow-xl border border-primary/20"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-primary flex items-center justify-center"><ListChecks className="mr-3 h-10 w-10"/>Notre Processus de Vérification en 10 Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {verificationSteps.map((step, index) => (
                <motion.div 
                    key={index} 
                    variants={itemVariants}
                    className="flex items-start p-3"
                >
                    <Check className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{step}</p>
                    </div>
                </motion.div>
              ))}
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="text-center py-10"
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-foreground">Prêt à trouver le terrain de vos rêves ?</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Commencez votre recherche dès maintenant et découvrez les meilleures opportunités foncières vérifiées au Sénégal.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="xl" asChild className="bg-gradient-to-r from-green-500 to-primary hover:opacity-90 text-white text-lg shadow-lg px-10 py-7">
              <Link to="/parcelles">Explorer les Parcelles Disponibles <ArrowRight className="ml-2.5 h-5 w-5" /></Link>
            </Button>
          </motion.div>
        </motion.section>

      </div>
    </motion.div>
  );
};

export default HowItWorksPage;
