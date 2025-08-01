import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();
  const carouselImages = [
    { alt: "Skyline moderne de Diamniadio au Sénégal", desc: "Ville nouvelle Diamniadio Sénégal architecture moderne" },
    { alt: "Paysage sénégalais avec baobabs au coucher du soleil", desc: "Baobabs majestueux au coucher de soleil Sénégal" },
    { alt: "Vue aérienne d'une zone résidentielle en développement", desc: "Lotissement résidentiel Sénégal vue aérienne construction" },
    { alt: "Plage tropicale au Sénégal avec pirogues", desc: "Plage de sable fin Saly Sénégal pirogues colorées" },
  ];

  const plugin = React.useRef(
     Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  const handleSearch = (event) => {
    event.preventDefault();
    const searchTerm = event.target.elements.search.value;
    if (searchTerm) {
      navigate(`/parcelles?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center text-center px-4 overflow-hidden bg-gradient-to-t from-black/30 to-transparent">
      <Carousel
        plugins={[plugin.current]}
        opts={{ loop: true }}
        className="absolute inset-0 z-0 w-full h-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="h-full">
          {carouselImages.map((img, index) => (
            <CarouselItem key={index} className="h-full">
              {/* Increased overlay darkness */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10"></div>
              <img 
                className="w-full h-full object-cover" alt={img.alt} src="https://images.unsplash.com/photo-1675023112817-52b789fd2ef0" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="relative z-20 text-white max-w-4xl p-6 rounded-lg">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7, type: "spring", stiffness: 100 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-shadow-lg"
        >
          Achetez votre terrain au Sénégal, Sans Risque. Même depuis l'étranger.
        </motion.h1>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7, type: "spring", stiffness: 100 }}
          className="text-lg md:text-xl lg:text-2xl mb-8 text-gray-100 text-shadow-md" // Slightly lighter text for better contrast
        >
          Teranga Foncier sécurise votre investissement en vérifiant chaque parcelle et en luttant contre la fraude. La solution idéale pour la diaspora et les acheteurs vigilants.
        </motion.p>

        <motion.form
          onSubmit={handleSearch}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7, type: "spring", stiffness: 100 }}
          className="max-w-xl mx-auto mb-8"
        >
          <div className="relative">
            <Input
              type="search"
              name="search"
              placeholder="Entrez un titre foncier, une zone, une référence..."
              className="w-full h-12 pl-12 pr-4 rounded-full bg-white/95 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-accent_brand border-transparent shadow-md"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
             <Button type="submit" className="absolute right-1 top-1 bottom-1 h-auto px-6 rounded-full bg-accent_brand hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all">
               Rechercher
             </Button>
          </div>
        </motion.form>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7, type: "spring", stiffness: 100 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" asChild className="bg-gradient-to-r from-green-600 to-accent_brand hover:opacity-90 text-white font-bold shadow-lg transform hover:scale-105 transition-transform duration-300 ease-out">
            <Link to="/parcelles">Voir les Terrains Vérifiés</Link>
          </Button>
          {/* Added subtle background for better readability */}
          <Button size="lg" variant="outline" className="border-white/60 text-white bg-black/20 hover:bg-white/20 backdrop-blur-sm shadow-lg transform hover:scale-105 transition-transform duration-300 ease-out" asChild>
            <Link to="/how-it-works">Comment ça Marche ?</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;