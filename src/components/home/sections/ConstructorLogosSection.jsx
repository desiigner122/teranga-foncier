import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Building, ArrowRight, CheckCircle } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const constructorPartners = [
  { name: "Senegindia SA", alt: "Logo Senegindia", desc: "Constructeur majeur projets résidentiels et commerciaux.", color: "text-blue-600", website: "#" },
  { name: "WinWin Afrique", alt: "Logo WinWin Afrique", desc: "Spécialiste en logements sociaux et infrastructures.", color: "text-green-600", website: "#" },
  { name: "CDE", alt: "Logo CDE", desc: "Compagnie Dakaroise d'Entreprise, acteur historique du BTP.", color: "text-red-600", website: "#" },
  { name: "CSE Immobilier", alt: "Logo CSE Immobilier", desc: "Promotion immobilière et projets d'envergure.", color: "text-purple-600", website: "#" },
  { name: "GETRAN", alt: "Logo GETRAN", desc: "Travaux publics, génie civil et bâtiment.", color: "text-orange-600", website: "#" },
  { name: "BatiPlus", alt: "Logo BatiPlus", desc: "Construction et rénovation de bâtiments.", color: "text-teal-600", website: "#" },
  { name: "Eiffage Sénégal", alt: "Logo Eiffage Sénégal", desc: "Grands projets d'infrastructures et bâtiment.", color: "text-yellow-600", website: "#" },
];

const ConstructorLogosSection = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 3500, stopOnInteraction: true })
  );

  return (
    <section className="container mx-auto px-4">
        <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-3 text-center text-primary"
        >
            Nos Partenaires Constructeurs de Confiance
        </motion.h2>
        <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-6"
        >
            Nous collaborons avec des entreprises de construction réputées, engagées sur la qualité, le respect des normes et des délais. Teranga Foncier facilite la mise en relation pour vos projets de construction sur les terrains acquis via notre plateforme sécurisée.
        </motion.p>
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex justify-center items-center gap-2 text-sm text-green-600 font-medium mb-10"
        >
            <CheckCircle className="h-5 w-5" />
            <span>Qualité Garantie</span>
            <CheckCircle className="h-5 w-5 ml-2" />
            <span>Respect des Normes</span>
            <CheckCircle className="h-5 w-5 ml-2" />
            <span>Délais Maîtrisés</span>
        </motion.div>


        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true, amount: 0.1 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="relative"
        >
           <Carousel
              plugins={[plugin.current]}
              opts={{
                align: "start",
                loop: true,
              }}
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
              className="w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto"
           >
              <CarouselContent className="-ml-4">
                 {constructorPartners.map((partner, index) => (
                    <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                       <div className="p-1 h-full">
                          <motion.div
                              initial={{ opacity: 0, y: 50 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, amount: 0.2 }}
                              transition={{ duration: 0.5, delay: index * 0.05 }}
                              className="p-6 bg-card rounded-xl border shadow-sm text-center h-full flex flex-col items-center hover:shadow-md transition-shadow group"
                          >
                             <div className={`mb-4 p-3 bg-primary/10 rounded-full inline-block ${partner.color} group-hover:scale-110 transition-transform`}>
                                 <Building size={32} strokeWidth={1.5} />
                             </div>
                            <h3 className="text-lg md:text-xl font-semibold mb-2 text-foreground">{partner.name}</h3>
                            <p className="text-muted-foreground text-sm flex-grow mb-3">{partner.desc}</p>
                            <Button variant="link" size="sm" asChild className={`${partner.color} p-0 h-auto`}>
                                <a href={partner.website} target="_blank" rel="noopener noreferrer">
                                    Visiter le site <ArrowRight className="ml-1 h-3.5 w-3.5"/>
                                </a>
                            </Button>
                          </motion.div>
                       </div>
                    </CarouselItem>
                 ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden md:inline-flex" />
              <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden md:inline-flex" />
           </Carousel>
        </motion.div>
         <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline" className="hover:bg-primary/5 hover:border-primary transition-colors">
                <Link to="/partners">Voir Tous Nos Partenaires</Link>
            </Button>
        </div>
    </section>
  );
};

export default ConstructorLogosSection;