import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin } from 'lucide-react';

const ParcelsHeroSearch = ({ onSearch, initialFilters }) => {
  const [search, setSearch] = useState(initialFilters.search || '');
  const [zone, setZone] = useState(initialFilters.zone || 'all');

  const zones = ['Dakar', 'Thiès', 'Mbour', 'Saly', 'Diamniadio', 'Ziguinchor', 'Saint-Louis', 'Kaolack', 'Touba'];

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({ search, zone });
  };

  return (
    <div className="relative bg-gradient-to-b from-background to-muted/40 pt-24 pb-16">
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom-slate-700"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
            Trouvez Votre Terrain Idéal au Sénégal
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
            Recherchez parmi des milliers de parcelles vérifiées par nos experts et les mairies partenaires.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSearch}
          className="max-w-3xl mx-auto bg-card p-4 rounded-xl shadow-lg border flex flex-col md:flex-row items-center gap-3"
        >
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par référence, ville, quartier..."
              className="pl-10 h-12 text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow w-full md:w-56">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger className="pl-10 h-12 text-base">
                  <SelectValue placeholder="Toutes les villes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {zones.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" size="lg" className="h-12 w-full md:w-auto">
              <Search className="h-5 w-5 md:hidden" />
              <span className="hidden md:inline">Rechercher</span>
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default ParcelsHeroSearch;