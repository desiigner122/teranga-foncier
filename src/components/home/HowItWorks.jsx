import React from 'react';
import { motion } from 'framer-motion';
import { Map, FileSearch, CheckCircle, Smile } from 'lucide-react';

const steps = [
    { icon: Map, title: "Explorez", description: "Trouvez le terrain idéal parmi des offres vérifiées à travers le Sénégal.", color: "text-green-600" },
    { icon: FileSearch, title: "Vérifiez", description: "Accédez aux informations clés (titre foncier, plan) et posez vos questions.", color: "text-blue-600" },
    { icon: CheckCircle, title: "Sécurisez", description: "Suivez un processus d'achat transparent et accompagné par nos agents.", color: "text-yellow-600" },
    { icon: Smile, title: "Profitez", description: "Devenez propriétaire en toute sérénité et réalisez votre projet.", color: "text-purple-600" },
];

const HowItWorks = () => {
  return (
    <section className="bg-gradient-to-b from-background to-muted/30 py-12 md:py-16"> {/* Reduced padding */}
      <div className="container mx-auto px-4">
          <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-10 text-center text-primary" // Reduced margin bottom
          >
              Votre Projet Foncier Simplifié en 4 Étapes
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"> {/* Reduced gap */}
            {steps.map((step, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-6 bg-card rounded-xl border shadow-sm text-center h-full flex flex-col items-center hover:shadow-md transition-shadow" // Slightly reduced shadow on hover
                >
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className={`mb-4 p-3 bg-primary/10 rounded-full inline-block ${step.color}`}> {/* Reduced margin and padding */}
                     <step.icon size={32} strokeWidth={1.5} /> {/* Reduced icon size */}
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm flex-grow">{step.description}</p>
                </motion.div>
            ))}
          </div>
      </div>
    </section>
  );
};

export default HowItWorks;