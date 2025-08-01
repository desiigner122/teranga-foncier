import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeartHandshake as Handshake, Building, Landmark, Users, ExternalLink, Phone, Briefcase, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const partnersData = [
  {
    name: "Sénégindia SA",
    category: "Constructeur Immobilier de Référence",
    description: "Acteur majeur dans la construction de logements modernes et d'infrastructures de qualité au Sénégal. Senegindia est reconnu pour ses projets innovants, son respect des normes internationales et sa vision à long terme pour un habitat durable. Ils apportent une expertise technique pointue et une capacité de réalisation éprouvée.",
    logoPlaceholder: "Logo moderne et épuré de Senegindia SA",
    website: "#", // Remplacer par le vrai site
    focus: "Grands projets résidentiels, Villes nouvelles, Infrastructures urbaines"
  },
  {
    name: "WinWin Afrique",
    category: "Aménageur & Développeur Territorial",
    description: "Spécialisé dans l'aménagement de zones résidentielles, commerciales et industrielles, WinWin Afrique s'engage à créer des cadres de vie et d'activité agréables, fonctionnels et intégrés. Leur approche met l'accent sur la viabilisation de qualité et le respect de l'environnement.",
    logoPlaceholder: "Logo dynamique de WinWin Afrique, symbolisant la croissance",
    website: "#",
    focus: "Aménagement foncier, Viabilisation de terrains, Développement de zones d'activités"
  },
  {
    name: "CDE - La Cité de l'Émergence",
    category: "Promoteur de Projets Urbains Intégrés",
    description: "Développeur de la Cité de l'Émergence, un projet phare intégrant habitat, bureaux, commerces et loisirs. CDE est un acteur clé dans la création d'écosystèmes urbains modernes et durables, contribuant à la transformation du paysage sénégalais.",
    logoPlaceholder: "Logo institutionnel de La Cité de l'Émergence",
    website: "#",
    focus: "Projets immobiliers mixtes, Urbanisme moderne, Développement de pôles d'attractivité"
  },
  {
    name: "CSE - Compagnie Sahélienne d'Entreprises",
    category: "Leader en BTP & Infrastructures",
    description: "Figure de proue dans le secteur du BTP au Sénégal et en Afrique de l'Ouest, la CSE est un partenaire essentiel pour la réalisation d'infrastructures d'envergure (routes, ponts, bâtiments publics) qui accompagnent et structurent le développement foncier.",
    logoPlaceholder: "Logo de la CSE, reflétant la solidité et l'expertise",
    website: "#",
    focus: "Infrastructures majeures, Travaux publics, Génie civil"
  },
  {
    name: "Chambre des Notaires du Sénégal",
    category: "Garant de la Sécurité Juridique",
    description: "Institution officielle regroupant les notaires du Sénégal, elle est le pilier de la sécurité des transactions immobilières. Nous collaborons étroitement avec ses membres pour assurer la validité, l'authenticité des actes et la protection des droits de propriété.",
    logoPlaceholder: "Sceau officiel de la Chambre des Notaires du Sénégal",
    website: "#",
    focus: "Sécurité juridique, Actes authentiques, Conseil notarial"
  },
  {
    name: "Ordre des Géomètres-Experts du Sénégal",
    category: "Expertise Technique & Cadastrale",
    description: "Les géomètres-experts jouent un rôle crucial dans la délimitation précise, le bornage des terrains et la mise à jour du cadastre. Leur expertise technique assure la fiabilité des informations foncières et prévient les litiges liés aux limites de propriété.",
    logoPlaceholder: "Emblème de l'Ordre des Géomètres-Experts du Sénégal",
    website: "#",
    focus: "Bornage et délimitation, Travaux cadastraux, Topographie"
  }
];

const selectionCriteria = [
  "Réputation et Éthique Professionnelle",
  "Solidité Financière et Expérience Prouvée",
  "Qualité des Réalisations et Respect des Délais",
  "Conformité Réglementaire et Administrative",
  "Engagement envers la Transparence et la Satisfaction Client"
];

