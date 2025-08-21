import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import SupabaseDataService from '../../../services/SupabaseDataService';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "../../components/ui/table";

const FeaturedParcelsSection = () => {
  
  const [loading, setLoading] = useState(false);
const { data: featuredParcels, loading: featuredParcelsLoading, error: featuredParcelsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (featuredParcels) {
      setFilteredData(featuredParcels);
    }
  }, [featuredParcels]);
  
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let data = await SupabaseDataService.getFeaturedParcels(6);
        if (!data || data.length === 0) {
          // fallback: take most recent available parcels
            data = await SupabaseDataService.searchParcels({ status: 'available', limit: 6 });
        }
        setFeaturedParcels((data || [data, error]).slice(0,3));
      } catch (e) {        setFeaturedParcels([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="container mx-auto px-4">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold mb-10 text-center text-primary"
      >
        Nos Parcelles à la Une
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {loading && (
          <p className="col-span-full text-center text-muted-foreground">Chargement...</p>
        )}
        {!loading && featuredParcels.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted-foreground">Aucune parcelle disponible pour le moment.</p>
        )}
        {featuredParcels.map((parcel, index) => (
          <motion.div
            key={parcel.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <ParcelCard parcel={parcel} />
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild className="hover:bg-primary/5 hover:border-primary transition-colors">
              <Link to="/parcelles">Découvrir Toutes les Parcelles <ArrowRight className="ml-2 h-4 w-4"/></Link>
          </Button>
      </div>
    </section>
  );
};

export default FeaturedParcelsSection;
