import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Building2, Scale, Briefcase, ArrowRight, Landmark, Smartphone, Banknote as BankIcon } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const senegal2050LogoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/bcc20f7d-f81b-4a6f-9229-7d6ba486204e/6cbcb36b5ee5efb7f4a236679ac5ad51.png";
const waveLogoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/bcc20f7d-f81b-4a6f-9229-7d6ba486204e/a6815a54888f8206821508084773171d.png";
const orangeMoneyLogoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/bcc20f7d-f81b-4a6f-9229-7d6ba486204e/351505325811092910a2405c38f51b6c.png";
const sgbsLogoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/bcc20f7d-f81b-4a6f-9229-7d6ba486204e/9581b28a18055b0d581829114096524f.png";
const bdsLogoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/bcc20f7d-f81b-4a6f-9229-7d6ba486204e/9581b28a18055b0d581829114096524f.png";


const partners = [
  { 
    icon: Landmark, 
    title: "Sénégal 2050", 
    description: "Aligné avec l'Agenda National de Transformation pour un développement foncier durable et inclusif.", 
    isImage: true,
    imageUrl: senegal2050LogoUrl,
    altText: "Logo Sénégal 2050"
  },
  { 
    icon: Smartphone, 
    title: "Wave", 
    description: "Payez vos frais et timbres en toute simplicité avec le leader du mobile money au Sénégal.", 
    isImage: true,
    imageUrl: waveLogoUrl,
    altText: "Logo Wave Mobile Money"
  },
  { 
    icon: Smartphone, 
    title: "Orange Money", 
    description: "Une solution de paiement mobile fiable et accessible partout pour sécuriser vos transactions.", 
    isImage: true,
    imageUrl: orangeMoneyLogoUrl,
    altText: "Logo Orange Money"
  },
  { 
    icon: BankIcon, 
    title: "SGBS", 
    description: "Notre partenaire bancaire de confiance pour les virements et la sécurisation des fonds.", 
    isImage: true,
    imageUrl: sgbsLogoUrl,
    altText: "Logo SGBS"
  },
  { 
    icon: BankIcon, 
    title: "BDS", 
    description: "La Banque du Sénégal nous accompagne dans la structuration des financements de projets.", 
    isImage: true,
    imageUrl: bdsLogoUrl,
    altText: "Logo Banque du Sénégal"
  },
  { icon: Building2, title: "Mairies & Collectivités", description: "Accédez à une vue d'ensemble du foncier sur votre territoire et facilitez la gestion administrative.", color: "text-blue-600" },
  { icon: Scale, title: "Notaires", description: "Collaborez sur une plateforme sécurisée pour la vérification et la finalisation des actes de vente.", color: "text-purple-600" },
  { icon: Briefcase, title: "Agents de l'État", description: "Utilisez nos outils pour une meilleure coordination et un accès simplifié aux informations foncières.", color: "text-green-600" },
];

const PartnerCarouselSection = () => {
   const plugin = React.useRef(
     Autoplay({ delay: 4000, stopOnInteraction: true })
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
            Nos Partenaires de Confiance
        </motion.h2>
        <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-10"
        >
            Nous collaborons avec les acteurs institutionnels, financiers et technologiques clés pour garantir la fiabilité, la sécurité et un développement harmonieux.
        </motion.p>

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
              className="w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-6xl mx-auto"
           >
              <CarouselContent className="-ml-4">
                 {partners.map((partner, index) => (
                    <CarouselItem key={index} className="pl-4 md:basis-1/3 lg:basis-1/4">
                       <div className="p-1 h-full">
                          <motion.div
                              initial={{ opacity: 0, y: 50 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, amount: 0.2 }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className="p-6 bg-card rounded-xl border shadow-sm text-center h-full flex flex-col items-center justify-center hover:shadow-md transition-shadow"
                          >
                            {partner.isImage ? (
                              <img src={partner.imageUrl} alt={partner.altText} className="h-12 w-auto mb-4 object-contain"/>
                            ) : (
                              <div className={`mb-4 p-3 bg-primary/10 rounded-full inline-block ${partner.color}`}>
                                 <partner.icon size={32} strokeWidth={1.5} />
                              </div>
                            )}
                            <h3 className="text-base font-semibold mb-2 text-foreground">{partner.title}</h3>
                            <p className="text-muted-foreground text-xs flex-grow">{partner.description}</p>
                          </motion.div>
                       </div>
                    </CarouselItem>
                 ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden lg:inline-flex" />
              <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden lg:inline-flex" />
           </Carousel>
        </motion.div>

         <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline" className="hover:bg-primary/5 hover:border-primary transition-colors">
                <Link to="/contact?subject=Partenariat">Devenir Partenaire <ArrowRight className="ml-2 h-4 w-4"/></Link>
            </Button>
        </div>
    </section>
  );
};

export default PartnerCarouselSection;
