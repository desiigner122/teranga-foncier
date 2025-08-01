import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Landmark, FileSignature, LandPlot, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { sampleParcels, sampleRequests, sampleUsers } from '@/data';
import LoadingSpinner from '@/components/ui/spinner';
import { OverviewTab, RequestsTab, LandManagementTab } from './MairiesDashboardTabs';
import { InstructionModal, AttributionModal, GenericActionModal } from './MairiesDashboardModals';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const kpiData = [
  { title: "Permis de Construire (Mois)", value: "28", icon: FileSignature, trend: "+5", trendColor: "text-green-500", unit: "demandes" },
  { title: "Demandes de Terrain", value: "4", icon: LandPlot, trend: "+1", trendColor: "text-green-500", unit: "nouvelles" },
  { title: "Litiges Fonciers Signalés", value: "3", icon: AlertTriangle, trendColor: "text-yellow-500", trend: "Stable", unit: "cas" },
  { title: "Terrains Communaux", value: "2", icon: Landmark, trendColor: "text-blue-500", trend: "disponibles", unit: "parcelles" },
];

const MairiesDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ type: null, title: '', description: '', data: null });
  const [municipalParcels, setMunicipalParcels] = useState([]);
  const [requestsForTable, setRequestsForTable] = useState([]);
  const [attributionParcel, setAttributionParcel] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const openModal = (type, title, description, data = null) => {
    setModalContent({ type, title, description, data });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent({ type: null, title: '', description: '', data: null });
  }
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const mairieName = "Mairie de Saly";
      const mairieParcels = sampleParcels.filter(p => p.ownerType === 'Mairie' && p.zone === 'Saly');
      const requestsForMairie = sampleRequests.map(r => ({...r, history: r.history || []}))
                                              .filter(r => r.recipient === mairieName || sampleParcels.find(p => p.id === r.parcel_id)?.zone === 'Saly');
      
      setMunicipalParcels(mairieParcels);
      setRequestsForTable(requestsForMairie);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  const handleOpenInstructionModal = (request) => {
    const user = sampleUsers.find(u => u.id === request.user_id);
    const modalType = request.request_type === 'acquisition' ? 'attribution' : 'permit';

    const modalProps = {
        title: modalType === 'attribution' ? `Attribuer un Terrain : Dossier ${request.id}` : `Instruction du Dossier: ${request.id}`,
        description: modalType === 'attribution' ? `Demande de ${user?.name} pour un terrain communal.` : `Vérifiez les pièces et rendez votre décision.`,
        data: { request, user, modalType }
    };
    openModal(modalType, modalProps.title, modalProps.description, modalProps.data);
  };
  
  const handleContactApplicant = (applicantId, dossierId) => {
    closeModal();
    navigate('/messaging', { state: { recipientId: applicantId, context: `Dossier ${dossierId}` }});
  };

  const handleDecision = (request, decision, updateNote) => {
    const newHistoryEntry = {
        status: decision,
        date: new Date().toISOString(),
        updated_by: "Agent Mairie (simulé)",
        note: updateNote || `Le statut a été mis à jour à "${decision}".`
    };

    setRequestsForTable(prev => prev.map(req => 
        req.id === request.id 
        ? {...req, status: decision, history: [...(req.history || []), newHistoryEntry] } 
        : req
    ));

    closeModal();
    toast({
        title: "Décision Enregistrée",
        description: `La décision '${decision}' a été enregistrée pour le dossier ${request.id}. L'acheteur a été notifié.`,
    });
  }

  const handleAttribution = (request) => {
    if (!attributionParcel) {
        toast({ title: "Erreur", description: "Veuillez sélectionner une parcelle à attribuer.", variant: "destructive" });
        return;
    }
    const decision = 'Approuvée';
    const newHistoryEntry = {
        status: decision,
        date: new Date().toISOString(),
        updated_by: "Agent Mairie (simulé)",
        note: `La parcelle ${attributionParcel} a été attribuée au demandeur.`
    };
    
    setRequestsForTable(prev => prev.map(req => req.id === request.id ? {...req, status: decision, history: [...(req.history || []), newHistoryEntry]} : req));
    closeModal();
    toast({
        title: "Parcelle Attribuée",
        description: `La parcelle ${attributionParcel} a été attribuée au demandeur pour le dossier ${request.id}.`,
    });
    setAttributionParcel('');
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab kpiData={kpiData} onAction={(msg) => openModal('generic', "Action Simulée", msg)} />;
      case 'requests':
        return <RequestsTab requests={requestsForTable} users={sampleUsers} onOpenInstructionModal={handleOpenInstructionModal} />;
      case 'land-management':
        return <LandManagementTab parcels={municipalParcels} />;
      default:
        return null;
    }
  };

  const renderModalContent = () => {
    if (!isModalOpen || !modalContent?.data?.request) return null;
    
    const { type, ...content } = modalContent;
    const request = content.data.request;

    switch (type) {
      case 'permit':
        return <InstructionModal 
                 content={content} 
                 onDecision={(decision, note) => handleDecision(request, decision, note)}
                 onContact={() => handleContactApplicant(request.user_id, request.id)}
                 onAction={(title, desc) => toast({ title, description: desc, variant: 'destructive'})}
                 onClose={closeModal} 
               />;
      case 'attribution':
         return <AttributionModal
                 content={content} 
                 municipalParcels={municipalParcels}
                 attributionParcel={attributionParcel}
                 setAttributionParcel={setAttributionParcel}
                 onAttribution={() => handleAttribution(request)}
                 onDecision={(decision) => handleDecision(request, decision, "La demande d'attribution a été rejetée.")}
                 onContact={() => handleContactApplicant(request.user_id, request.id)}
                 onClose={closeModal} 
               />;
      case 'generic':
      default:
        return <GenericActionModal content={content} onClose={closeModal} />;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 p-4 md:p-6 lg:p-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center">
              <Landmark className="h-8 w-8 mr-3 text-blue-600"/>
              Tableau de Bord Mairie (Saly)
            </h1>
            <p className="text-muted-foreground">Outils pour la gestion du foncier et des demandes administratives de votre commune.</p>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[{key: 'overview', label: "Vue d'ensemble"}, {key: 'requests', label: 'Gestion des Demandes'}, {key: 'land-management', label: 'Gestion Foncière'}].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {renderTabContent()}
        </div>
      </motion.div>
    
     <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
            {renderModalContent()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MairiesDashboardPage;