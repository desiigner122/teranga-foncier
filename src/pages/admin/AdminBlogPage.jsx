import { Link } from 'react-router-dom';
// src/pages/admin/AdminBlogPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/ui/spinner';
import { PlusCircle, Edit, Trash2, Search, FileText, Calendar, Image as ImageIcon } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter // <-- CORRECTION ICI
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient'; // Import nommé

const AdminBlogPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [currentPost, setCurrentPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: '',
    category: '',
    published_at: '',
    image_url: '',
    content: '',
    status: 'draft',
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchBlogPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (err) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erreur de chargement des articles de blog",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]);

  const filteredPosts = blogPosts.filter(post =>
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPostClick = () => {
    setModalType('add');
    setCurrentPost(null);
    setFormData({
      title: '',
      slug: '',
      author: '',
      category: '',
      published_at: new Date().toISOString().split('T')[0],
      image_url: '',
      content: '',
      status: 'draft',
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleEditPostClick = (post) => {
    setModalType('edit');
    setCurrentPost(post);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      author: post.author || '',
      category: post.category || '',
      published_at: post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : '',
      image_url: post.image_url || '',
      content: post.content || '',
      status: post.status || 'draft',
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDeletePost = async (postId, postTitle) => {
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', postId);
      if (error) throw error;
      setBlogPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      toast({
        title: "Article supprimé",
        description: `L'article "${postTitle}" a été supprimé.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur de suppression",
        description: err.message,
      });
    }
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    let finalImageUrl = formData.image_url;

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `blog_images/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('public_files')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicURLData } = supabase.storage
          .from('public_files')
          .getPublicUrl(filePath);

        finalImageUrl = publicURLData.publicUrl;
      }

      const postData = {
        ...formData,
        image_url: finalImageUrl,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
        published_at: formData.status === 'published' ? (formData.published_at || new Date().toISOString()) : null,
      };

      if (modalType === 'add') {
        const { error } = await supabase.from('blog_posts').insert([postData]);
        if (error) throw error;
        toast({ title: "Article ajouté", description: `L'article "${formData.title}" a été ajouté.` });
      } else {
        const { error } = await supabase.from('blog_posts').update(postData).eq('id', currentPost.id);
        if (error) throw error;
        toast({ title: "Article mis à jour", description: `L'article "${formData.title}" a été mis à jour.` });
      }
      setIsModalOpen(false);
      fetchBlogPosts();
    } catch (err) {
      toast({
        variant: "destructive",
        title: `Erreur lors de l'${modalType === 'add' ? 'ajout' : 'mise à jour'} de l'article`,
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSavePost} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">Titre</Label>
        <Input id="title" value={formData.title} onChange={handleFormChange} className="col-span-3" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="slug" className="text-right">Slug</Label>
        <Input id="slug" value={formData.slug} onChange={handleFormChange} className="col-span-3" placeholder="auto-généré si vide" disabled={modalType === 'edit'} />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="author" className="text-right">Auteur</Label>
        <Input id="author" value={formData.author} onChange={handleFormChange} className="col-span-3" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">Catégorie</Label>
        <Input id="category" value={formData.category} onChange={handleFormChange} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="published_at" className="text-right">Date de publication</Label>
        <Input id="published_at" type="date" value={formData.published_at} onChange={handleFormChange} className="col-span-3" disabled={formData.status === 'draft'} />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="image_file" className="text-right">Image</Label>
        <Input id="image_file" type="file" onChange={handleImageChange} className="col-span-3" />
      </div>
      {formData.image_url && !imageFile && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Image actuelle</Label>
          <img src={formData.image_url} alt="Aperçu" className="col-span-3 w-24 h-24 object-cover rounded" />
        </div>
      )}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="content" className="text-right">Contenu</Label>
        <Textarea id="content" value={formData.content} onChange={handleFormChange} className="col-span-3" rows={8} required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">Statut</Label>
        <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Sélectionner un statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  );

  if (loading && blogPosts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] text-red-600">
        <p>Erreur: {error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6 lg:p-8"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <FileText className="mr-3 h-8 w-8"/>
          Gestion du Blog
        </h1>
        <Button onClick={handleAddPostClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un article
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Articles de Blog</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, auteur, catégorie..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun article trouvé.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Date Pub.</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>{post.category}</TableCell>
                      <TableCell>{post.published_at ? new Date(post.published_at).toLocaleDateString('fr-FR') : 'N/A'}</TableCell>
                      <TableCell><Badge variant={post.status === 'published' ? 'success' : 'secondary'}>{post.status}</Badge></TableCell>
                      <TableCell className="text-right flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" title="Lire l'article" asChild>
                          <Link to={`/blog/${post.slug}`}>Lire</Link>
                        </Button>
                        <Button variant="ghost" size="sm" title="Modifier" onClick={() => handleEditPostClick(post)}>
                          <Edit className="h-4 w-4"/>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Supprimer" className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4"/>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action supprimera définitivement l'article "{post.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePost(post.id, post.title)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {modalType === 'add' ? 'Ajouter un nouvel article' : `Modifier l'article: "${currentPost?.title}"`}
            </DialogTitle>
            <DialogDescription>
              Veuillez remplir les informations pour {modalType === 'add' ? 'ajouter' : 'modifier'} cet article de blog.
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" onClick={handleSavePost} disabled={loading}>
              {loading && <LoadingSpinner size="small" className="mr-2" />}
              {modalType === 'add' ? "Ajouter l'article" : "Enregistrer les modifications"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminBlogPage;