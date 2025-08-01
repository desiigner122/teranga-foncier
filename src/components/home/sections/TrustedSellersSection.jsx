import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Landmark, Building2 } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const trustedSellers = [
  { name: 'Mairie de Dakar', type: 'Mairie', logo: 'mairie', color: 'text-blue-600', link: '/parcelles?ownerType=Mairie' },
  { name: 'Senegindia SA', type: 'Promoteur Certifié', logo: 'building', color: 'text-green-600', link: '/parcelles?ownerType=Promoteur' },
  { name: 'Mairie de Saly', type: 'Mairie', logo: 'mairie', color: 'text-blue-600', link: '/parcelles?ownerType=Mairie' },
  { name: 'CSE Immobilier', type: 'Promoteur Certifié', logo: 'building', color: 'text-green-600', link: '/parcelles?ownerType=Promoteur' },
  { name: 'Mairie de Thiès', type: 'Mairie', logo: 'mairie', color: 'text-blue-600', link: '/parcelles?ownerType=Mairie' },
  { name: 'BatiPlus', type: 'Promoteur Certifié', logo: 'building', color: 'text-green-600', link: '/parcelles?ownerType=Promoteur' },
];

const SellerIcon = ({ type, className }) => {
  if (type === 'Mairie') return <Landmark className={className} />;
  return <Building2 className={className} />;
};

const TrustedSellersSection = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 3500, stopOnInteraction: true })
  );

  return (
    <section className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">Nos Vendeurs de Confiance</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Achetez en toute sérénité auprès de nos partenaires institutionnels et promoteurs certifiés, dont la fiabilité a été rigoureusement vérifiée.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Carousel
          plugins={[plugin.current]}
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: 2,
          }}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {trustedSellers.map((seller, index) => (
              <CarouselItem key={index} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5">
                <Link to={seller.link}>
                  <div className="p-4 bg-card rounded-xl border shadow-sm text-center h-full flex flex-col items-center justify-center hover:shadow-md transition-shadow group">
                    <SellerIcon type={seller.type} className={`h-10 w-10 mb-3 ${seller.color} group-hover:scale-110 transition-transform`} />
                    <h3 className="text-base font-semibold text-foreground truncate w-full">{seller.name}</h3>
                    <p className={`text-xs ${seller.color} font-medium`}>{seller.type}</p>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </motion.div>

      <div className="text-center mt-12">
        <Button asChild size="lg">
          <Link to="/parcelles?verified=true">
            Voir toutes les offres certifiées <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default TrustedSellersSection;