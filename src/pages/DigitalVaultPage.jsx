import React from 'react';
import { motion } from 'framer-motion';
import { Archive as Vault, FileText, Download, ShieldCheck, PlusCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';

const documents = [
  {
    id: "doc1",
    name: "Acte de Vente - Terrain Almadies.pdf",
    category: "Actes Notariés",
    date: "2025-07-10",
    size: "2.5 MB",
    verified: true
  },
  {
    id: "doc2",
    name: "Titre Foncier TF-12345-DG.pdf",
    category: "Titres de Propriété",
    date: "2025-07-25",
    size: "1.8 MB",
    verified: true
  },
  {
    id: "doc3",
    name: "Plan Cadastral - Lot A52.png",
    category: "Plans et Documents Techniques",
    date: "2025-06-05",
    size: "800 KB",
    verified: true
  },
  {
    id: "doc4",
    name: "Rapport de Diligence - Almadies.pdf",
    category: "Rapports & Vérifications",
    date: "2025-06-02",
    size: "1.2 MB",
    verified: true
  }
];

const DigitalVaultPage = () => {
  const { toast } = useToast();

  const handleDownload = (docName) => {
    toast({
      title: "Téléchargement (Simulation)",
      description: `Le téléchargement de "${docName}" a commencé.`,
    });
  };

  const handleUpload = () => {
    toast({
      title: "Téléversement (Simulation)",
      description: "L'interface de téléversement de document s'ouvrirait ici.",
    });
  };

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <Helmet>
        <title>Coffre-fort Numérique - Teranga Foncier</title>
        <meta name="description" content="Accédez à tous vos documents fonciers importants (actes de vente, titres de propriété, plans) dans un espace sécurisé et confidentiel." />
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
              Vos documents fonciers, sécurisés et accessibles à tout moment.
            </p>
          </div>
          <Button size="lg" onClick={handleUpload}>
            <PlusCircle className="mr-2 h-5 w-5" /> Téléverser un Document
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Mes Documents</CardTitle>
              <CardDescription>Retrouvez ici tous les documents liés à vos transactions.</CardDescription>
            </CardHeader>
            <CardContent>
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
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground md:hidden">{doc.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 hidden md:table-cell">{doc.category}</td>
                        <td className="p-3 hidden sm:table-cell">{doc.date}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleDownload(doc.name)}>
                              <Download className="h-4 w-4 mr-1" /> Télécharger
                            </Button>
                            {doc.verified && (
                              <ShieldCheck className="h-5 w-5 text-green-500" title="Document vérifié par Teranga Foncier" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default DigitalVaultPage;