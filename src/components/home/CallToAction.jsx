import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground"> {/* Use section tag */}
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-6"
        >
          Prêt à trouver votre terrain idéal au Sénégal ?
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto"
        >
          Explorez nos parcelles vérifiées, consultez les détails et lancez votre projet foncier en toute sécurité avec Teranga Foncier.
        </motion.p>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" asChild variant="secondary" className="bg-white text-primary hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-transform">
            <Link to="/parcelles">Voir les Parcelles Disponibles <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 backdrop-blur-sm shadow-lg transform hover:scale-105 transition-transform" asChild>
            <Link to="/register">Créer un Compte Gratuit</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;