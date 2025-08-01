import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banknote, Building2, TrendingUp, Leaf, ArrowRight } from 'lucide-react';

const solutions = [
  {
    icon: Banknote,
    title: "Pour les Banques",
    description: "Évaluation de garanties foncières, suivi de portefeuille d'actifs, diligence raisonnable accélérée et sécurisée.",
    link: "/solutions/banques",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    cta: "Découvrir les outils bancaires"
  },
  {
    icon: Building2,
    title: "Pour les Promoteurs",
    description: "Identification de terrains stratégiques, études de faisabilité préliminaires, analyse de potentiel de développement.",
    link: "/solutions/promoteurs",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    cta: "Explorer les solutions promoteurs"
  },
  {
    icon: TrendingUp,
    title: "Pour les Investisseurs",
    description: "Accès à des opportunités foncières vérifiées, analyse de rendement potentiel, constitution de portefeuille diversifié.",
    link: "/solutions/investisseurs",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    cta: "Voir les opportunités d'investissement"
  },
  {
    icon: Leaf,
    title: "Pour les Agriculteurs",
    description: "Localisation de terrains agricoles adaptés, informations sur les ressources (sol, eau), sécurisation de l'exploitation.",
    link: "/solutions/agriculteurs",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    cta: "Trouver des terres agricoles"
  }
];

const SolutionsOverviewSection = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 }
    })
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-10 md:mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Des Solutions Sur Mesure pour Chaque Acteur du Foncier</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Teranga Foncier offre des outils et services spécialisés pour répondre aux besoins spécifiques des banques, promoteurs, investisseurs et agriculteurs, en mettant l'accent sur la sécurité et la transparence.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {solutions.map((solution, index) => (
          <motion.custom
            key={solution.title}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={index}
            className="flex"
          >
            <Card className={`w-full flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 ${solution.border}`}>
              <CardHeader className={`p-6 ${solution.bg}`}>
                <div className={`p-3 rounded-full ${solution.color} bg-white inline-block mb-3 shadow`}>
                  <solution.icon className="h-7 w-7" />
                </div>
                <CardTitle className={`text-xl font-semibold ${solution.color}`}>{solution.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                <CardDescription className="text-muted-foreground text-sm leading-relaxed">{solution.description}</CardDescription>
              </CardContent>
              <div className="p-6 pt-0">
                <Button asChild variant="link" className={`p-0 ${solution.color} hover:underline font-medium`}>
                  <Link to={solution.link}>
                    {solution.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.custom>
        ))}
      </div>
    </div>
  );
};

export default SolutionsOverviewSection;