import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, Camera, X } from 'lucide-react';

const IdentityVerificationPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [documents, setDocuments] = useState({
    recto: null,
    verso: null
  });
  
  const [previews, setPreviews] = useState({
    recto: null,
    verso: null
  });

  const rectoInputRef = useRef(null);
  const versoInputRef = useRef(null);

  // Fonction pour valider le fichier
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Type de fichier non autorisé. Utilisez JPG, PNG ou PDF.');
    }

    if (file.size > maxSize) {
      throw new Error('Fichier trop volumineux. Maximum 5MB.');
    }

    return true;
  };

  // Fonction pour gérer le changement de fichier
  const handleFileChange = (side, file) => {
    try {
      validateFile(file);
      
      setDocuments(prev => ({
        ...prev,
        [side]: file
      }));

      // Créer un aperçu pour les images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => ({
            ...prev,
            [side]: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setPreviews(prev => ({
          ...prev,
          [side]: null
        }));
      }

      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Fonction pour supprimer un fichier
  const removeFile = (side) => {
    setDocuments(prev => ({
      ...prev,
      [side]: null
    }));
    setPreviews(prev => ({
      ...prev,
      [side]: null
    }));
    
    if (side === 'recto' && rectoInputRef.current) {
      rectoInputRef.current.value = '';
    }
    if (side === 'verso' && versoInputRef.current) {
      versoInputRef.current.value = '';
    }
  };

  // Fonction pour uploader un fichier vers Supabase Storage
  const uploadFile = async (file, side) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${side}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('identity-documents')
      .upload(fileName, file);

    if (error) throw error;
    
    return data.path;
  };

  // Fonction pour soumettre les documents
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!documents.recto || !documents.verso) {
      setError('Veuillez télécharger les deux faces de votre carte d\'identité.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload des deux fichiers
      const rectoPath = await uploadFile(documents.recto, 'recto');
      const versoPath = await uploadFile(documents.verso, 'verso');

      // Mettre à jour le profil utilisateur
      const { error: updateError } = await supabase
        .from('users')
        .update({
          identity_verification_status: 'pending',
          identity_document_recto: rectoPath,
          identity_document_verso: versoPath,
          identity_verification_submitted_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Mettre à jour le contexte utilisateur
      await updateUser();

      setSuccess(true);
      
      // Rediriger vers le dashboard après 3 secondes
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError(err.message || 'Une erreur est survenue lors de la soumission.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour passer la vérification (pour les tests)
  const skipVerification = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir passer cette étape ? Vous devrez la compléter plus tard.')) {
      try {
        const { error } = await supabase
          .from('users')
          .update({
            identity_verification_status: 'skipped'
          })
          .eq('id', user.id);

        if (error) throw error;
        
        await updateUser();
        navigate('/dashboard');
      } catch (err) {
        setError('Erreur lors de la mise à jour du statut.');
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Documents soumis avec succès !
            </h2>
            <p className="text-gray-600 mb-4">
              Vos documents d'identité ont été soumis pour vérification. 
              Vous recevrez une notification une fois la vérification terminée.
            </p>
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              Vérification en cours
            </Badge>
            <p className="text-sm text-gray-500 mt-4">
              Redirection automatique dans quelques secondes...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Vérification d'identité
            </CardTitle>
            <p className="text-gray-600">
              Pour accéder à votre espace {user?.type?.toLowerCase()}, veuillez télécharger 
              les deux faces de votre carte d'identité.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Recto */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Face avant (recto) de votre carte d'identité *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                  {documents.recto ? (
                    <div className="space-y-3">
                      {previews.recto && (
                        <div className="relative">
                          <img 
                            src={previews.recto} 
                            alt="Aperçu recto" 
                            className="max-w-full h-32 object-contain mx-auto rounded"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 truncate">
                          {documents.recto.name}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile('recto')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => rectoInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choisir un fichier
                        </Button>
                        <p className="text-xs text-gray-500">
                          JPG, PNG ou PDF - Max 5MB
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={rectoInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) => e.target.files[0] && handleFileChange('recto', e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Verso */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Face arrière (verso) de votre carte d'identité *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                  {documents.verso ? (
                    <div className="space-y-3">
                      {previews.verso && (
                        <div className="relative">
                          <img 
                            src={previews.verso} 
                            alt="Aperçu verso" 
                            className="max-w-full h-32 object-contain mx-auto rounded"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 truncate">
                          {documents.verso.name}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile('verso')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => versoInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choisir un fichier
                        </Button>
                        <p className="text-xs text-gray-500">
                          JPG, PNG ou PDF - Max 5MB
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={versoInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) => e.target.files[0] && handleFileChange('verso', e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Informations importantes */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Informations importantes :</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Assurez-vous que les photos sont nettes et lisibles</li>
                    <li>Toutes les informations doivent être visibles</li>
                    <li>La vérification peut prendre 24-48h ouvrées</li>
                    <li>Vos documents sont sécurisés et cryptés</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={loading || !documents.recto || !documents.verso}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Soumission en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Soumettre pour vérification
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={skipVerification}
                  disabled={loading}
                >
                  Passer cette étape
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IdentityVerificationPage;
