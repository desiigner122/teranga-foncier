import React, { useState } from 'react';
import { User, Building, Landmark, Eye, Mail, Phone, AlertCircle, CheckCircle, RefreshCw, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Textarea } from '../../components/ui/textarea';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import SupabaseDataService from '../../services/SupabaseDataService';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";

// Utilitaires pour génération de mots de passe sécurisés
const generateSecurePassword = (length = 12) => {
  
  
  const [formData, setFormData] = useState({});
/* REMOVED DUPLICATE */ ({});
const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%&*+=?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';
  
  // Au moins un caractère de chaque type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Compléter avec des caractères aléatoires
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Mélanger le mot de passe
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

const validatePassword = (password) => {
  const minLength = 8;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  return {
    valid: password.length >= minLength && hasLowerCase && hasUpperCase && hasNumbers && hasSpecialChar,
    criteria: {
      length: password.length >= minLength,
      lowercase: hasLowerCase,
      uppercase: hasUpperCase,
      numbers: hasNumbers,
      special: hasSpecialChar
    }
  };
};

const CompleteInstitutionModal = ({ isOpen, onClose, onUserCreated }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    // Informations de base
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    type: '', // banque ou mairie
    role: 'institution',
    
    // Localisation géographique
    location: { region: '', department: '', commune: '' },
    
    // Métadonnées spécifiques
    metadata: {
      // Pour banques
      bank_name: '',
      branch_name: '',
      bank_code: '',
      manager_name: '',
      swift_code: '',
      services: [],
      
      // Pour mairies
      maire_name: '',
      deputy_name: '',
      commune_type: '', // urbaine, rurale
      population: '',
      services_offered: [],
      
      // Commun
      address: '',
      website: '',
      established_year: '',
      license_number: '',
      description: ''
    }
  });

  const institutionTypes = [
    { value: 'banque', label: 'Banque / Institution Financière', icon: Landmark },
    { value: 'mairie', label: 'Mairie / Collectivité Locale', icon: Building2 }
  ];

  const bankServices = [
    'Crédit immobilier',
    'Crédit foncier', 
    'Épargne logement',
    'Garanties hypothécaires',
    'Conseil financier',
    'Micro-crédit',
    'Financement PME',
    'Crédit automobile',
    'Assurance crédit'
  ];

  const mairieServices = [
    'État civil',
    'Certificats d\'urbanisme',
    'Permis de construire',
    'Attribution terrains communaux',
    'Viabilisation',
    'Cadastre',
    'Taxes locales',
    'Services sociaux',
    'Gestion déchets'
  ];

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      phone: '',
      type: '',
      role: 'institution',
      location: { region: '', department: '', commune: '' },
      metadata: {
        bank_name: '', branch_name: '', bank_code: '', manager_name: '', swift_code: '', services: [],
        maire_name: '', deputy_name: '', commune_type: '', population: '', services_offered: [],
        address: '', website: '', established_year: '', license_number: '', description: ''
      }
    });
    setStep(1);
    setPasswordCopied(false);
  };

  const generatePassword = () => {
    const newPassword = generateSecurePassword(12);
    setFormData(prev => ({
      ...prev,
      password: newPassword,
      confirmPassword: newPassword
    }));
    toast({
      title: "Mot de passe généré",
      description: "Un mot de passe sécurisé a été généré automatiquement",
      className: "bg-green-600 text-white"
    });
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.password);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
      toast({
        title: "Copié !",
        description: "Le mot de passe a été copié dans le presse-papiers",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de copier le mot de passe"
      });
    }
  };

  const validateStep = () => {
    if (step === 1) {
      return formData.email && formData.full_name && formData.phone && formData.type && 
             formData.password && formData.confirmPassword && 
             formData.password === formData.confirmPassword &&
             validatePassword(formData.password).valid;
    }
    
    if (step === 2) {
      return formData.location.region && formData.location.department && formData.location.commune;
    }
    
    if (step === 3) {
      if (formData.type === 'banque') {
        return formData.metadata.bank_name && formData.metadata.branch_name;
      } else if (formData.type === 'mairie') {
        return formData.metadata.maire_name && formData.metadata.commune_type;
      }
    }
    
    return true;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMetadataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  const handleLocationChange = (location) => {
    setFormData(prev => ({
      ...prev,
      location
    }));
  };

  const handleServiceToggle = (service) => {
    const serviceKey = formData.type === 'mairie' ? 'services_offered' : 'services';
    const currentServices = formData.metadata[serviceKey] || [];
    
    const updatedServices = currentServices.includes(service)
      ? currentServices.filter(s => s !== service)
      : [...currentServices, service];
    
    handleMetadataChange(serviceKey, updatedServices);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validation finale
      if (!validateStep()) {
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: "Veuillez remplir tous les champs obligatoires"
        });
        return;
      }

      // Préparer les données pour la création
      const userData = {
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        type: formData.type,
        role: 'institution',
        metadata: {
          ...formData.metadata,
          location: formData.location,
          creation_source: 'admin_complete',
          created_by: 'admin',
          institution_status: 'active'
        }
      };

      // Créer l'utilisateur via le service
      const newUser = await SupabaseDataService.createInstitutionUser(userData);

      toast({
        title: "Institution créée avec succès !",
        description: `${formData.full_name} (${formData.type}) a été créé avec succès. Mot de passe: ${formData.password}`,
        className: "bg-green-600 text-white"
      });

      onUserCreated?.(newUser);
      onClose();
      resetForm();

    } catch (error) {      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer l'institution"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Informations de base
        </h3>
        
        {/* Type d'institution */}
        <div className="mb-4">
          <Label>Type d'institution *</Label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le type d'institution" />
            </SelectTrigger>
            <SelectContent>
              {institutionTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nom de l'institution *
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder={formData.type === 'banque' ? "Ex: CBAO Agence Dakar" : "Ex: Mairie de Dakar"}
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email institutionnel *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={formData.type === 'banque' ? "contact@banque.sn" : "contact@mairie.sn"}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Téléphone *
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Ex: +221 33 123 45 67"
          />
        </div>
      </div>

      {/* Section mot de passe */}
      <div>
        <h4 className="text-md font-medium mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Authentification
        </h4>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={generatePassword}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Générer
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Mot de passe sécurisé"
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-6 w-6 p-0"
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
                {formData.password && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyPassword}
                    className="h-6 w-6 p-0"
                  >
                    {passwordCopied ? <CheckCheck className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Retapez le mot de passe"
            />
          </div>

          {/* Validation du mot de passe */}
          {formData.password && (
            <Card className="p-3">
              <div className="text-sm">
                <div className="font-medium mb-2">Critères de sécurité :</div>
                {Object.entries(validatePassword(formData.password).criteria).map(([key, valid]) => (
                  <div key={key} className={`flex items-center gap-2 ${valid ? 'text-green-600' : 'text-red-500'}`}>
                    {valid ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    <span className="text-xs">
                      {key === 'length' && '8 caractères minimum'}
                      {key === 'lowercase' && 'Minuscule'}
                      {key === 'uppercase' && 'Majuscule'}
                      {key === 'numbers' && 'Chiffre'}
                      {key === 'special' && 'Caractère spécial'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {formData.password !== formData.confirmPassword && formData.confirmPassword && (
            <div className="text-red-500 text-sm flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              Les mots de passe ne correspondent pas
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Localisation géographique
      </h3>
      <GeographicSelector
        value={formData.location}
        onChange={handleLocationChange}
        required={true}
      />
      <p className="text-sm text-muted-foreground">
        Sélectionnez la localisation précise de votre {formData.type === 'banque' ? 'agence' : 'mairie'}.
      </p>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Building className="h-5 w-5" />
        Informations spécifiques
      </h3>
      
      {formData.type === 'banque' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank_name">Nom de la banque *</Label>
              <Input
                id="bank_name"
                value={formData.metadata.bank_name || ''}
                onChange={(e) => handleMetadataChange('bank_name', e.target.value)}
                placeholder="Ex: CBAO, UBA, SGBS..."
              />
            </div>
            <div>
              <Label htmlFor="branch_name">Nom de l'agence *</Label>
              <Input
                id="branch_name"
                value={formData.metadata.branch_name || ''}
                onChange={(e) => handleMetadataChange('branch_name', e.target.value)}
                placeholder="Ex: Agence Dakar Plateau"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank_code">Code banque (BCEAO)</Label>
              <Input
                id="bank_code"
                value={formData.metadata.bank_code || ''}
                onChange={(e) => handleMetadataChange('bank_code', e.target.value)}
                placeholder="Ex: SN001"
              />
            </div>
            <div>
              <Label htmlFor="swift_code">Code SWIFT</Label>
              <Input
                id="swift_code"
                value={formData.metadata.swift_code || ''}
                onChange={(e) => handleMetadataChange('swift_code', e.target.value)}
                placeholder="Ex: CBAOSNDA"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="manager_name">Responsable d'agence</Label>
            <Input
              id="manager_name"
              value={formData.metadata.manager_name || ''}
              onChange={(e) => handleMetadataChange('manager_name', e.target.value)}
              placeholder="Nom du responsable"
            />
          </div>

          <div>
            <Label>Services bancaires proposés</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {bankServices.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={(formData.metadata.services || []).includes(service)}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <Label htmlFor={service} className="text-sm">{service}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {formData.type === 'mairie' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maire_name">Nom du Maire *</Label>
              <Input
                id="maire_name"
                value={formData.metadata.maire_name || ''}
                onChange={(e) => handleMetadataChange('maire_name', e.target.value)}
                placeholder="Prénom et nom du maire"
              />
            </div>
            <div>
              <Label htmlFor="deputy_name">Adjoint au maire</Label>
              <Input
                id="deputy_name"
                value={formData.metadata.deputy_name || ''}
                onChange={(e) => handleMetadataChange('deputy_name', e.target.value)}
                placeholder="Nom de l'adjoint"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="commune_type">Type de commune *</Label>
              <Select 
                value={formData.metadata.commune_type || ''} 
                onValueChange={(value) => handleMetadataChange('commune_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de commune" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urbaine">Commune urbaine</SelectItem>
                  <SelectItem value="rurale">Commune rurale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="population">Population (estimation)</Label>
              <Input
                id="population"
                type="number"
                value={formData.metadata.population || ''}
                onChange={(e) => handleMetadataChange('population', e.target.value)}
                placeholder="Nombre d'habitants"
              />
            </div>
          </div>

          <div>
            <Label>Services municipaux proposés</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {mairieServices.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={(formData.metadata.services_offered || []).includes(service)}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <Label htmlFor={service} className="text-sm">{service}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Informations communes */}
      <div className="space-y-4 border-t pt-4">
        <h4 className="font-medium">Informations complémentaires</h4>
        
        <div>
          <Label htmlFor="address">Adresse physique</Label>
          <Textarea
            id="address"
            value={formData.metadata.address || ''}
            onChange={(e) => handleMetadataChange('address', e.target.value)}
            placeholder="Adresse complète de l'institution"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              value={formData.metadata.website || ''}
              onChange={(e) => handleMetadataChange('website', e.target.value)}
              placeholder="https://www.exemple.sn"
            />
          </div>
          <div>
            <Label htmlFor="established_year">Année d'établissement</Label>
            <Input
              id="established_year"
              type="number"
              value={formData.metadata.established_year || ''}
              onChange={(e) => handleMetadataChange('established_year', e.target.value)}
              placeholder="Ex: 1995"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="license_number">Numéro de licence/agrément</Label>
          <Input
            id="license_number"
            value={formData.metadata.license_number || ''}
            onChange={(e) => handleMetadataChange('license_number', e.target.value)}
            placeholder="Numéro officiel d'agrément"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.metadata.description || ''}
            onChange={(e) => handleMetadataChange('description', e.target.value)}
            placeholder="Description de l'institution et de ses activités"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        Récapitulatif et confirmation
      </h3>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {formData.type === 'banque' ? <Landmark className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            {formData.full_name}
          </CardTitle>
          <CardDescription>{formData.type === 'banque' ? 'Institution Financière' : 'Collectivité Locale'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Email:</strong> {formData.email}
            </div>
            <div>
              <strong>Téléphone:</strong> {formData.phone}
            </div>
            <div>
              <strong>Localisation:</strong> {formData.location.region} → {formData.location.department} → {formData.location.commune}
            </div>
            <div>
              <strong>Mot de passe:</strong> 
              <span className="font-mono ml-2 bg-gray-100 px-2 py-1 rounded">
                {showPassword ? formData.password : '••••••••••••'}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 h-6 w-6 p-0"
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {formData.type === 'banque' && (
            <div className="border-t pt-4">
              <strong className="block mb-2">Informations bancaires:</strong>
              <div className="text-sm space-y-1">
                <div>Banque: {formData.metadata.bank_name}</div>
                <div>Agence: {formData.metadata.branch_name}</div>
                {formData.metadata.bank_code && <div>Code: {formData.metadata.bank_code}</div>}
                {formData.metadata.services && formData.metadata.services.length > 0 && (
                  <div>Services: {formData.metadata.services.join(', ')}</div>
                )}
              </div>
            </div>
          )}

          {formData.type === 'mairie' && (
            <div className="border-t pt-4">
              <strong className="block mb-2">Informations municipales:</strong>
              <div className="text-sm space-y-1">
                <div>Maire: {formData.metadata.maire_name}</div>
                <div>Type: {formData.metadata.commune_type}</div>
                {formData.metadata.population && <div>Population: {formData.metadata.population} habitants</div>}
                {formData.metadata.services_offered && formData.metadata.services_offered.length > 0 && (
                  <div>Services: {formData.metadata.services_offered.join(', ')}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="text-sm">
            <strong className="text-yellow-800">Important :</strong>
            <p className="text-yellow-700 mt-1">
              Notez bien le mot de passe généré car il ne pourra pas être récupéré plus tard. 
              L'institution devra utiliser ces identifiants pour se connecter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Créer une institution complète
          </DialogTitle>
          <DialogDescription>
            Créez un profil complet pour une banque ou une mairie avec tous les détails nécessaires
          </DialogDescription>
        </DialogHeader>

        {/* Indicateur de progression */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-8 h-0.5 ${
                  step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1 flex gap-2">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                disabled={loading}
              >
                Précédent
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            
            {step < 4 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={!validateStep() || loading}
              >
                Suivant
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={loading || !validateStep()}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Création...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Créer l'institution
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteInstitutionModal;
