import React, { useState } from 'react';
import { Eye, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";

const DocumentManagementPage = () => {
  const { toast } = useToast();
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [signature, setSignature] = useState('');

  const documents = [
    {
      id: 'DOC-001',
      name: 'Contrat de Vente - dk-alm-002',
      type: 'Contrat',
      status: 'En attente signature',
      size: '2.4 MB',
      lastModified: '2025-01-15',
      signatories: [
        { name: 'Amadou Diallo', role: 'Acheteur', signed: true, date: '2025-01-15' },
        { name: 'Fatou Ba', role: 'Vendeur', signed: false, date: null },
        { name: 'Me. Sow', role: 'Notaire', signed: false, date: null }
      ],
      version: 3,
      securityLevel: 'Haute'
    },
    {
      id: 'DOC-002',
      name: 'Titre de Propriété - sly-ngp-010',
      type: 'Titre',
      status: 'Signé',
      size: '1.8 MB',
      lastModified: '2025-01-08',
      signatories: [
        { name: 'Moussa Sow', role: 'Propriétaire', signed: true, date: '2025-01-08' },
        { name: 'Me. Diop', role: 'Notaire', signed: true, date: '2025-01-08' }
      ],
      version: 1,
      securityLevel: 'Maximale'
    },
    {
      id: 'DOC-003',
      name: 'Certificat Conformité - dmn-cit-005',
      type: 'Certificat',
      status: 'Brouillon',
      size: '950 KB',
      lastModified: '2025-01-12',
      signatories: [
        { name: 'Me. Ba', role: 'Notaire', signed: false, date: null }
      ],
      version: 1,
      securityLevel: 'Standard'
    }
  ];

  const templates = [
    { name: 'Contrat de Vente Standard', description: 'Modèle standard pour les ventes immobilières' },
    { name: 'Acte de Donation', description: 'Transmission gratuite de propriété' },
    { name: 'Promesse de Vente', description: 'Engagement préalable à la vente' },
    { name: 'Bail Emphytéotique', description: 'Contrat de bail de longue durée' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Signé': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'En attente signature': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Brouillon': { color: 'bg-gray-100 text-gray-800', icon: FileText },
      'Expiré': { color: 'bg-red-100 text-red-800', icon: Clock },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: FileText };
    
    return (
      <Badge className={config.color}>
        <config.icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getSecurityBadge = (level) => {
    const securityConfig = {
      'Maximale': { color: 'bg-red-100 text-red-800' },
      'Haute': { color: 'bg-orange-100 text-orange-800' },
      'Standard': { color: 'bg-blue-100 text-blue-800' },
    };

    const config = securityConfig[level] || { color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant="outline" className={config.color}>
        <Shield className="h-3 w-3 mr-1" />
        {level}
      </Badge>
    );
  };

  const handleSign = () => {
    if (!signature.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez saisir votre signature.",
      });
      return;
    }

    toast({
      title: "Document signé",
      description: `Le document ${selectedDocument?.name} a été signé avec succès.`,
    });
    setIsSigningOpen(false);
    setSignature('');
  };

  const handleShare = (docId) => {
    toast({
      title: "Lien de partage généré",
      description: "Le lien sécurisé a été copié dans le presse-papiers.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Documents</h1>
          <p className="text-muted-foreground">Signatures électroniques et gestion documentaire sécurisée</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Nouveau Document
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documents Actifs</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente signature</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {documents.filter(d => d.status === 'En attente signature').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Signés ce mois</p>
                <p className="text-2xl font-bold text-green-600">
                  {documents.filter(d => d.status === 'Signé').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sécurité Moyenne</p>
                <p className="text-2xl font-bold">Haute</p>
              </div>
              <Shield className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents Récents</CardTitle>
          <CardDescription>Tous vos documents avec statut de signature</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{doc.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {doc.type} • {doc.size} • Version {doc.version}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(doc.status)}
                    {getSecurityBadge(doc.securityLevel)}
                  </div>
                </div>

                {/* Signataires */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Signataires:</p>
                  <div className="flex flex-wrap gap-2">
                    {doc.signatories.map((signatory, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs bg-gray-50 px-2 py-1 rounded">
                        <div className={`h-2 w-2 rounded-full ${signatory.signed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span>{signatory.name} ({signatory.role})</span>
                        {signatory.signed && signatory.date && (
                          <span className="text-muted-foreground">
                            - {new Date(signatory.date).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                  {doc.status === 'En attente signature' && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedDocument(doc);
                        setIsSigningOpen(true);
                      }}
                    >
                      <PenTool className="h-4 w-4 mr-1" />
                      Signer
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShare(doc.id)}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Partager
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modèles de documents */}
      <Card>
        <CardHeader>
          <CardTitle>Modèles de Documents</CardTitle>
          <CardDescription>Créez rapidement des documents à partir de modèles pré-définis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold mb-2">{template.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                <Button size="sm" variant="outline">
                  Utiliser ce modèle
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de signature */}
      <Dialog open={isSigningOpen} onOpenChange={setIsSigningOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Signature Électronique</DialogTitle>
            <DialogDescription>
              Signez le document: {selectedDocument?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Votre signature</label>
              <Input
                placeholder="Tapez votre nom complet"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <Shield className="h-4 w-4 inline mr-1" />
                Cette signature sera cryptée et horodatée de manière sécurisée.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSigningOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSign}>
              <PenTool className="h-4 w-4 mr-2" />
              Signer le document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentManagementPage;
