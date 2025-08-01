import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Scale, Globe, CreditCard, Plane, AlertOctagon, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';

const objectives = [
   { icon: ShieldCheck, title: "Lutte Acharnée Contre la Fraude", description: "Vérification systématique et multi-niveaux des titres fonciers, baux, délibérations, identités des vendeurs et mandats pour prévenir les doubles ventes, les faux documents et les litiges.", color: "text-red-600" },
   { icon: Scale, title: "Processus Transparent et Traçable", description: "Suivez chaque étape de votre acquisition en ligne, de la réservation à la signature, en toute clarté, avec des mises à jour régulières et un accès aux documents vérifiés.", color: "text-blue-600" },
   { icon: CreditCard, title: "Paiements Flexibles et Sécurisés", description: "Payez vos échéances, frais de notaire ou timbres en toute sécurité via Mobile Money (Wave, Orange Money), virement bancaire ou chèque, avec un suivi en temps réel.", color: "text-green-600" },
   { icon: Plane, title: "Accessibilité Optimisée pour la Diaspora", description: "Procédures entièrement dématérialisées, assistance dédiée et accompagnement personnalisé à distance pour les Sénégalais résidant à l'étranger, facilitant l'investissement sécurisé depuis n'importe où.", color: "text-purple-600" },
];

const AnimatedStatCard = ({ icon: Icon, value, label, color, isPercentage = false, note, delay = 0 }) => {
  const [startCount, setStartCount] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      onViewportEnter={() => setStartCount(true)}
      transition={{ duration: 0.5, delay }}
      className={`bg-card p-5 rounded-xl shadow-lg text-center border border-border/50 hover:shadow-primary/10 transition-shadow duration-300`}
    >
      <Icon size={36} className={`mx-auto mb-3 ${color}`} strokeWidth={1.5}/>
      <p className="text-3xl md:text-4xl font-bold text-foreground">
        {startCount ? <CountUp end={value} duration={2.5} separator=" " suffix={isPercentage ? "%" : "+"} /> : `0${isPercentage ? "%" : "+"}`}
      </p>
      <p className="text-muted-foreground text-sm md:text-base mt-1">{label}</p>
      {note && <p className="text-xs text-muted-foreground/70 mt-0.5">{note}</p>}
    </motion.div>
  );
};


const PlatformObjectivesSection = () => {
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
         className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center"
      >
          <motion.div variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold mb-5 text-primary">Investir au Sénégal, en Toute Sécurité : Notre Mission Fondamentale</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed text-justify">
                 Notre mission est de rendre l'achat de terrain au Sénégal fiable, transparent et accessible à tous, en particulier pour la diaspora. Nous combattons activement la fraude foncière sous toutes ses formes (doubles ventes, faux documents, usurpations d'identité, litiges cachés) et simplifions les démarches administratives et juridiques complexes.
              </p>
              <div className="space-y-4 mb-8">
                  {objectives.map((obj, index) => (
                     <div key={index} className="flex items-start p-3 bg-card rounded-lg border border-border/40 shadow-sm hover:shadow-md transition-shadow">
                         <div className={`p-2 bg-primary/10 rounded-full mr-4 mt-1 shrink-0 ${obj.color}`}>
                           <obj.icon className="h-5 w-5" strokeWidth={2} />
                         </div>
                         <div>
                             <h4 className="font-semibold text-foreground">{obj.title}</h4>
                             <p className="text-muted-foreground text-sm text-justify">{obj.description}</p>
                         </div>
                     </div>
                  ))}
              </div>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to="/how-it-works">Découvrez notre processus sécurisé</Link>
              </Button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <AnimatedStatCard icon={ShieldCheck} value={1250} label="Vérifications Anti-Fraude" color="text-green-500" delay={0.1} />
              <AnimatedStatCard icon={Globe} value={25} label="Pays (Diaspora Accompagnée)" color="text-blue-500" delay={0.2} />
              <AnimatedStatCard icon={TrendingUp} value={500} label="Transactions Facilitées" color="text-purple-500" delay={0.3} />
              <AnimatedStatCard icon={AlertOctagon} value={70} label="Réduction des Litiges*" color="text-red-500" isPercentage={true} note="*Estimé via notre plateforme." delay={0.4} />
              
              <motion.div 
                variants={itemVariants} 
                className="col-span-1 sm:col-span-2 aspect-video bg-muted rounded-xl overflow-hidden mt-4 shadow-xl relative group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
                  <img    
                      className="w-full h-full object-cover relative z-0 transition-transform duration-500 group-hover:scale-105"
                      alt="Agent immobilier sénégalais expliquant un plan cadastral à un client souriant dans un bureau moderne" src="https://images.unsplash.com/photo-1654702330584-c95d0894e0a8" />
                  <div className="absolute bottom-4 left-4 z-20">
                    <h3 className="text-white text-lg font-semibold">Confiance & Transparence</h3>
                    <p className="text-gray-200 text-xs">Au cœur de chaque transaction.</p>
                  </div>
              </motion.div>
          </div>
      </motion.div>
    </section>
  );
};

export default PlatformObjectivesSection;