import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageSquare, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const faqData = [
  {
    question: "Comment Teranga Foncier vérifie-t-il l'authenticité des parcelles ?",
    answer: "Notre processus est rigoureux. Chaque parcelle subit une vérification documentaire approfondie auprès des services compétents (cadastre, domaines, mairies). Nous analysons les titres de propriété (titre foncier, bail, délibération), les plans cadastraux, et nous nous assurons de l'absence de litiges connus. Des visites sur site peuvent compléter ces vérifications pour confirmer les limites et l'état du terrain. Notre but est de vous offrir une tranquillité d'esprit maximale."
  },
  {
    question: "Quels sont les frais de service de Teranga Foncier et que couvrent-ils ?",
    answer: "La transparence est clé. Nos frais de service sont communiqués clairement avant toute transaction. Ils couvrent les coûts de vérification approfondie, l'expertise de nos agents fonciers qui vous accompagnent, la sécurisation du processus administratif, l'utilisation de notre plateforme technologique, et la mise en relation avec des professionnels (notaires, géomètres). Ils sont généralement un pourcentage du prix de vente ou un forfait pour certains services. N'hésitez pas à demander un devis personnalisé."
  },
  {
    question: "Je vis à l'étranger (diaspora), puis-je acheter un terrain via Teranga Foncier ?",
    answer: "Absolument ! Teranga Foncier est spécifiquement conçu pour faciliter l'acquisition foncière pour la diaspora sénégalaise. Nous vous guidons à travers les démarches à distance, y compris la mise en place de procurations sécurisées si nécessaire, les transferts de fonds, et la représentation par nos agents sur place. Notre objectif est de rendre l'investissement aussi simple et sûr que si vous étiez au Sénégal."
  },
  {
    question: "Quels documents sont nécessaires pour l'achat d'un terrain ?",
    answer: "Les documents varient, mais typiquement : une pièce d'identité en cours de validité (carte d'identité nationale ou passeport), un justificatif de domicile récent. Pour les sociétés, des documents supplémentaires (registre de commerce, statuts) sont requis. Nos agents vous fourniront une liste précise et vous aideront à rassembler tous les éléments nécessaires pour le notaire."
  },
  {
    question: "Comment puis-je proposer mon terrain à la vente sur votre plateforme ?",
    answer: "C'est simple ! Créez un compte vendeur, puis utilisez la section 'Vendre un Bien' de votre tableau de bord. Vous devrez fournir des informations détaillées sur votre terrain (localisation, superficie, type de titre) et télécharger les documents de propriété (titre foncier, bail, plan, etc.). Notre équipe vérifiera les informations avant de publier votre annonce et vous contactera pour les prochaines étapes."
  },
   {
    question: "Quel est le rôle exact du notaire dans une transaction immobilière au Sénégal ?",
    answer: "Le notaire est un officier public indispensable qui sécurise et authentifie la transaction. Il rédige l'acte de vente final après avoir vérifié la conformité légale de tous les documents, s'assure du paiement des taxes et droits d'enregistrement (droits de mutation), et inscrit la transaction au conservatoire foncier. Il protège les intérêts de l'acheteur et du vendeur. Nous travaillons en étroite collaboration avec un réseau de notaires partenaires de confiance."
  },
  {
    question: "Quelles garanties Teranga Foncier offre-t-elle contre les litiges ?",
    answer: "Bien que nous ne puissions garantir à 100% l'absence de litiges futurs (le risque zéro n'existe pas), notre processus de vérification approfondie vise à minimiser drastiquement ce risque. Nous vérifions les antécédents, l'état des charges et hypothèques potentielles. En cas de doute, nous vous en informons et pouvons suspendre la transaction. Notre mission est de vous fournir toutes les informations pour une décision éclairée."
  }
];

const FaqPage = () => {
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6 } },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.4 }
    }),
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="container mx-auto py-16 px-4 max-w-4xl"
    >
      <motion.div variants={itemVariants} custom={0} className="text-center mb-12 md:mb-16">
        <HelpCircle className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-6 text-primary" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Questions Fréquemment Posées</h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Trouvez des réponses claires à vos interrogations sur l'achat, la vente et la sécurisation de terrains avec Teranga Foncier.
        </p>
      </motion.div>

      <Accordion type="single" collapsible className="w-full space-y-3">
        {faqData.map((item, index) => (
          <motion.custom
            key={index}
            variants={itemVariants}
            custom={index + 1}
          >
            <AccordionItem value={`item-${index + 1}`} className="bg-card border border-border/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="text-lg text-left hover:no-underline px-6 py-4 text-foreground font-medium">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed px-6 pb-5">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          </motion.custom>
        ))}
      </Accordion>

       <motion.div 
        variants={itemVariants} 
        custom={faqData.length + 1} 
        className="mt-16 text-center p-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg border border-primary/30 shadow-lg"
        >
          <MessageSquare className="h-10 w-10 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-semibold mb-3 text-foreground">Vous ne trouvez pas votre réponse ?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Notre équipe d'experts est à votre écoute pour vous fournir une assistance personnalisée.</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
             <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/contact">
                   <Phone className="mr-2 h-5 w-5"/> Nous Contacter Directement
                </Link>
             </Button>
          </motion.div>
       </motion.div>

    </motion.div>
  );
};

export default FaqPage;