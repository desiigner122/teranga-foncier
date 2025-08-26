// src/pages/blog/BlogArticlePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/ui/spinner';

const BlogArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error || !data) {
        setError("Article introuvable ou erreur de chargement.");
        setArticle(null);
      } else {
        setArticle(data);
      }
      setLoading(false);
    };
    fetchArticle();
  }, [slug]);

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size="large" /></div>;
  if (error) return <div className="text-center text-red-600 py-16">{error}</div>;
  if (!article) return null;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2">{article.title}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>Par {article.author}</span>
            <span>•</span>
            <span>{article.published_at ? new Date(article.published_at).toLocaleDateString('fr-FR') : 'Non publié'}</span>
            <Badge variant={article.status === 'published' ? 'success' : 'secondary'}>{article.status}</Badge>
          </div>
          {article.category && <Badge className="mb-2">{article.category}</Badge>}
        </CardHeader>
        <CardContent>
          {article.image_url && <img src={article.image_url} alt={article.title} className="mb-4 rounded w-full max-h-96 object-cover" />}
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
        </CardContent>
      </Card>
      <div className="mt-8 text-center">
        <Link to="/blog" className="text-blue-600 hover:underline">← Retour au blog</Link>
      </div>
    </div>
  );
};

export default BlogArticlePage;
