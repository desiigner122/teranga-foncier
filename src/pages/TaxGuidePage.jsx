import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Percent, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';

const taxInfo = [
  {
    title: "Droits d'Enregistrement",
    category: "À l'achat",
    rate: "Environ 5% de la valeur du bien",
    description: "Ces droits sont perçus par l'État pour formaliser la vente et l'inscrire dans les registres officiels. Ils sont généralement payés par l'acheteur chez le notaire au moment de la signature de l'acte de vente."
  },
  {
    title: "TVA sur Terrains Aménagés",
    category: "À l'achat",
    rate: "18% (si applicable)",
    description: "La Taxe sur la Valeur Ajoutée peut s'appliquer si vous achetez un terrain viabilisé auprès d'un promoteur immobilier assujetti à la TVA. Le prix affiché est souvent TTC (Toutes Taxes Comprises), mais il est crucial de le vérifier."
  },
  {
    title: "Contribution Foncière des Propriétés Bâties (CFPB)",
    category: "Annuel",
    rate: "Variable (basée sur la valeur locative)",
    description: "Une fois que vous avez construit sur votre terrain, vous êtes redevable de cet impôt foncier annuel. Son montant dépend de la localisation, de la taille et de la qualité de la construction."
  },
  {
    title: "Impôt sur la Plus-Value Immobilière",
    category: "À la revente",
    rate: "Variable",
    description: "Si vous revendez votre bien en réalisant un bénéfice (plus-value), cet impôt peut s'appliquer. Les règles d'exonération (par exemple, pour la résidence principale) et de calcul peuvent être complexes et nécessitent souvent l'avis d'un expert."
  }
];

const TaxGuidePage = () => {
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
        <title>Guide Fiscal Foncier - Teranga Foncier</title>
        <meta name="description" content="Un guide sur les impôts et taxes liés à l'achat et la détention d'un terrain au Sénégal. Comprenez les droits d'enregistrement, la TVA, et la contribution foncière." />
      </Helmet>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto py-16 px-4"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <Percent className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Guide sur la Fiscalité Foncière</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprendre les taxes et impôts est essentiel pour un investissement réussi. Voici un aperçu des principales contributions fiscales au Sénégal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {taxInfo.map((tax, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{tax.title}</CardTitle>
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">{tax.category}</span>
                  </div>
                  <CardDescription className="text-2xl font-bold text-primary pt-2">{tax.rate}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{tax.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div variants={itemVariants} className="mt-16 p-6 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg">
          <div className="flex">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <h3 className="font-semibold">Avertissement Important</h3>
              <p className="text-sm">
                Les informations fournies sur cette page sont à titre indicatif et ne constituent pas un conseil fiscal. La législation fiscale peut évoluer. Nous vous recommandons vivement de consulter un notaire ou un conseiller fiscal pour obtenir des informations précises et personnalisées à votre situation.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default TaxGuidePage;