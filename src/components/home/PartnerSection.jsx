import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Building2, Scale, Briefcase, ArrowRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const partners = [
  { icon: Building2, title: "Mairies & Collectivités", description: "Accédez à une vue d'ensemble du foncier sur votre territoire, suivez les transactions et facilitez la gestion administrative.", color: "text-blue-600" },
  { icon: Scale, title: "Notaires", description: "Collaborez sur une plateforme sécurisée pour la vérification des documents et la finalisation des actes de vente.", color: "text-purple-600" },
  { icon: Briefcase, title: "Agents de l'État (Cadastre, Domaines)", description: "Utilisez nos outils pour une meilleure coordination et un accès simplifié aux informations foncières à jour.", color: "text-green-600" },
  { icon: Building2, title: "Promoteurs Immobiliers", description: "Trouvez des terrains vérifiés et adaptés à vos projets de construction résidentielle ou commerciale.", color: "text-orange-600" }, // Added another partner
];

const PartnerSection = () => {
   const plugin = React.useRef(
     Autoplay({ delay: 4000, stopOnInteraction: true })
   );

  return (
    <section className="bg-gradient-to-b from-muted/30 to-background py-12 md:py-16">
      <div className="container mx-auto px-4">
          <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-3 text-center text-primary"
          >
              Espace Partenaires Institutionnels
          </motion.h2>
          <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-10"
          >
              Nous collaborons avec les acteurs clés du secteur foncier pour garantir la fiabilité et la transparence des informations et des processus.
          </motion.p>

          <motion.div
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true, amount: 0.1 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="relative" // Needed for positioning arrows
          >
             <Carousel
                plugins={[plugin.current]}
                opts={{
                  align: "start",
                  loop: true,
                }}
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                className="w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto" // Adjust max-width as needed
             >
                <CarouselContent className="-ml-4">
                   {partners.map((partner, index) => (
                      <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                         <div className="p-1 h-full">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }} // Stagger within carousel
                                className="p-6 bg-card rounded-xl border shadow-sm text-center h-full flex flex-col items-center hover:shadow-md transition-shadow"
                            >
                              <div className={`mb-4 p-3 bg-primary/10 rounded-full inline-block ${partner.color}`}>
                                 <partner.icon size={32} strokeWidth={1.5} />
                              </div>
                              <h3 className="text-lg md:text-xl font-semibold mb-2 text-foreground">{partner.title}</h3>
                              <p className="text-muted-foreground text-sm flex-grow">{partner.description}</p>
                            </motion.div>
                         </div>
                      </CarouselItem>
                   ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden md:inline-flex" /> {/* Position arrows outside on larger screens */}
                <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden md:inline-flex" />
             </Carousel>
          </motion.div>

           <div className="text-center mt-12"> {/* Increased margin top after carousel */}
              <Button asChild size="lg" variant="outline" className="hover:bg-primary/5 hover:border-primary transition-colors">
                  <Link to="/contact">Devenir Partenaire <ArrowRight className="ml-2 h-4 w-4"/></Link>
              </Button>
          </div>
      </div>
    </section>
  );
};

export default PartnerSection;