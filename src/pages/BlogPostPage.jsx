import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sampleBlogPosts } from '@/data';
import { Calendar, User, Tag, ArrowLeft, Share2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const post = sampleBlogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-4xl font-bold">Article non trouvé</h1>
        <p className="text-muted-foreground mt-4">Désolé, l'article que vous cherchez n'existe pas ou a été déplacé.</p>
        <Button asChild className="mt-8">
          <Link to="/blog">Retour au Blog</Link>
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      })
      .then(() => toast({ title: "Article partagé !", description: "L'article a été partagé avec succès."}))
      .catch((error) => toast({ title: "Erreur de partage", description: `Impossible de partager : ${error}`, variant: "destructive" }));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Lien copié !", description: "Le lien de l'article a été copié dans le presse-papiers."});
    }
  };
  
  const formattedContent = post.content.split('\n').map((paragraph, index) => {
    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
      return <h2 key={index} className="text-2xl font-semibold mt-6 mb-3 text-foreground">{paragraph.substring(2, paragraph.length - 2)}</h2>;
    }
    if (paragraph.startsWith('*   ')) {
       return <li key={index} className="ml-5 list-disc text-muted-foreground leading-relaxed">{paragraph.substring(4)}</li>;
    }
    return <p key={index} className="my-4 text-muted-foreground leading-relaxed">{paragraph}</p>;
  });


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-background text-foreground"
    >
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        <img  
            alt={post.title} 
            className="absolute inset-0 w-full h-full object-cover" src="https://images.unsplash.com/photo-1504983875-d3b163aba9e6" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-10">
            <Badge variant="secondary" className="mb-2 bg-primary/80 text-primary-foreground backdrop-blur-sm">{post.category}</Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight shadow-text">
              {post.title}
            </h1>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl py-8 px-4 md:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-4 mb-3 sm:mb-0">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1.5" />
              <span>{post.author_name}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5" />
              <span>{new Date(post.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleShare}><Share2 className="h-4 w-4 mr-1.5"/> Partager</Button>
            <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-1.5"/> Imprimer</Button>
          </div>
        </div>
        
        <Separator className="my-6" />

        <article className="prose prose-lg dark:prose-invert max-w-none text-foreground">
          {formattedContent}
        </article>

        <Separator className="my-8" />

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-foreground">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" /> {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour au Blog
        </Button>
      </div>
    </motion.div>
  );
};

export default BlogPostPage;