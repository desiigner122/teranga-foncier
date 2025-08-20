// src/components/admin/TypeSpecificUserCreation.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Landmark, 
  UserCog, 
  Users, 
  TreePine, 
  TrendingUp,
  FileText,
  UserCheck,
  Plus
} from 'lucide-react';
import CompleteInstitutionModal from './CompleteInstitutionModal';
import CreateUserModal from './CreateUserModal';

/**
 * Système de Création d'Utilisateurs par Type Spécifique
 * Chaque type a son propre bouton et processus de création
 */
const TypeSpecificUserCreation = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  // Configuration des types avec leurs spécificités
  const userTypes = [
    {
      id: 'banque',
      title: 'Banques',
      description: 'Créer un compte pour une institution bancaire',
      icon: Landmark,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      isInstitution: true,
      fields: ['bank_name', 'branch_name', 'bank_code', 'services', 'geographic_location']
    },
    {
      id: 'mairie',
      title: 'Mairies',
      description: 'Créer un compte pour une mairie/commune',
      icon: Building2,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      isInstitution: true,
      fields: ['maire_name', 'commune_type', 'services_offered', 'geographic_location']
    },
    {
      id: 'notaire',
      title: 'Notaires',
      description: 'Créer un compte pour un office notarial',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      isInstitution: true,
      fields: ['office_name', 'notaire_name', 'license_number', 'specializations']
    },
    {
      id: 'promoteur',
      title: 'Promoteurs',
      description: 'Créer un compte pour un promoteur immobilier',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      isInstitution: false,
      fields: ['company_name', 'license_number', 'projects_count', 'specializations']
    },
    {
      id: 'agriculteur',
      title: 'Agriculteurs',
      description: 'Créer un compte pour un agriculteur',
      icon: TreePine,
      color: 'from-green-600 to-green-700',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      isInstitution: false,
      fields: ['farm_name', 'land_size', 'crop_types', 'farming_method']
    },
    {
      id: 'investisseur',
      title: 'Investisseurs',
      description: 'Créer un compte pour un investisseur immobilier',
      icon: TrendingUp,
      color: 'from-indigo-500 to-indigo-600',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      isInstitution: false,
      fields: ['investment_capacity', 'preferred_sectors', 'risk_profile']
    },
    {
      id: 'agent',
      title: 'Agents',
      description: 'Créer un compte pour un agent immobilier',
      icon: UserCog,
      color: 'from-teal-500 to-teal-600',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      isInstitution: false,
      fields: ['agency_name', 'license_number', 'specialization_areas']
    },
    {
      id: 'particulier',
      title: 'Particuliers',
      description: 'Créer un compte pour un particulier',
      icon: Users,
      color: 'from-gray-500 to-gray-600',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      isInstitution: false,
      fields: ['occupation', 'civil_status', 'address']
    }
  ];

  const handleCreateType = (type) => {
    console.log('Création type:', type.id); // Debug
    setSelectedType(type);
    if (type.isInstitution) {
      setActiveModal('institution');
    } else {
      setActiveModal('user');
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedType(null);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Création d'Utilisateurs par Type
        </h2>
        <p className="text-gray-600">
          Sélectionnez le type de compte à créer. Chaque type a son propre processus optimisé.
        </p>
      </div>

      {/* Grille des Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {userTypes.map((type) => {
          const IconComponent = type.icon;
          
          return (
            <motion.div
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${type.borderColor} ${type.bgColor}`}
                onClick={() => handleCreateType(type)}
              >
                <CardHeader className="text-center pb-2">
                  <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center mb-2`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className={`text-lg ${type.textColor}`}>
                    {type.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-sm text-gray-600 mb-3">
                    {type.description}
                  </p>
                  <Button 
                    size="sm"
                    className={`w-full bg-gradient-to-r ${type.color} hover:opacity-90 text-white`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Statistiques Rapides */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Statistiques de Création
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-gray-600">Banques</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">45</div>
            <div className="text-sm text-gray-600">Mairies</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">8</div>
            <div className="text-sm text-gray-600">Notaires</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">1,234</div>
            <div className="text-sm text-gray-600">Particuliers</div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {activeModal === 'institution' && selectedType?.isInstitution && (
        <CompleteInstitutionModal
          isOpen={true}
          onClose={closeModal}
          institutionType={selectedType.id}
          onSuccess={() => {
            closeModal();
            // Rafraîchir la liste si nécessaire
          }}
        />
      )}

      {activeModal === 'user' && !selectedType?.isInstitution && (
        <CreateUserModal
          isOpen={true}
          onClose={closeModal}
          userType={selectedType.id}
          onSuccess={() => {
            closeModal();
            // Rafraîchir la liste si nécessaire
          }}
        />
      )}
    </div>
  );
};

export default TypeSpecificUserCreation;