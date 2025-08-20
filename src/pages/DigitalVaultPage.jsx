import React, { useState, useEffect } from 'react';
import { useRealtimeTable } from '@/hooks/useRealtimeTable';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Vault, FileText, Download, PlusCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SupabaseDataService } from '@/services/supabaseDataService';
const DigitalVaultPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (documents) {
      setFilteredData(documents);
    }
  }, [documents]);
  
  useEffect(() => {
    if (user) {
      loadUserDocuments();
    }
  }, [user]);

  const loadUserDocuments = async () => {
    try {
      setLoading(true);
      
      // Récupérer les documents de l'utilisateur depuis Supabase
      const userDocs = await SupabaseDataService.getUserDocuments(user.id);
      setDocuments(userDocs || []);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos documents"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId, docName) => {
    try {
      // Obtenir l'URL de téléchargement sécurisée
      const downloadUrl = await SupabaseDataService.getDocumentDownloadUrl(documentId);
      
      if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = docName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Téléchargement en cours",
          description: `Le document ${docName} est en cours de téléchargement.`
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger le document"
      });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Validation de la taille du fichier
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('Le fichier est trop volumineux (max 10MB)');
      }
      
      // Upload du document via Supabase
      const uploadResult = await SupabaseDataService.uploadDocument(user.id, file);
      
      if (uploadResult) {
        toast({
          title: "Document téléversé",
          description: `${file.name} a été ajouté é votre coffre-fort.`
        });
        
        // Recharger la liste des documents
        await loadUserDocuments();
      }
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'upload",
        description: error.message || "Impossible de téléverser le document"
      });
    } finally {
      setUploading(false);
      // Reset l'input file
      event.target.value = '';
    }
  };

  const triggerFileUpload = () => {
    document.getElementById('file-upload').click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Coffre-fort Numérique - Teranga Foncier</title>
        <meta name="description" content="Accédez é tous vos documents fonciers importants (actes de vente, titres de propriété, plans) dans un espace sécurisé et confidentiel." />
      </Helmet>
      
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto py-12 px-4"
      >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4 flex items-center">
              <Vault className="h-10 w-10 mr-3" /> Coffre-fort Numérique
            </h1>
            <p className="text-lg text-muted-foreground">
              Vos documents fonciers, sécurisés et accessibles é tout moment.
            </p>
          </div>
          <div>
            <Button size="lg" onClick={triggerFileUpload} disabled={uploading}>
              <PlusCircle className="mr-2 h-5 w-5" /> 
              {uploading ? 'Téléversement...' : 'Téléverser un Document'}
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Mes Documents</CardTitle>
              <CardDescription>
                Retrouvez ici tous les documents liés é vos transactions fonciéres.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Aucun document</h3>
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore de documents dans votre coffre-fort.
                  </p>
                  <Button onClick={triggerFileUpload}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter votre premier document
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Nom du Document</th>
                        <th className="text-left p-3 font-semibold hidden md:table-cell">Catégorie</th>
                        <th className="text-left p-3 font-semibold hidden sm:table-cell">Date</th>
                        <th className="text-left p-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                              <div>
                                <p className="font-medium">{doc.name || doc.filename}</p>
                                <p className="text-xs text-muted-foreground md:hidden">
                                  {doc.category || doc.document_type}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 hidden md:table-cell">
                            {doc.category || doc.document_type || 'Document'}
                          </td>
                          <td className="p-3 hidden sm:table-cell">
                            {new Date(doc.created_at || doc.uploaded_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDownload(doc.id, doc.name || doc.filename)}
                              >
                                <Download className="h-4 w-4 mr-1" /> Télécharger
                              </Button>
                              {doc.verified && (
                                <ShieldCheck 
                                  className="h-5 w-5 text-green-500" 
                                  title="Document vérifié par Teranga Foncier" 
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DigitalVaultPage;
