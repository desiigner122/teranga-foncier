import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import supabase from "../../lib/supabaseClient";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "../../components/ui/table";

const BlogPreviewSection = () => {
  
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
const { data: blogPosts, loading: blogPostsLoading, error: blogPostsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (blogPosts) {
      setFilteredData(blogPosts);
    }
  }, [blogPosts]);
  
  useEffect(() => {
    const fetchBlogPosts = async () => {
      setLoading(true);
      try {
        // Récupérer les articles de blog depuis la table 'blog_posts'
        // Assurez-vous que votre table 'blog_posts' existe dans Supabase
        // avec des colonnes comme 'id', 'title', 'published_at', 'excerpt', 'slug', 'image_url'
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('published_at', { ascending: false }) // Trier par date de publication
          .limit(3); // Limiter à 3 articles pour la prévisualisation

        if (error) {
          throw error;
        }

        if (data.length === 0) {            // Optionnel: charger des données mockées si la DB est vide
            setBlogPosts([
                { id: 'bp1', title: '5 Conseils pour Acheter un Terrain au Sénégal depuis l\'Étranger', published_at: '2025-07-24', excerpt: 'Découvrez nos meilleurs conseils pour un investissement foncier réussi depuis la diaspora.', slug: '5-conseils-achat-terrain-diaspora', image_url: 'https://images.unsplash.com/photo-1504983875-d3b163aba9e6' },
                { id: 'bp2', title: 'Titre Foncier vs Bail vs Délibération : Comprendre les Différences', published_at: '2025-07-17', excerpt: 'Une explication claire des documents fonciers au Sénégal pour sécuriser votre investissement.', slug: 'titre-foncier-bail-deliberation', image_url: 'https://images.unsplash.com/photo-1504983875-d3b163aba9e6' },
                { id: 'bp3', title: 'Les Zones d\'Avenir pour l\'Investissement Foncier à Dakar et Environs', published_at: '2025-06-27', excerpt: 'Explorez les quartiers émergents offrant les meilleures opportunités d\'investissement immobilier.', slug: 'zones-avenir-investissement-dakar', image_url: 'https://images.unsplash.com/photo-1504983875-d3b163aba9e6' },
            ]);
        } else {
            setBlogPosts(data);
        }
      } catch (error) {        toast({
          title: "Erreur",
          description: "Impossible de charger les articles de blog. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
        // En cas d'erreur, afficher des données mockées pour ne pas casser l'UI
        setBlogPosts([
            { id: 'bp1', title: '5 Conseils pour Acheter un Terrain au Sénégal depuis l\'Étranger', published_at: '2025-07-24', excerpt: 'Découvrez nos meilleurs conseils pour un investissement foncier réussi depuis la diaspora.', slug: '5-conseils-achat-terrain-diaspora', image_url: 'https://images.unsplash.com/photo-1504983875-d3b163aba9e6' },
            { id: 'bp2', title: 'Titre Foncier vs Bail vs Délibération : Comprendre les Différences', published_at: '2025-07-17', excerpt: 'Une explication claire des documents fonciers au Sénégal pour sécuriser votre investissement.', slug: 'titre-foncier-bail-deliberation', image_url: 'https://images.unsplash.com/photo-1504983875-d3b163aba9e6' },
            { id: 'bp3', title: 'Les Zones d\'Avenir pour l\'Investissement Foncier à Dakar et Environs', published_at: '2025-06-27', excerpt: 'Explorez les quartiers émergents offrant les meilleures opportunités d\'investissement immobilier.', slug: 'zones-avenir-investissement-dakar', image_url: 'https://images.unsplash.com/photo-1504983875-d3b163aba9e6' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [toast]);

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading || dataLoading) {
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
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">Nos Derniers Articles & Conseils</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Restez informé sur le marché foncier sénégalais et découvrez nos astuces pour un investissement réussi.
        </p>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        {blogPosts.map((post) => (
          <motion.div key={post.id} variants={itemVariants}>
            <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 border rounded-xl">
              <div className="aspect-video bg-muted relative">
                 <img
                    className="w-full h-full object-cover"
                    alt={post.title}
                    src={post.image_url || `https://placehold.co/400x300/E0E7FF/3F51B5?text=${encodeURIComponent(post.title)}`}
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x300/E0E7FF/3F51B5?text=Image+Non+Trouvée"; }}
                 />
                 <div className="absolute inset-0 bg-black/10"></div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg leading-snug">{post.title}</CardTitle>
                <p className="text-xs text-muted-foreground pt-1 flex items-center">
                   <Calendar className="h-3.5 w-3.5 mr-1.5"/> {new Date(post.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
              </CardContent>
              <CardFooter>
                <Button variant="link" asChild className="p-0 h-auto text-primary">
                  <Link to={`/blog/${post.slug}`}>Lire la suite <ArrowRight className="ml-1 h-4 w-4" /></Link>
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
          <Link to="/blog">Voir Tous les Articles</Link>
        </Button>
      </motion.div>
    </section>
  );
};

export default BlogPreviewSection;
