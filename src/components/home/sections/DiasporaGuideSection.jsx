import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plane, ShieldCheck, MessageSquare, MapPin, ArrowRight } from 'lucide-react';

const guidePoints = [
  {
    icon: Plane,
    title: "Pourquoi Investir au Sénégal Depuis l'Étranger ?",
    description: "Stabilité politique, croissance économique soutenue, forte demande locative, attachement à la terre natale. Le Sénégal offre de réelles opportunités pour la diaspora.",
    color: "text-blue-600",
  },
  {
    icon: ShieldCheck,
    title: "Comment Teranga Foncier Sécurise Votre Investissement à Distance ?",
    description: "Vérifications rigoureuses, processus 100% dématérialisé, mandataires de confiance (simulé), accompagnement par nos agents locaux. Nous sommes vos yeux et vos garants sur place.",
    color: "text-green-600",
  },
  {
    icon: MessageSquare,
    title: "Pièges à Éviter & Nos Solutions",
    description: "Méfiez-vous des intermédiaires non vérifiés et des 'bonnes affaires' trop belles. Nous vous protégeons contre les faux documents, les litiges et les arnaques courantes.",
    color: "text-red-600",
  },
];

const DiasporaGuideSection = () => {
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
        viewport={{ once: true, amount: 0.2 }}
        className="text-center mb-10"
      >
        <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-primary mb-3 flex items-center justify-center">
          <Plane className="h-8 w-8 mr-3 text-primary transform -rotate-12" /> Guide Spécial Diaspora Sénégalaise
        </motion.h2>
        <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Investir dans la terre de vos ancêtres depuis l'étranger ? Teranga Foncier rend cela simple, sûr et transparent.
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10">
        {guidePoints.map((point, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full text-center border shadow-sm hover:shadow-md transition-shadow bg-card">
              <CardHeader className="items-center pb-3">
                <div className={`p-3 rounded-full bg-primary/10 ${point.color} mb-3 inline-block ring-2 ring-current/20`}>
                  <point.icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <CardTitle className="text-lg">{point.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center"
      >
        <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link to="/contact?subject=Diaspora">
            Contactez un conseiller spécialisé Diaspora <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
};

export default DiasporaGuideSection;