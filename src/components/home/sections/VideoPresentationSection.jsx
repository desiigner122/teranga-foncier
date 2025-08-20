import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const VideoPresentationSection = () => {
  const { toast } = useToast();

  const handlePlayVideo = () => {
    toast({
      title: "Vidéo de Présentation",
      description: "🚧 La lecture de la vidéo n'est pas encore implémentée. Bientôt disponible !",
      duration: 3000,
    });
  };

  return (
    <section className="container mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Découvrez Teranga Foncier en Vidéo</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Une présentation rapide de notre mission, nos services et comment nous sécurisons vos investissements fonciers au Sénégal.
        </p>
        
        <div className="relative aspect-video max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl group border-4 border-primary/30">
          <img   
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            alt="Miniature vidéo de présentation Teranga Foncier avec un paysage sénégalais et le logo" src="https://images.unsplash.com/photo-1697829274101-886439a936d2" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="w-20 h-20 md:w-24 md:h-24 text-white hover:bg-white/20 transition-all duration-300 transform group-hover:scale-110"
              onClick={handlePlayVideo}
              aria-label="Lancer la vidéo de présentation"
            >
              <PlayCircle className="w-16 h-16 md:w-20 md:h-20" />
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default VideoPresentationSection;
