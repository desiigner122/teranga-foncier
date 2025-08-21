import React, { useState, useMemo } from 'react';
import { Eye, Trash2, Calendar, Upload, Search, FolderOpen, Image, FileText, File, Download, Share2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Tabs, TabsTrigger, TabsList, TabsContent } from '../../../components/ui/tabs';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import SupabaseDataService from '../../../services/supabaseDataService';
import { motion } from 'framer-motion';
import { useToast } from '../../../components/ui/use-toast';
import { useAuth } from '../../../context/AuthContext';
import { useRealtimeTable } from '../../../hooks/useRealtimeTable';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "../../components/ui/table";

const DigitalVaultPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadLoading, setUploadLoading] = useState(false);

  const { data: documents, loading: documentsLoading, error: documentsError, refetch } = useRealtimeTable('documents', {
    filters: user ? [['user_id', 'eq', user.id]] : [],
    enabled: !!user,
  });

  const categories = [
    { id: 'all', label: 'Tout', icon: FolderOpen },
    { id: 'identity', label: 'Identité', icon: FileText },
    { id: 'property', label: 'Propriété', icon: FileText },
    { id: 'contracts', label: 'Contrats', icon: FileText },
    { id: 'receipts', label: 'Reçus', icon: FileText },
    { id: 'photos', label: 'Photos', icon: Image },
    { id: 'other', label: 'Autre', icon: File },
  ];

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0 || !user) return;

    setUploadLoading(true);
    try {
      for (const file of files) {
        await SupabaseDataService.uploadUserDocument(file, {
          category: selectedCategory === 'all' ? 'other' : selectedCategory,
          user_id: user.id,
        });
      }
      
      toast({
        title: "Documents téléchargés",
        description: `${files.length} document(s) ajouté(s) à votre coffre-fort numérique`
      });
      
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de télécharger les documents: ${error.message}`
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const deleteDocument = async (documentId, documentName) => {
    try {
      await SupabaseDataService.deleteUserDocument(documentId);
      toast({
        title: "Document supprimé",
        description: `"${documentName}" a été supprimé de votre coffre-fort`
      });
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer ce document"
      });
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (['pdf'].includes(extension)) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (['doc', 'docx'].includes(extension)) {
      return <FileText className="h-8 w-8 text-blue-600" />;
    } else if (['xls', 'xlsx'].includes(extension)) {
      return <FileText className="h-8 w-8 text-green-600" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      'identity': { label: 'Identité', variant: 'default' },
      'property': { label: 'Propriété', variant: 'secondary' },
      'contracts': { label: 'Contrats', variant: 'outline' },
      'receipts': { label: 'Reçus', variant: 'default' },
      'photos': { label: 'Photos', variant: 'secondary' },
      'other': { label: 'Autre', variant: 'outline' }
    };

    const config = categoryConfig[category] || { label: category, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    return documents.filter(doc => {
      const matchesSearch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (doc.description || '')?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchTerm, selectedCategory]);

  if (documentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (documentsError) {
    return <div className="text-red-500 p-8">Erreur de chargement de vos documents.</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6 lg:p-8"
    >
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FolderOpen className="h-8 w-8" />
          Coffre-fort Numérique
        </h1>
        <p className="text-muted-foreground">
          Stockez et organisez vos documents importants en toute sécurité
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Ajouter des documents
          </CardTitle>
          <CardDescription>
            Téléchargez vos documents (PDF, images, Word, Excel) - Maximum 10MB par fichier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={uploadLoading}
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg ${uploadLoading ? 'cursor-not-allowed bg-muted/50' : 'cursor-pointer hover:border-primary hover:bg-primary/5'} transition-colors`}
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Cliquez pour sélectionner des fichiers ou glissez-les ici
                  </p>
                </div>
              </label>
            </div>
          </div>
          {uploadLoading && (
            <div className="mt-4 flex items-center gap-2">
              <LoadingSpinner size="small" />
              <span className="text-sm text-muted-foreground">Téléchargement en cours...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{documents?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Documents stockés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents by Category */}
      <Tabs defaultValue="all" onValueChange={setSelectedCategory} className="space-y-4">
{categories.map((category) => {
  const Icon = category.icon;
  const count = category.id === 'all' ? (documents?.length || 0) : (documents?.filter(d => d.category === category.id).length || 0);
  return (
    <TabsTrigger
      key={category.id}
      value={category.id}
      className="flex flex-col gap-1 py-2"
    >
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{category.label}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
            {filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun document</h3>
                  <p className="text-muted-foreground">
                    {documents?.length === 0 
                      ? "Vous n'avez pas encore téléchargé de documents. Commencez par ajouter vos premiers documents."
                      : "Aucun document ne correspond à vos critères de recherche."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((document) => (
                  <Card key={document.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getFileIcon(document.name)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{document.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(document.metadata?.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {getCategoryBadge(document.category)}
                        </div>
                      </div>
                      
                      {document.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {document.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <Calendar className="h-3 w-3" />
                        <span>Ajouté le {formatDate(document.created_at)}</span>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteDocument(document.id, document.name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default DigitalVaultPage;


