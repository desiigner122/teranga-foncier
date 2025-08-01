import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';

const zones = [
  { name: "Dakar", description: "Capitale dynamique, centre économique et administratif.", imageDesc: "Vue aérienne moderne de la ville de Dakar Sénégal", link: "/parcelles?zone=Dakar", textDesc: "Photo de la ville de Dakar au Sénégal" },
  { name: "Diamniadio", description: "Ville nouvelle en plein essor, pôle urbain moderne.", imageDesc: "Sphère ministérielle Diamniadio Sénégal architecture futuriste", link: "/parcelles?zone=Diamniadio", textDesc: "Photo de la sphère ministérielle de Diamniadio Sénégal" },
  { name: "Saly / Mbour", description: "Zone touristique prisée, plages et résidences secondaires.", imageDesc: "Hôtel resort avec piscine près de la plage Saly Sénégal", link: "/parcelles?zone=Saly", textDesc: "Photo d'un hôtel resort à Saly Sénégal" },
  { name: "Thiès", description: "Carrefour régional important, potentiel résidentiel et agricole.", imageDesc: "Gare ferroviaire historique de Thiès Sénégal", link: "/parcelles?zone=Thiès", textDesc: "Photo de la gare ferroviaire de Thiès Sénégal" },
];

const FocusZonesSection = () => {
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
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
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">Découvrez les Zones Clés</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explorez les opportunités dans les régions les plus dynamiques du Sénégal.
        </p>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
      >
        {zones.map((zone, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Link to={zone.link}>
              <Card className="overflow-hidden h-full group relative rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="aspect-[4/3] bg-muted relative">
                   <img   
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={zone.imageDesc} src="https://images.unsplash.com/photo-1602597081573-72ee378efec6" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
                </div>
                <CardContent className="absolute bottom-0 left-0 right-0 p-4 text-white z-20">
                  <h3 className="text-xl font-semibold mb-1 flex items-center">
                     <MapPin className="h-5 w-5 mr-2 text-accent_brand"/> {zone.name}
                  </h3>
                  <p className="text-sm text-gray-100 line-clamp-2 mb-2">{zone.description}</p>
                   <span className="text-xs font-medium text-accent_brand inline-flex items-center group-hover:underline">
                      Voir les parcelles <ArrowRight className="ml-1 h-3 w-3"/>
                   </span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default FocusZonesSection;