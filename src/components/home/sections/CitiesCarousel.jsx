import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const cities = [
  { name: "Dakar", description: "La capitale vibrante", imageDesc: "Skyline de Dakar avec l'océan", link: "/parcelles?zone=Dakar" },
  { name: "Saly", description: "La perle balnéaire", imageDesc: "Plage de sable blanc à Saly avec des cocotiers", link: "/parcelles?zone=Saly" },
  { name: "Diamniadio", description: "Le pôle du futur", imageDesc: "Vue aérienne du centre de conférence de Diamniadio", link: "/parcelles?zone=Diamniadio" },
  { name: "Thiès", description: "Le carrefour ferroviaire", imageDesc: "Paysage urbain de Thiès avec des bâtiments historiques", link: "/parcelles?zone=Thiès" },
  { name: "Ziguinchor", description: "Le cœur de la Casamance", imageDesc: "Paysage luxuriant de la Casamance près de Ziguinchor", link: "/parcelles?zone=Ziguinchor" },
  { name: "Saint-Louis", description: "L'élégance historique", imageDesc: "Le pont Faidherbe à Saint-Louis au coucher du soleil", link: "/parcelles?zone=Saint-Louis" },
  { name: "Mbour", description: "Le port de pêche animé", imageDesc: "Bateaux de pêche colorés sur la plage de Mbour", link: "/parcelles?zone=Mbour" },
  { name: "Touba", description: "La ville sainte", imageDesc: "La grande mosquée de Touba", link: "/parcelles?zone=Touba" },
];

const CitiesCarousel = () => {
  return (
    <div className="container mx-auto px-4">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold mb-4 text-center text-primary"
      >
        Explorez le Sénégal par Ville
      </motion.h2>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto"
      >
        Cliquez sur une ville pour découvrir les opportunités foncières qu'elle a à offrir.
      </motion.p>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {cities.map((city, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="p-1"
              >
                <Card className="overflow-hidden group relative rounded-xl shadow-lg border-border/50 hover:shadow-primary/20 transition-all duration-300">
                  <Link to={city.link} className="block">
                    <CardContent className="flex aspect-[3/4] items-end p-6 text-white">
                      <div className="absolute inset-0 z-0">
                        <img 
                          alt={city.imageDesc}
                          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                         src="https://images.unsplash.com/photo-1700917180642-02e6a2cecb5e" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent group-hover:from-black/80 transition-all duration-300"></div>
                      </div>
                      <div className="relative z-10 w-full">
                        <div className="flex items-center text-lg">
                          <MapPin className="h-5 w-5 mr-2" />
                          <h3 className="text-2xl font-bold">{city.name}</h3>
                        </div>
                        <p className="text-sm opacity-90 mb-4">{city.description}</p>
                        <div className="flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          Découvrir <ArrowRight className="ml-1.5 h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
};

export default CitiesCarousel;
