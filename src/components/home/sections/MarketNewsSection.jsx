import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, TrendingUp } from 'lucide-react';
// Importation de Supabase Client
import { supabase } from '@/lib/supabaseClient'; // Assurez-vous que ce chemin est correct
import LoadingSpinner from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';

const MarketNewsSection = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNewsItems = async () => {
      setLoading(true);
      try {
        // Récupérer les articles de blog qui sont des "Actualités du Marché Immobilier" ou "Juridique"
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .in('category', ["Marché Immobilier", "Juridique"]) // Filtrer par catégories spécifiques
          .order('published_at', { ascending: false })
          .limit(3);

        if (error) {
          throw error;
        }

        if (data.length === 0) {
            console.warn("Aucune actualité du marché foncier trouvée dans la base de données. Affichage de données par défaut.");
            // Optionnel: charger des données mockées si la DB est vide
            setNewsItems([
                { id: 'mn1', title: 'Titre Foncier vs Bail vs Délibération', published_at: '2025-07-01', excerpt: 'Une explication claire des documents fonciers au Sénégal.', category: 'Juridique', slug: '/blog/titre-foncier-bail-deliberation', image_url: 'https://images.unsplash.com/photo-1667118300849-1872d823219f' },
                { id: 'mn2', title: 'Les Zones d\'Avenir pour l\'Investissement Foncier à Dakar', published_at: '2025-06-21', excerpt: 'Explorez les quartiers émergents offrant les meilleures opportunités.', category: 'Marché Immobilier', slug: '/blog/zones-avenir-investissement-dakar', image_url: 'https://images.unsplash.com/photo-1667118300849-1872d823219f' },
                { id: 'mn3', title: 'L\'impact des Nouvelles Infrastructures sur la Valeur Foncière', published_at: '2025-05-28', excerpt: 'Comment les projets d\'infrastructure influencent le marché immobilier sénégalais.', category: 'Marché Immobilier', slug: '/blog/impact-nouvelles-infrastructures', image_url: 'https://images.unsplash.com/photo-1667118300849-1872d823219f' },
            ]);
        } else {
            setNewsItems(data.map(post => ({
                id: post.id,
                title: post.title,
                date: new Date(post.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
                excerpt: post.excerpt,
                category: post.category,
                image_url: post.image_url,
                slug: `/blog/${post.slug}`,
                description: `Actualité du marché immobilier au Sénégal: ${post.title}`
            })));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des actualités du marché:", error.message);
        toast({
          title: "Erreur",
          description: "Impossible de charger les actualités du marché. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
        // En cas d'erreur, afficher des données mockées pour ne pas casser l'UI
        setNewsItems([
            { id: 'mn1', title: 'Titre Foncier vs Bail vs Délibération', published_at: '2025-07-01', excerpt: 'Une explication claire des documents fonciers au Sénégal.', category: 'Juridique', slug: '/blog/titre-foncier-bail-deliberation', image_url: 'https://images.unsplash.com/photo-1667118300849-1872d823219f' },
            { id: 'mn2', title: 'Les Zones d\'Avenir pour l\'Investissement Foncier à Dakar', published_at: '2025-06-21', excerpt: 'Explorez les quartiers émergents offrant les meilleures opportunités.', category: 'Marché Immobilier', slug: '/blog/zones-avenir-investissement-dakar', image_url: 'https://images.unsplash.com/photo-1667118300849-1872d823219f' },
            { id: 'mn3', title: 'L\'impact des Nouvelles Infrastructures sur la Valeur Foncière', published_at: '2025-05-28', excerpt: 'Comment les projets d\'infrastructure influencent le marché immobilier sénégalais.', category: 'Marché Immobilier', slug: '/blog/impact-nouvelles-infrastructures', image_url: 'https://images.unsplash.com/photo-1667118300849-1872d823219f' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsItems();
  }, [toast]);

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12 md:py-16 flex justify-center items-center min-h-[300px]">
        <LoadingSpinner size="large" />
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="text-center mb-10"
      >
        <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-primary mb-3 flex items-center justify-center">
          <TrendingUp className="h-8 w-8 mr-3 text-primary" /> Actualités du Marché Foncier
        </motion.h2>
        <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Restez informé des dernières tendances, réglementations et opportunités du secteur foncier au Sénégal.
        </motion.p>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        {newsItems.map((newsItem) => (
          <motion.div key={newsItem.id} variants={itemVariants}>
            <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 border rounded-xl bg-card">
              <div className="aspect-video bg-muted relative">
                 <img
                    className="w-full h-full object-cover"
                    alt={newsItem.title}
                    src={newsItem.image_url || `https://placehold.co/400x300/E0E7FF/3F51B5?text=${encodeURIComponent(newsItem.title)}`}
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x300/E0E7FF/3F51B5?text=Image+Non+Trouvée"; }}
                 />
                 <div className="absolute inset-0 bg-black/10"></div>
                 <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
                    {newsItem.category}
                 </span>
              </div>
              <CardHeader>
                <CardTitle className="text-lg leading-snug text-foreground">{newsItem.title}</CardTitle>
                <p className="text-xs text-muted-foreground pt-1 flex items-center">
                   <CalendarDays className="h-3.5 w-3.5 mr-1.5"/> {newsItem.date}
                </p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{newsItem.excerpt}</p>
              </CardContent>
              <CardFooter>
                <Button variant="link" asChild className="p-0 h-auto text-primary">
                  <Link to={newsItem.slug}>Lire la suite <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mt-10"
      >
        <Button size="lg" asChild variant="outline" className="hover:bg-primary/5 hover:border-primary transition-colors">
          <Link to="/blog">Voir Toutes les Actualités</Link>
        </Button>
      </motion.div>
    </section>
  );
};

export default MarketNewsSection;
