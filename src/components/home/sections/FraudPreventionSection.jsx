import React from 'react';
import { motion } from 'framer-motion';
import { FileCheck, UserCheck, SearchCheck, Gavel } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

const preventionPoints = [
  { icon: FileCheck, title: "Vérification Documentaire Approfondie", description: "Analyse minutieuse des titres fonciers, baux, délibérations, plans cadastraux et certificats d'urbanisme pour détecter toute incohérence ou falsification.", color: "text-red-600", bgColor: "bg-red-100" },
  { icon: UserCheck, title: "Contrôle Rigoureux des Identités", description: "Vérification systématique de l'identité des vendeurs et de la validité des mandats pour prévenir les usurpations et les ventes par des non-ayants droit.", color: "text-blue-600", bgColor: "bg-blue-100" },
  { icon: SearchCheck, title: "Traçabilité et Prévention des Litiges", description: "Recherche d'antériorité pour identifier les litiges existants ou potentiels. Croisement des informations pour bloquer les tentatives de double vente.", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  { icon: Gavel, title: "Accompagnement Juridique et Notarié", description: "Collaboration étroite avec des notaires et juristes partenaires pour sécuriser chaque étape de la transaction et garantir la conformité légale.", color: "text-purple-600", bgColor: "bg-purple-100" },
];

const FraudPreventionSection = () => {
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
        viewport={{ once: true, amount: 0.1 }}
        className="text-center"
      >
        <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 text-primary">
          Notre Engagement Inébranlable Contre la Fraude Foncière
        </motion.h2>
        <motion.p variants={itemVariants} className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
          La fraude foncière (fausse délibération, titre foncier inexistant ou grevé, usurpation d'identité, double vente, litiges cachés) est un fléau au Sénégal. Chez Teranga Foncier, la sécurité de votre investissement est notre priorité absolue. Nous avons mis en place un arsenal de mesures pour vous protéger :
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-10">
          {preventionPoints.map((point, index) => (
            <motion.div key={index} variants={itemVariants} transition={{ delay: index * 0.1 }}>
              <Card className="h-full text-center border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="items-center pb-3">
                  <div className={`p-3 rounded-full ${point.bgColor} ${point.color} mb-3`}>
                    <point.icon className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-lg">{point.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{point.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 p-6 md:p-8 rounded-xl border border-primary/20 shadow-lg">
            <h3 className="text-xl md:text-2xl font-semibold text-primary mb-3">Pourquoi la fraude foncière est-elle si répandue ?</h3>
            <ul className="list-disc list-inside text-muted-foreground text-left space-y-2 text-sm md:text-base max-w-2xl mx-auto">
                <li>Complexité des procédures administratives et manque de digitalisation.</li>
                <li>Difficulté d'accès à une information foncière fiable et centralisée.</li>
                <li>Manque de vigilance de certains acheteurs, notamment ceux de la diaspora.</li>
                <li>Existence de réseaux organisés de faussaires et d'escrocs.</li>
            </ul>
            <p className="mt-4 text-muted-foreground font-medium">
                Teranga Foncier s'attaque à ces causes profondes en apportant transparence, rigueur et expertise.
            </p>
            <Button asChild size="lg" className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to="/how-it-works">Découvrez notre processus sécurisé</Link>
            </Button>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default FraudPreventionSection;
