import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const glossaryTerms = [
  {
    term: "Titre Foncier (TF)",
    definition: "Le Titre Foncier est l'acte de propriété définitif et inattaquable au Sénégal. Il est délivré par la Conservation Foncière et constitue la preuve la plus sûre du droit de propriété sur un terrain. Il est inscrit au livre foncier, ce qui le rend public et opposable à tous."
  },
  {
    term: "Bail Emphytéotique",
    definition: "Un bail de très longue durée (entre 18 et 99 ans) qui confère au preneur (locataire) un droit réel sur le bien immobilier, presque équivalent à celui d'un propriétaire. Le preneur peut construire, hypothéquer et jouir du bien, en contrepartie d'un loyer modique appelé 'canon emphytéotique'."
  },
  {
    term: "Délibération",
    definition: "Acte administratif par lequel une collectivité locale (commune, conseil rural) décide d'attribuer un terrain de son domaine privé à une personne physique ou morale. C'est souvent la première étape avant l'obtention d'un bail ou d'un titre foncier, mais ne constitue pas un titre de propriété définitif en soi."
  },
  {
    term: "NICAD",
    definition: "Numéro d'Identification Cadastrale. C'est un identifiant unique attribué à chaque parcelle de terrain dans le cadastre. Il permet de localiser et d'identifier précisément un terrain sur les plans cadastraux."
  },
  {
    term: "Assiette Foncière",
    definition: "Désigne la parcelle de terrain elle-même, la base physique sur laquelle porte un droit de propriété ou un projet de construction. L'expression 'l'assiette du projet' fait référence au terrain sur lequel le projet sera construit."
  },
  {
    term: "Cadastre",
    definition: "Ensemble de documents (plans, registres) qui recensent et décrivent toutes les propriétés foncières d'une commune ou d'une région. Il a une fonction principalement fiscale (calcul des impôts fonciers) et technique (identification des parcelles)."
  },
  {
    term: "Conservation Foncière",
    definition: "Service administratif chargé de la tenue du livre foncier. C'est l'institution qui immatricule les terrains (crée les titres fonciers) et inscrit tous les droits réels (propriété, hypothèques, servitudes) qui s'y rapportent, garantissant ainsi la sécurité juridique des transactions."
  },
  {
    term: "Viabilisation",
    definition: "Ensemble des travaux nécessaires pour rendre un terrain constructible. Cela inclut le raccordement aux réseaux essentiels : eau potable, électricité, assainissement (tout-à-l'égout), et parfois le téléphone et le gaz. Un terrain viabilisé est prêt à accueillir une construction."
  }
];

const GlossaryPage = () => {
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <Helmet>
        <title>Glossaire du Foncier - Teranga Foncier</title>
        <meta name="description" content="Comprenez les termes clés du secteur foncier au Sénégal : Titre Foncier, Bail, Délibération, NICAD, et bien plus. Un guide essentiel pour votre investissement." />
      </Helmet>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto py-16 px-4"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <BookOpen className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Glossaire du Foncier</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Démystifiez le langage de l'immobilier au Sénégal. Voici les définitions des termes essentiels à connaître pour un investissement éclairé.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {glossaryTerms.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  {item.term}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                  {item.definition}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </motion.div>
    </>
  );
};

export default GlossaryPage;