import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchType, setSearchType] = useState('tf');
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchValue) {
      navigate(`/parcelles?search=${encodeURIComponent(searchValue)}&type=${searchType}`);
    } else {
      toast({
        title: "Champ requis",
        description: "Veuillez entrer une valeur de recherche.",
        variant: "destructive",
      });
    }
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case 'zone': return 'Ex: Dakar, Saly...';
      case 'superficie': return 'Ex: 150m2, >500m2...';
      case 'tf':
      default: return 'Ex: TF 12345/DG';
    }
  };

  const getIcon = () => {
    switch (searchType) {
      case 'zone': return <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />;
      case 'superficie': return <Maximize className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />;
      case 'tf':
      default: return <ShieldCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />;
    }
  };


  return (
    <div className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center text-center px-4 overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-accent_brand/90">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <div className="relative z-20 text-white max-w-4xl p-6 rounded-lg">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7, type: "spring", stiffness: 100 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-shadow-lg"
        >
          Votre Avenir Foncier Commence Ici.
        </motion.h1>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7, type: "spring", stiffness: 100 }}
          className="text-lg md:text-xl lg:text-2xl mb-8 text-gray-100 text-shadow-md"
        >
          Recherchez, vérifiez et investissez dans des terrains au Sénégal en toute sécurité.
        </motion.p>

        <motion.form
          onSubmit={handleSearch}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7, type: "spring", stiffness: 100 }}
          className="max-w-2xl mx-auto mb-8 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-full sm:w-[180px] h-14 bg-white/95 text-gray-800 border-r border-gray-200 rounded-l-xl focus:ring-2 focus:ring-accent_brand text-base">
                <SelectValue placeholder="Type de recherche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tf">Titre Foncier</SelectItem>
                <SelectItem value="zone">Zone</SelectItem>
                <SelectItem value="superficie">Superficie</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-grow">
               {getIcon()}
              <Input
                type="search"
                name="search"
                placeholder={getPlaceholder()}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-r-xl bg-white/95 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-accent_brand border-transparent text-base"
              />
            </div>
             <Button type="submit" size="lg" className="h-14 px-8 rounded-xl bg-accent_brand hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all text-base font-semibold shrink-0">
               <Search className="h-5 w-5 mr-2"/> Rechercher
             </Button>
          </div>
        </motion.form>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7, type: "spring", stiffness: 100 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" asChild className="bg-white text-primary hover:bg-gray-100 font-bold shadow-lg transform hover:scale-105 transition-transform duration-300 ease-out">
            <Link to="/parcelles">Voir les Terrains Vérifiés</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white/60 text-white bg-transparent hover:bg-white/20 backdrop-blur-sm shadow-lg transform hover:scale-105 transition-transform duration-300 ease-out" asChild>
            <Link to="/how-it-works">Comment ça Marche ?</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
