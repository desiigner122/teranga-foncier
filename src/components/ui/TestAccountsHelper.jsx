// src/components/ui/TestAccountsHelper.jsx - Aide pour les comptes de test
import React, { useState } from 'react';
const TestAccountsHelper = ({ onAccountSelect }) => {
  // In production we hide the helper entirely to avoid exposing test account hints
  if (import.meta.env.PROD) {
    return null; // Silent noop in production builds
  }
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const getAccountIcon = (type) => {
    switch (type) {
      case 'Particulier': return User;
      case 'Vendeur': return Building;
      case 'Investisseur': return TrendingUp;
      case 'Promoteur': return Hammer;
      case 'Agriculteur': return Sprout;
      case 'Banque': return CreditCard;
      case 'Notaire': return FileText;
      case 'Mairie': return Building;
      case 'Administrateur': return Shield;
      case 'Agent': return Settings;
      default: return User;
    }
  };

  const getAccountColor = (type) => {
    switch (type) {
      case 'Particulier': return 'bg-blue-100 text-blue-800';
      case 'Vendeur': return 'bg-green-100 text-green-800';
      case 'Investisseur': return 'bg-purple-100 text-purple-800';
      case 'Promoteur': return 'bg-orange-100 text-orange-800';
      case 'Agriculteur': return 'bg-green-100 text-green-800';
      case 'Banque': return 'bg-indigo-100 text-indigo-800';
      case 'Notaire': return 'bg-gray-100 text-gray-800';
      case 'Mairie': return 'bg-blue-100 text-blue-800';
      case 'Administrateur': return 'bg-red-100 text-red-800';
      case 'Agent': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copié !",
        description: `${label} copié dans le presse-papiers`,
        duration: 2000,
      });
    });
  };

  const handleQuickLogin = (account) => {
    if (onAccountSelect) {
      onAccountSelect(account.email, account.password);
      toast({
        title: "Connexion rapide",
        description: `Connexion avec le compte ${account.type}`,
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Comptes de Test</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>
          Comptes de démonstration pour tous les types d'utilisateurs
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Info générale */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Plateforme de démonstration</p>
              <p className="text-blue-700">
                Utilisez ces comptes pour tester les différents rôles et fonctionnalités. 
                Tous les mots de passe sont "Test123!"
              </p>
            </div>
          </div>

          {/* Contrôles d'affichage */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Comptes disponibles</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-2"
            >
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPasswords ? 'Masquer' : 'Afficher'} mots de passe
            </Button>
          </div>

          {/* Grille des comptes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(testAccounts).map(([key, account]) => {
              const AccountIcon = getAccountIcon(account.type);
              const colorClass = getAccountColor(account.type);
              
              return (
                <Card key={key} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <AccountIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">{account.full_name}</h5>
                          <Badge variant="secondary" className="text-xs">
                            {account.type}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">Email:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account.email, 'Email')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="bg-gray-50 rounded px-2 py-1 text-xs font-mono">
                        {account.email}
                      </div>
                    </div>

                    {/* Mot de passe */}
                    {showPasswords && (
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">Mot de passe:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(account.password, 'Mot de passe')}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="bg-gray-50 rounded px-2 py-1 text-xs font-mono">
                          {account.password}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-xs text-gray-600 mb-3">
                      {account.description}
                    </p>

                    {/* Bouton de connexion rapide */}
                    <Button
                      onClick={() => handleQuickLogin(account)}
                      className="w-full text-xs h-8"
                      variant="outline"
                    >
                      Connexion rapide
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Instructions Supabase */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-900 mb-2">Configuration Supabase requise</p>
                <p className="text-yellow-800 mb-2">
                  Pour utiliser ces comptes, vous devez d'abord :
                </p>
                <ol className="list-decimal list-inside text-yellow-800 space-y-1 text-xs">
                  <li>Créer les utilisateurs dans Supabase Auth (Authentication {'>'}  Users)</li>
                  <li>Exécuter le script SQL fourni dans le SQL Editor</li>
                  <li>Ou utiliser vos propres identifiants Supabase</li>
                </ol>
                <p className="text-yellow-700 text-xs mt-2 font-medium">
                  💡 Conseil : Contactez l'administrateur pour obtenir les identifiants de production
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default TestAccountsHelper;
