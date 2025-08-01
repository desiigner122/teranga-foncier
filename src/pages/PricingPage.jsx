import React from 'react';
import { motion } from 'framer-motion';
import { Check, HelpCircle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const PricingPage = () => {
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const services = [
    {
      title: "Frais de Service Teranga Foncier",
      description: "Nos frais couvrent la vérification, l'accompagnement et la sécurisation de la transaction.",
      price: "5% du prix de vente",
      note: "Payable à la signature de l'acte de vente.",
      features: [
        "Vérification juridique et administrative complète",
        "Accompagnement par un agent dédié",
        "Accès à la plateforme et au suivi de dossier",
        "Mise en relation avec le réseau de partenaires (notaires, etc.)"
      ]
    },
    {
      title: "Frais de Notaire (Estimation)",
      description: "Les frais notariaux sont réglementés et couvrent la rédaction de l'acte authentique et les formalités.",
      price: "~3-5% du prix de vente",
      note: "Le montant exact est calculé par le notaire.",
      features: [
        "Rédaction de la promesse et de l'acte de vente",
        "Conseil juridique impartial",
        "Enregistrement de l'acte",
        "Conservation du titre de propriété"
      ]
    },
    {
      title: "Taxes et Impôts Gouvernementaux",
      description: "Droits d'enregistrement et autres taxes dues à l'État sénégalais.",
      price: "~5-10% du prix de vente",
      note: "Varie selon la nature du bien et la transaction.",
      features: [
        "Droits d'enregistrement",
        "Timbres fiscaux",
        "Conservation foncière",
        "Plus-value immobilière (si applicable au vendeur)"
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Tarifs & Frais - Teranga Foncier</title>
        <meta name="description" content="Découvrez notre grille tarifaire transparente pour l'achat de terrain au Sénégal. Comprenez nos frais de service, les frais de notaire et les taxes gouvernementales." />
      </Helmet>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto py-16 px-4"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Tarifs & Frais</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Nous croyons en une transparence totale. Voici un aperçu des coûts associés à l'acquisition d'un terrain au Sénégal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {services.map((service, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className={`h-full flex flex-col shadow-lg ${index === 0 ? 'border-primary ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-4xl font-bold mb-2">{service.price}</p>
                  <p className="text-xs text-muted-foreground mb-6">{service.note}</p>
                  <ul className="space-y-3">
                    {service.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild variant={index === 0 ? 'default' : 'outline'} className="w-full">
                    <Link to="/contact">Poser une question <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div variants={itemVariants} className="mt-16 text-center p-8 bg-muted/50 rounded-lg border border-dashed">
          <HelpCircle className="h-10 w-10 mx-auto text-primary mb-4" />
          <h3 className="text-2xl font-semibold mb-3">Besoin d'une estimation personnalisée ?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Chaque projet est unique. Pour une estimation détaillée des frais pour un terrain spécifique, n'hésitez pas à contacter nos conseillers.
          </p>
          <Button asChild size="lg">
            <Link to="/contact">Contacter un conseiller</Link>
          </Button>
        </motion.div>
      </motion.div>
    </>
  );
};

export default PricingPage;