import React from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, ShieldCheck, Linkedin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const AboutPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const teamMember = {
    name: "Abdoulaye Diémé",
    role: "Fondateur & CEO",
    imageUrl: "https://storage.googleapis.com/hostinger-horizons-assets-prod/bcc20f7d-f81b-4a6f-9229-7d6ba486204e/64ab783a30ad4c2d4b282a68a354292b.jpg",
    imgAlt: "Portrait d'Abdoulaye Diémé, fondateur de Teranga Foncier",
    linkedin: "https://www.linkedin.com/in/abdoulaye-di%C3%A9m%C3%A9-58136a1b1/",
  };

  const values = [
    { icon: ShieldCheck, title: "Intégrité", description: "Nous agissons avec honnêteté et transparence à chaque étape." },
    { icon: Users, title: "Orientation Client", description: "Votre sécurité et votre satisfaction sont notre priorité absolue." },
    { icon: Eye, title: "Rigueur", description: "Chaque dossier est traité avec la plus grande attention aux détails." },
  ];

  return (
    <>
      <Helmet>
        <title>À Propos - Contribution à la Transformation Digitale du Sénégal</title>
        <meta name="description" content="Découvrez comment Teranga Foncier participe à la transformation numérique du Sénégal, en phase avec les ambitions du gouvernement sénégalais et de l'agenda C50 pour le secteur foncier." />
        <meta name="keywords" content="mission Teranga Foncier, transformation numérique Sénégal, agenda C50, Abdoulaye Diémé, gouvernement Sénégalais, modernisation foncier" />
        <link rel="canonical" href="https://www.terangafoncier.com/about" />
      </Helmet>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-background"
      >
        {/* Header Section */}
        <motion.section
          variants={itemVariants}
          className="relative pt-32 pb-20 md:pt-40 md:pb-24 text-center bg-muted/50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent_brand/10 -z-10"></div>
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-4">Notre mission</h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
              Accélérer la transformation digitale du secteur foncier au Sénégal, en rendant l'investissement accessible, transparent et sécurisé pour tous.
            </p>
          </div>
        </motion.section>

        {/* Founder Section */}
        <motion.section
          variants={itemVariants}
          className="py-16 md:py-24"
        >
          <div className="container mx-auto px-4">
            <Card className="overflow-hidden shadow-lg border-none">
              <div className="grid lg:grid-cols-2 items-center">
                <div className="relative h-96 lg:h-[500px] order-first">
                  <img
                    src={teamMember.imageUrl}
                    alt={teamMember.imgAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 md:p-12 text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Le mot du fondateur</h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    "J'ai fondé Teranga Foncier pour relever un défi majeur : la **lutte contre l'insécurité foncière** qui freine le développement du Sénégal et brise les rêves de notre diaspora. Face aux arnaques et à la complexité administrative, j'ai choisi de mener ce combat en utilisant la technologie comme une arme de confiance. Notre plateforme n'est pas qu'un outil, c'est un engagement. Un engagement à protéger chaque investissement, à garantir la transparence de chaque transaction et à bâtir un avenir où la propriété foncière est un droit sécurisé, pas un risque."
                  </p>
                  <div>
                    <p className="font-semibold text-lg text-foreground">{teamMember.name}</p>
                    <p className="text-primary">{teamMember.role}</p>
                    <div className="flex gap-4 mt-4">
                      <a href={teamMember.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn de Abdoulaye Diémé">
                        <Linkedin className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section
          variants={itemVariants}
          className="py-16 md:py-24 bg-muted/50"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Nos valeurs fondamentales</h2>
              <p className="max-w-2xl mx-auto text-lg text-muted-foreground mt-4">
                Trois piliers qui guident notre contribution à la transformation digitale.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center p-6 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="items-center p-0 mb-4">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto">
                      <value.icon className="h-8 w-8" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          variants={itemVariants}
          className="py-20 md:py-28"
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Participez à la modernisation du Sénégal</h2>
            <p className="max-w-xl mx-auto text-lg text-muted-foreground mb-8">
              Ensemble, construisons un marché foncier transparent, un pilier de la transformation numérique nationale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                <Link to="/parcelles">Explorer les terrains <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-background hover:bg-accent">
                <Link to="/contact">Devenir partenaire</Link>
              </Button>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </>
  );
};

export default AboutPage;
