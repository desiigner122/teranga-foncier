import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Scale, Globe, CalendarCheck, Plane } from 'lucide-react';

const objectives = [
   { icon: ShieldCheck, title: "Contre la Fraude", description: "Vérification systématique des titres fonciers, identités des vendeurs et mandats pour prévenir les doubles ventes et litiges.", color: "text-red-600" },
   { icon: Scale, title: "Processus Transparent", description: "Suivez chaque étape de votre acquisition en ligne, de la réservation à la signature, en toute clarté et avec des mises à jour régulières.", color: "text-blue-600" },
   { icon: Plane, title: "Accessibilité Diaspora", description: "Procédures entièrement dématérialisées et accompagnement personnalisé à distance pour les Sénégalais résidant à l'étranger.", color: "text-purple-600" },
   { icon: Users, title: "Accompagnement Expert", description: "Nos agents dédiés vous conseillent, répondent à vos questions et vous assistent dans toutes les démarches administratives.", color: "text-yellow-600" },
];

const stats = [
    { icon: ShieldCheck, value: "100+", label: "Vérifications Anti-Fraude/Mois", color: "text-primary" },
    { icon: Globe, value: "15+", label: "Pays (Diaspora Servie)", color: "text-primary" },
    { icon: CalendarCheck, value: "95%", label: "Respect des Délais", color: "text-green-500", span: true }
];


const PlatformObjectives = () => {
   const sectionVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
   };
   const itemVariants = {
       hidden: { opacity: 0, y: 20 },
       visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
   };


  return (
    <section className="container mx-auto py-12 md:py-16 px-4">
      <motion.div
         variants={sectionVariants}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, amount: 0.2 }}
         className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center" // Ensure items-center for vertical alignment
      >
          <motion.div variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold mb-5 text-primary">Investir au Sénégal, en Toute Sécurité</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed text-justify"> {/* Added text-justify */}
                 Notre mission est de rendre l'achat de terrain au Sénégal fiable, transparent et accessible à tous. Nous combattons activement la fraude (doubles ventes, faux documents) et simplifions les démarches complexes, en particulier pour la diaspora sénégalaise.
              </p>
              <div className="space-y-4">
                  {objectives.map((obj, index) => (
                     <div key={index} className="flex items-start">
                         <div className={`p-2 bg-primary/10 rounded-full mr-4 mt-1 shrink-0 ${obj.color}`}> {/* Added shrink-0 */}
                           <obj.icon className="h-5 w-5" strokeWidth={2} />
                         </div>
                         <div>
                             <h4 className="font-semibold text-foreground">{obj.title}</h4>
                             <p className="text-muted-foreground text-sm text-justify">{obj.description}</p> {/* Added text-justify */}
                         </div>
                     </div>
                  ))}
              </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 text-center">
               {stats.map((stat, index) => (
                  <motion.div
                     key={index}
                     variants={itemVariants}
                     whileHover={{ scale: 1.05, y: -5 }}
                     className={`bg-gradient-to-br from-muted/50 to-muted/80 dark:from-card/80 dark:to-card p-5 rounded-xl shadow-sm ${stat.span ? 'col-span-2' : ''}`}
                  >
                     <stat.icon size={36} className={`mx-auto mb-2 ${stat.color}`} strokeWidth={1.5}/>
                     <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                     <p className="text-muted-foreground text-xs md:text-sm mt-1">{stat.label}</p>
                  </motion.div>
               ))}
                 <motion.div variants={itemVariants} className="col-span-2 aspect-video bg-muted rounded-xl overflow-hidden mt-4 shadow-lg relative">
                     {/* Darker overlay for image */}
                     <div className="absolute inset-0 bg-black/20 z-10"></div>
                     <img 
                        className="w-full h-full object-cover relative z-0"
                        alt="Agent immobilier sénégalais expliquant un plan cadastral à un client souriant"
                        src="https://images.unsplash.com/photo-1497040621997-a9eac8e712ce" />
                 </motion.div>
          </div>
      </motion.div>
    </section>
  );
};

export default PlatformObjectives;