const PartnerCard = ({ partner, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { delay: index * 0.1, duration: 0.5, ease: "easeOut" }
    }
  };

  const getCategoryIcon = (category) => {
    if (category.includes("Constructeur") || category.includes("Promoteur") || category.includes("BTP")) return <Building className="h-6 w-6 text-primary" />;
    if (category.includes("Développement") || category.includes("Aménageur")) return <Landmark className="h-6 w-6 text-primary" />;
    if (category.includes("Juridique") || category.includes("Notaires")) return <Briefcase className="h-6 w-6 text-primary" />;
    if (category.includes("Technique") || category.includes("Géomètres")) return <Users className="h-6 w-6 text-primary" />;
    return <Handshake className="h-6 w-6 text-primary" />;
  };

  return (
    <motion.div variants={cardVariants} className="h-full">
      <Card className="h-full flex flex-col overflow-hidden shadow-xl border-border/50 bg-card hover:shadow-primary/15 transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4 mb-3">
            <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-muted flex items-center justify-center p-2 ring-2 ring-primary/20">
              <img  alt={partner.logoPlaceholder} className="max-w-full max-h-full object-contain" src="https://images.unsplash.com/photo-1566304660263-c15041ac11c0" />
            </div>
            <div className="flex-grow">
              <CardTitle className="text-xl md:text-2xl font-bold text-foreground mb-1">{partner.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                {getCategoryIcon(partner.category)}
                <span className="ml-2 font-medium">{partner.category}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription className="text-base text-muted-foreground leading-relaxed mb-3">
            {partner.description}
          </CardDescription>
           <p className="text-sm text-primary font-semibold mt-3">Domaines d'expertise clés : <br/><span className="text-foreground font-normal">{partner.focus}</span></p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="default" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
            onClick={() => alert(`🚧 Visite du site de ${partner.name} non implémentée. URL: ${partner.website}`)}
          >
            Visiter le Site Web <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const PartnersPage = () => {
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6 } },
  };
  
  return (
    <motion.div 
        variants={pageVariants} 
        initial="initial" 
        animate="animate" 
        className="bg-gradient-to-b from-background to-blue-50 dark:from-background dark:to-blue-900/20 min-h-screen"
    >
      <div className="container mx-auto py-12 px-4 md:py-20">
        <motion.div 
            initial={{ opacity: 0, y: -30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7, delay: 0.1 }} 
            className="text-center mb-12 md:mb-16"
        >
          <Handshake className="h-16 w-16 md:h-20 md:w-20 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-4">
            Nos Partenaires Stratégiques
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Teranga Foncier est fier de collaborer avec un réseau d'acteurs clés de l'immobilier, de la construction et du développement pour vous offrir un service complet, fiable et sécurisé.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {partnersData.map((partner, index) => (
            <PartnerCard key={partner.name} partner={partner} index={index} />
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-16 md:mt-20"
        >
          <Card className="bg-card/80 backdrop-blur-sm shadow-xl border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl text-center text-primary">Nos Critères de Sélection des Partenaires</CardTitle>
              <CardDescription className="text-center max-w-2xl mx-auto">
                Pour garantir la qualité et la fiabilité de notre réseau, nous sélectionnons nos partenaires sur la base de critères stricts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectionCriteria.map((criterion, index) => (
                  <div key={index} className="flex items-center p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{criterion}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.div 
          initial={{ opacity:0, y:30 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay: 0.7, duration:0.7 }}
          className="mt-16 md:mt-20 text-center p-8 md:p-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl border border-primary/30 shadow-2xl"
        >
          <Phone className="h-10 w-10 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">Vous souhaitez devenir partenaire ?</h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Si vous partagez notre vision d'un secteur foncier transparent, éthique et accessible à tous, et que votre expertise peut enrichir notre écosystème, nous serions ravis d'échanger.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
             <Button 
                asChild
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base shadow-lg px-8 py-6"
             >
               <Link to="/contact?subject=Partenariat">
                 Contactez Notre Équipe Partenariats
               </Link>
             </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PartnersPage;