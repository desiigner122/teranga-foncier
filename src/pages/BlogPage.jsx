import React, { useState, useEffect } from 'react';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';

const BlogPage = () => {
  const { data: blogPosts, loading: blogPostsLoading, error: blogPostsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (blogPosts) {
      setFilteredData(blogPosts);
    }
  }, [blogPosts]);
  
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        const { data: posts, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        setBlogPosts(posts || [data, error]);
      } catch (error) {
        // En cas d'erreur, utiliser des données de démonstration
        setBlogPosts([
          {
            id: 1,
            title: "Transformation numérique du foncier au Sénégal",
            description: "Comment l'agenda C50 révolutionne la gestion foncière.",
            content: "Le gouvernement sénégalais lance une initiative ambitieuse...",
            slug: "transformation-numerique-foncier-senegal",
            category: "Politique",
            tag: "Transformation",
            author: "Équipe Teranga Foncier",
            published_at: new Date().toISOString(),
            image_url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

  const cardVariants = {
    initial: { opacity: 0, y: 30 },
    animate: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement des articles...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <Helmet>
      <title>Blog - Actualités sur la Transformation Numérique du Foncier au Sénégal</title>
      <meta name="description" content="Suivez les dernières actualités sur la transformation digitale du foncier au Sénégal, les avancées de l'agenda C50 et les initiatives du gouvernement sénégalais pour un cadastre moderne." />
      <meta name="keywords" content="blog foncier Sénégal, actualités immobilières Sénégal, transformation numérique, transformation digitale, agenda C50, gouvernement Sénégalais" />
      <link rel="canonical" href="https://www.terangafoncier.com/blog" />
    </Helmet>
    <div className="bg-gradient-to-br from-background to-muted/30 min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="container mx-auto py-12 px-4 md:py-20"
      >
        <div className="text-center mb-12 md:mb-16">
          <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">
            Le Blog de Teranga Foncier
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyses sur la transformation digitale du foncier et les politiques du gouvernement sénégalais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.custom
              key={post.id}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              custom={index}
              className="flex"
            >
              <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border-border/50 w-full bg-card">
                <div className="relative h-56 w-full overflow-hidden">
                  <img   
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                    alt={post.title} src="https://images.unsplash.com/photo-1504983875-d3b163aba9e6" />
                  <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                    {post.category}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold leading-tight text-foreground hover:text-primary transition-colors">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-muted-foreground line-clamp-3">{post.excerpt}</CardDescription>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span>{new Date(post.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start pt-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full flex items-center">
                        <Tag className="h-3 w-3 mr-1" /> {tag}
                      </span>
                    ))}
                  </div>
                  <Button variant="ghost" className="text-primary hover:text-primary/80 p-0 h-auto" asChild>
                     <Link to={`/blog/${post.slug}`}>
                       Lire la suite <ArrowRight className="h-4 w-4 ml-1.5" />
                     </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.custom>
          ))}
        </div>
        
         <div className="text-center mt-12">
          <Button 
            variant="outline"
            size="lg"
            onClick={() => alert("🚧 Fonctionnalité 'Charger plus d'articles' non implémentée.")}
            className="border-primary text-primary hover:bg-primary/10"
          >
            Charger plus d'articles
          </Button>
        </div>
      </motion.div>
    </div>
    </>
  );
};

export default BlogPage;
