// src/pages/VerificationPage.jsx
import React, { useState, useRef } from 'react';
const VerificationPage = () => {
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const { user, profile, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  // Fonction de défilement vers le bas
  const scrollToBottom = () => {
    if (frontInputRef.current) {
      frontInputRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Fichier trop volumineux",
        description: "Veuillez choisir un fichier de moins de 5 MB."
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Type de fichier invalide",
        description: "Veuillez choisir une image (JPG, PNG, WebP)."
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'front') {
        setFrontFile(file);
        setFrontPreview(e.target.result);
      } else {
        setBackFile(file);
        setBackPreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (type) => {
    if (type === 'front') {
      setFrontFile(null);
      setFrontPreview(null);
      if (frontInputRef.current) frontInputRef.current.value = '';
    } else {
      setBackFile(null);
      setBackPreview(null);
      if (backInputRef.current) backInputRef.current.value = '';
    }
  };

  // Helper upload avec gestion explicite des erreurs bucket
  const uploadIdentityFile = async (file, type) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;
    const bucket = 'identity-documents';
    const { data: existing, error: listError } = await supabase.storage.from(bucket).list(user.id, { limit: 1 });
    if (listError && listError.message?.toLowerCase().includes('not found')) {
      throw new Error("Le bucket 'identity-documents' n'existe pas dans Supabase. Créez-le dans Storage (public ou privé) puis réessayez.");
    }
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: false });
    if (uploadError) {
      if (uploadError.message?.toLowerCase().includes('bucket')) {
        throw new Error("Erreur bucket: vérifiez le nom 'identity-documents' et les policies (INSERT pour authenticated).");
      }
      throw uploadError;
    }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!frontFile || !backFile) {
        throw new Error("Veuillez fournir les deux cétés de votre carte d'identité.");
      }

      setStep(2); // Moving to upload step

  const frontPublicUrl = await uploadIdentityFile(frontFile, 'front');
  const backPublicUrl = await uploadIdentityFile(backFile, 'back');

      const { error: updateError } = await supabase
        .from('users')
        .update({
          id_card_front_url: frontPublicUrl,
          id_card_back_url: backPublicUrl,
          verification_status: 'pending',
          verification_submitted_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshUser();
      setStep(3); // Success step
      
      toast({ 
        title: "Documents envoyés !", 
        description: "Votre demande est en attente de vérification." 
      });

      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'envoi des documents.");
      toast({ variant: "destructive", title: "Erreur", description: err.message });
      setStep(1); // Back to form
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (profile?.verification_status === 'verified') {
    return (
      <>
        <Helmet>
          <title>Vérification Compléte - Teranga Foncier</title>
        </Helmet>
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex items-center justify-center min-h-screen px-4"
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Vérification Compléte
              </CardTitle>
              <CardDescription>Votre compte est déjé vérifié et opérationnel.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4"/>
                <p className="text-green-700 font-medium">Statut: Vérifié</p>
                <p className="text-sm text-green-600 mt-2">
                  Vous avez accés é toutes les fonctionnalités de la plateforme.
                </p>
              </div>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Aller au tableau de bord
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Vérification d'Identité - Teranga Foncier</title>
      </Helmet>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-green-50 to-emerald-50"
      >
        <div className="w-full max-w-2xl space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Documents</span>
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Envoi</span>
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Confirmation</span>
            </div>
          </div>

          {step === 1 && (
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Shield className="h-6 w-6" />
                  Vérification d'Identité
                </CardTitle>
                <CardDescription>
                  Pour sécuriser votre compte et accéder é toutes les fonctionnalités, 
                  veuillez soumettre une photo recto-verso de votre carte d'identité.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Instructions */}
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Instructions importantes :</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                        <li>Utilisez un éclairage optimal et évitez les reflets</li>
                        <li>Assurez-vous que tous les textes sont lisibles</li>
                        <li>Formats acceptés : JPG, PNG, WebP (max 5 MB)</li>
                        <li>Les informations doivent correspondre é votre profil</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  {/* Front Card Upload */}
                  <div className="space-y-3">
                    <Label htmlFor="front" className="text-base font-medium">
                      Recto de la carte d'identité *
                    </Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      {frontPreview ? (
                        <div className="space-y-4">
                          <img 
                            src={frontPreview} 
                            alt="Aperéu recto" 
                            className="max-w-full h-48 object-contain mx-auto rounded-lg border"
                          />
                          <div className="flex gap-2 justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => frontInputRef.current?.click()}
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Changer
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile('front')}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                          <div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => frontInputRef.current?.click()}
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Choisir une photo
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Photographiez le recto de votre carte d'identité
                          </p>
                        </div>
                      )}
                      <Input
                        ref={frontInputRef}
                        id="front"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'front')}
                        disabled={loading}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Back Card Upload */}
                  <div className="space-y-3">
                    <Label htmlFor="back" className="text-base font-medium">
                      Verso de la carte d'identité *
                    </Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      {backPreview ? (
                        <div className="space-y-4">
                          <img 
                            src={backPreview} 
                            alt="Aperéu verso" 
                            className="max-w-full h-48 object-contain mx-auto rounded-lg border"
                          />
                          <div className="flex gap-2 justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => backInputRef.current?.click()}
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Changer
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile('back')}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                          <div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => backInputRef.current?.click()}
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Choisir une photo
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Photographiez le verso de votre carte d'identité
                          </p>
                        </div>
                      )}
                      <Input
                        ref={backInputRef}
                        id="back"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'back')}
                        disabled={loading}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-700">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || !frontFile || !backFile}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Envoyer les documents
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="shadow-xl">
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold mb-2">Envoi en cours...</h3>
                <p className="text-muted-foreground">
                  Vos documents sont en cours d'envoi sécurisé. Veuillez patienter.
                </p>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="shadow-xl">
              <CardContent className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-2">Documents envoyés avec succés !</h3>
                <p className="text-muted-foreground mb-6">
                  Votre demande de vérification a été soumise. Notre équipe examinera vos documents 
                  dans les plus brefs délais.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-yellow-700">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">En attente de vérification</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-2">
                    Délai habituel : 24-48 heures ouvrées
                  </p>
                </div>
                <Button onClick={() => navigate('/dashboard')} className="w-full">
                  Accéder au tableau de bord
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current Status Display */}
          {profile?.verification_status && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Statut actuel :</span>
                  <Badge variant={
                    profile.verification_status === 'verified' ? 'default' :
                    profile.verification_status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {profile.verification_status === 'verified' && 'Vérifié'}
                    {profile.verification_status === 'pending' && 'En attente'}
                    {profile.verification_status === 'rejected' && 'Rejeté'}
                    {!['verified', 'pending', 'rejected'].includes(profile.verification_status) && 'Non vérifié'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default VerificationPage;
