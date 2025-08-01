import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, FileCheck, UserCheck, Lock } from 'lucide-react';

const preventionPoints = [
  { icon: FileCheck, title: "Vérification Documentaire Approfondie", description: "Nous analysons minutieusement les titres de propriété, plans cadastraux et certificats d'urbanisme pour détecter toute anomalie ou falsification." },
  { icon: UserCheck, title: "Contrôle d'Identité Rigoureux", description: "L'identité des vendeurs et la validité de leurs mandats sont systématiquement vérifiées pour éviter les usurpations et les ventes illégitimes." },
  { icon: ShieldAlert, title: "Prévention de la Double Vente", description: "Nos processus croisent les informations pour identifier et bloquer les tentatives de vente multiple d'un même bien." },
  { icon: Lock, title: "Transactions Sécurisées", description: "Nous recommandons des procédures de paiement sécurisées et travaillons avec des notaires partenaires pour garantir la légalité de l'acte final." },
];

const FraudPreventionSection = () => {
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };
   const imageVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center" // Ensure items-center
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-bold mb-5 text-primary">Notre Engagement Contre la Fraude</h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed text-justify"> {/* Added text-justify */}
              La fraude foncière est un risque majeur au Sénégal. Chez Teranga Foncier, la sécurité de votre investissement est notre priorité absolue. Voici comment nous vous protégeons :
            </p>
            <div className="space-y-4">
              {preventionPoints.map((point, index) => (
                <div key={index} className="flex items-start">
                  <div className="p-2 bg-red-100 text-red-600 rounded-full mr-4 mt-1 shrink-0"> {/* Added shrink-0 */}
                    <point.icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{point.title}</h4>
                    <p className="text-muted-foreground text-sm text-justify">{point.description}</p> {/* Added text-justify */}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={imageVariants} className="aspect-video bg-muted rounded-xl overflow-hidden shadow-lg relative">
             {/* Darker overlay for image */}
             <div className="absolute inset-0 bg-black/30 z-10"></div>
             <img 
                className="w-full h-full object-cover relative z-0"
                alt="Loupe examinant un document officiel sénégalais avec sceau"
                src="https://images.unsplash.com/photo-1589330694653-ded6df03f754" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FraudPreventionSection;