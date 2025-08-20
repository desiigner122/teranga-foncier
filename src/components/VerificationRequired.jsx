import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Shield, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const VerificationRequired = () => {
  const { profile, needsVerification, isPendingVerification } = useAuth();
  const navigate = useNavigate();

  // Vérifier si l'utilisateur a déjà soumis ses documents et est en attente
  const [seconds, setSeconds] = useState(60);
  useEffect(()=>{
    if(!isPendingVerification) return;
    const id = setInterval(()=> setSeconds(s=> s>0 ? s-1 : 0),1000);
    return ()=> clearInterval(id);
  },[isPendingVerification]);

  const handleManualRefresh = async () => {
    try {
      await (window?.appAuthRefresh?.() || Promise.resolve());
      window.location.reload();
    } catch(e) { /* silent */ }
  };

  if (isPendingVerification) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Clock className="h-6 w-6 text-yellow-500" />
              Vérification en Cours
            </CardTitle>
            <CardDescription>
              Votre compte est en cours de vérification par notre équipe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-semibold text-yellow-800 mb-2">Documents Soumis</h3>
              <p className="text-sm text-yellow-700">
                Vos documents d'identité ont été reçus et sont en cours d'examen. 
                Notre équipe vous contactera sous 24-48h.
              </p>
              {profile?.verification_submitted_at && (
                <p className="text-xs text-yellow-600 mt-2">
                  Soumis le {new Date(profile.verification_submitted_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Statut actuel:</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  En attente de vérification
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <h4 className="font-medium">Prochaines étapes:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Examen de vos documents par notre équipe</li>
                  <li>Vérification de l'authenticité</li>
                  <li>Activation complète de votre compte</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-center text-xs text-gray-500">Prochaine actualisation automatique possible dans {seconds}s</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>Tableau de bord</Button>
                <Button onClick={handleManualRefresh} disabled={seconds>0} className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50">Rafraîchir statut</Button>
              </div>
              <p className="text-center text-[11px] text-gray-400">Vous recevrez un email dès que la vérification sera terminée.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Si l'utilisateur doit soumettre ses documents
  if (needsVerification) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Vérification Requise
            </CardTitle>
            <CardDescription>
              Votre compte nécessite une vérification d'identité pour accéder aux fonctionnalités
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
              <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold text-red-800 mb-2">Action Requise</h3>
              <p className="text-sm text-red-700">
                Pour des raisons de sécurité et de conformité, vous devez vérifier votre identité 
                en soumettant une photo recto-verso de votre carte d'identité.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Statut actuel:</span>
                <Badge variant="destructive">
                  Non vérifié
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <h4 className="font-medium">Documents requis:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Photo du recto de votre carte d'identité</li>
                  <li>Photo du verso de votre carte d'identité</li>
                  <li>Images claires et lisibles (max 5MB chacune)</li>
                </ul>
              </div>

              <div className="text-sm text-gray-600">
                <h4 className="font-medium">Accès limité:</h4>
                <p className="text-xs text-gray-500">
                  En attendant la vérification, l'accès à certaines fonctionnalités est restreint.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/verification')} 
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                <Upload className="mr-2 h-4 w-4" />
                Commencer la Vérification
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')} 
                className="w-full"
              >
                Accès Limité au Tableau de Bord
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Ce processus est conforme aux réglementations de sécurité et prend généralement 24-48 heures.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return null;
};

export default VerificationRequired;

