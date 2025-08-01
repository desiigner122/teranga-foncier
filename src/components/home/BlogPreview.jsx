import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { sampleBlogPosts } from '@/data'; // Using sampleBlogPosts from data/index.js

const BlogPreview = () => {
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
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
          {sampleBlogPosts.slice(0, 3).map((post, index) => (
            <motion.div key={post.id} variants={itemVariants}>
              <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 border rounded-xl">
                <div className="aspect-video bg-muted relative">
                   <img  className="w-full h-full object-cover" alt={post.title} src={`https://source.unsplash.com/random/400x300/?${post.category},senegal,${index}`} />
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
      </div>
    </section>
  );
};

export default BlogPreview;