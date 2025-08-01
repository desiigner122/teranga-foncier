import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, MapPin, Droplets, ShieldCheck, ArrowRight, BarChart, CheckSquare, Settings2, Share2, Users, MessageSquare, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Helmet } from 'react-helmet-async';

const SolutionsAgriculteursPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleDashboardAccess = () => {
    if (isAuthenticated) {
      navigate('/solutions/agriculteurs/dashboard');
    } else {
      navigate('/login', { state: { from: { pathname: '/solutions/agriculteurs/dashboard' } } });
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
      icon: MapPin,
      title: "Terrains Agricoles Vérifiés et Adaptés",
      description: "Accédez à une sélection de parcelles agricoles dont le statut juridique est vérifié. Filtrez par région, superficie, type de sol (simulé) et proximité des sources d'eau.",
      imageDesc: "Illustration conceptuelle épurée de parcelles agricoles stylisées avec des icônes de localisation et de type de culture abstraites, sur fond clair."
    },
    {
      icon: Droplets,
      title: "Informations sur les Ressources Hydriques (Simulées)",
      description: "Obtenez des indications sur la disponibilité des ressources en eau (nappes phréatiques, cours d'eau, pluviométrie moyenne) pour les zones qui vous intéressent.",
      imageDesc: "Schéma illustratif abstrait et minimaliste du cycle de l'eau avec des icônes épurées, symbolisant l'accès aux ressources hydriques pour l'agriculture."
    },
    {
      icon: ShieldCheck,
      title: "Sécurisation de Votre Exploitation Agricole",
      description: "Assurez la pérennité de votre projet en acquérant des terres au statut juridique clair, minimisant les risques de litiges et vous permettant de vous concentrer sur votre production.",
      imageDesc: "Illustration conceptuelle minimaliste d'un bouclier stylisé protégeant un champ cultivé abstrait, sur fond neutre."
    },
    {
      icon: Leaf,
      title: "Conseils et Orientation pour Projets Agricoles",
      description: "Bénéficiez de notre réseau (simulé) pour des conseils sur les cultures adaptées, les bonnes pratiques agricoles et les opportunités de financement pour développer votre exploitation.",
      imageDesc: "Illustration conceptuelle d'un agriculteur stylisé et épuré recevant des conseils d'un expert, avec des icônes de croissance végétale abstraites et minimalistes."
    }
  ];

  const processSteps = [
    { icon: CheckSquare, title: "Définissez vos besoins", description: "Utilisez nos filtres pour préciser type de culture, superficie, et région." },
    { icon: Settings2, title: "Explorez les options", description: "Consultez les fiches détaillées des parcelles, avec données de sol et hydriques (simulées)." },
    { icon: Share2, title: "Sécurisez votre acquisition", description: "Bénéficiez d'un accompagnement pour la vérification finale et la transaction." }
  ];

  const keyNumbers = [
    { number: "+1,200", label: "Hectares agricoles vérifiés disponibles", icon: MapPin },
    { number: "85%", label: "Taux de satisfaction clients agriculteurs", icon: Users },
    { number: "N°1", label: "En accompagnement foncier agricole", icon: Star },
  ];

  const testimonials = [
    {
      quote: "Grâce à Teranga Foncier, j'ai enfin pu trouver et sécuriser une parcelle adaptée à mon projet de maraîchage. Leur expertise a été cruciale.",
      name: "Fatou Diallo",
      role: "Agricultrice à Thiès",
      avatarDesc: "Portrait souriant d'une agricultrice africaine dans son champ."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Solutions Agriculteurs - Teranga Foncier</title>
        <meta name="description" content="Découvrez nos solutions foncières pour les agriculteurs au Sénégal. Accédez à des terres agricoles vérifiées, des données sur les ressources et un accompagnement expert." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-background"
      >
        <section className="py-16 md:py-24 text-center bg-green-600/10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container mx-auto px-4"
          >
            <Leaf className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-6 text-green-600" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-green-700 mb-4">
              Solutions Foncières pour l'Agriculture
            </h1>
            <p className="text-lg md:text-xl text-green-800/80 max-w-3xl mx-auto">
              Teranga Foncier soutient les agriculteurs et porteurs de projets agricoles en facilitant l'accès à des terres productives et sécurisées au Sénégal.
            </p>
          </motion.div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-green-700">Cultivez Votre Avenir en Toute Sérénité</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {features.map((feature, index) => (
                <motion.custom
                  key={index}
                  variants={featureVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  custom={index}
                  className="bg-card p-6 md:p-8 rounded-xl shadow-lg border border-green-200 hover:shadow-green-100 transition-shadow flex flex-col"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-green-500/10 rounded-full mr-4">
                      <feature.icon className="h-7 w-7 text-green-600" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed flex-grow">{feature.description}</p>
                   <div className="aspect-video bg-green-50 rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <img  className="max-h-full max-w-full object-contain" alt={feature.imageDesc} src="https://images.unsplash.com/photo-1684265035876-f411940ef9af" />
                  </div>
                </motion.custom>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-20 bg-muted/50">
          <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-green-700">Nos Atouts en Chiffres</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {keyNumbers.map((item, index) => (
                      <motion.div
                          key={index}
                          variants={featureVariants}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, amount: 0.2 }}
                          custom={index}
                          className="bg-card p-6 rounded-xl shadow-lg text-center"
                      >
                          <item.icon className="h-12 w-12 text-green-600 mx-auto mb-3" />
                          <p className="text-3xl font-bold text-green-700">{item.number}</p>
                          <p className="text-muted-foreground">{item.label}</p>
                      </motion.div>
                  ))}
              </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-green-700">Comment Démarrer ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {processSteps.map((step, index) => (
                <motion.custom
                  key={index}
                  variants={featureVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  custom={index + features.length} 
                  className="bg-card p-6 rounded-xl shadow-lg text-center flex flex-col items-center"
                >
                  <div className="p-4 bg-green-500/10 rounded-full mb-4">
                    <step.icon className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </motion.custom>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl md:text-3xl font-semibold text-center text-green-700 mb-10">Ils Nous Font Confiance</h3>
            {testimonials.map((testimonial, index) => (
              <motion.custom
                key={index}
                variants={featureVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={index}
                className="max-w-2xl mx-auto bg-card p-6 rounded-xl shadow-xl relative"
              >
                <MessageSquare className="absolute top-0 left-0 h-12 w-12 text-green-200 transform -translate-x-1/3 -translate-y-1/3" />
                <p className="text-lg italic text-muted-foreground mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-muted mr-4 overflow-hidden ring-2 ring-green-300">
                    <img  className="w-full h-full object-cover" alt={testimonial.avatarDesc} src="https://images.unsplash.com/photo-1670607951160-d7780f0f0478" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.custom>
            ))}
          </div>
        </section>

        <section className="py-16 md:py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-green-700">Visualisez Vos Données Agricoles</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Accédez à un tableau de bord personnalisé pour suivre vos parcelles, analyser les données climatiques (simulées) et gérer vos projets.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={handleDashboardAccess} className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-500 hover:to-lime-500 text-white shadow-lg">
                Accéder au Dashboard Agriculteur <BarChart className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
             <p className="text-sm text-muted-foreground mt-4">Ou <Link to="/parcelles?usage=agricole" className="underline hover:text-primary">explorez les terrains agricoles disponibles</Link>.</p>
          </div>
        </section>
      </motion.div>
    </>
  );
};

export default SolutionsAgriculteursPage;