// src/pages/DashboardPage.jsx
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Routes, Route } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/spinner';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Importations de TOUTES les pages utilisées dans les routes
// Tableaux de bord spécifiques
import ParticulierDashboard from '@/pages/dashboards/ParticulierDashboard';
import InvestisseursDashboardPage from '@/pages/solutions/dashboards/InvestisseursDashboardPage';
import PromoteursDashboardPage from '@/pages/solutions/dashboards/PromoteursDashboardPage';
import AgriculteursDashboardPage from '@/pages/solutions/dashboards/AgriculteursDashboardPage';
import BanquesDashboardPage from '@/pages/solutions/dashboards/BanquesDashboardPage';
import MairiesDashboardPage from '@/pages/solutions/dashboards/MairiesDashboardPage';
import NotairesDashboardPage from '@/pages/solutions/dashboards/NotairesDashboardPage';
import VendeurDashboardPage from '@/pages/solutions/dashboards/VendeurDashboardPage';

// Pages de gestion admin
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminParcelsPage from '@/pages/admin/AdminParcelsPage';
import AdminBlogPage from '@/pages/admin/AdminBlogPage';
import AdminAgentsPage from '@/pages/admin/AdminAgentsPage';
import AdminRequestsPage from '@/pages/admin/AdminRequestsPage';
import AdminReportsPage from '@/pages/admin/AdminReportsPage';
import AdminContractsPage from '@/pages/admin/AdminContractsPage';
import AdminCompliancePage from '@/pages/admin/AdminCompliancePage';
import AdminTransactionsPage from '@/pages/admin/AdminTransactionsPage';

// Pages d'agent
import AgentDashboardPage from '@/pages/agent/AgentDashboardPage';
import AgentClientsPage from '@/pages/agent/AgentClientsPage';
import AgentParcelsPage from '@/pages/agent/AgentParcelsPage';
import AgentTasksPage from '@/pages/agent/AgentTasksPage';

// Pages générales (avec les chemins corrigés d'après nos discussions)
import LandManagementPage from '@/pages/dashboards/mairie/LandManagementPage';
import UrbanPlanPage from '@/pages/dashboards/mairie/UrbanPlanPage';
import CadastrePage from '@/pages/dashboards/mairie/CadastrePage';
import DisputesPage from '@/pages/dashboards/mairie/DisputesPage';
import FundingRequestsPage from '@/pages/dashboards/banque/FundingRequestsPage';
import GuaranteesPage from '@/pages/dashboards/banque/GuaranteesPage';
import LandValuationPage from '@/pages/dashboards/banque/LandValuationPage';
import CompliancePage from '@/pages/dashboards/banque/CompliancePage';
import ArchivesPage from '@/pages/dashboards/notaire/ArchivesPage';
import AuthenticationPage from '@/pages/dashboards/notaire/AuthenticationPage';
import CasesPage from '@/pages/dashboards/notaire/CasesPage';
import SolutionsBanquesPage from '@/pages/solutions/SolutionsBanquesPage'; // Gardé pour l'exemple
import MairieRequestsPage from '@/pages/dashboards/mairie/MairieRequestsPage';

// Composant Placeholder pour les pages non implémentées
const PlaceholderPage = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-lg shadow-md p-6">
    <h2 className="text-2xl font-bold text-gray-700 mb-4">{title}</h2>
    <p className="text-gray-500 text-center">Cette page est en cours de développement. Revenez bientôt !</p>
    <img src="https://placehold.co/200x200/E0F2F7/0288D1?text=En+Construction" alt="En construction" className="mt-6 rounded-lg" />
  </div>
);


const DashboardPage = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Définir le composant de tableau de bord par défaut pour chaque type d'utilisateur
  let DefaultUserDashboardComponent;
  switch (user.type) {
    case 'Vendeur': DefaultUserDashboardComponent = VendeurDashboardPage; break;
    case 'Investisseur': DefaultUserDashboardComponent = InvestisseursDashboardPage; break;
    case 'Promoteur': DefaultUserDashboardComponent = PromoteursDashboardPage; break;
    case 'Agriculteur': DefaultUserDashboardComponent = AgriculteursDashboardPage; break;
    case 'Banque': DefaultUserDashboardComponent = BanquesDashboardPage; break;
    case 'Mairie': DefaultUserDashboardComponent = MairiesDashboardPage; break;
    case 'Notaire': DefaultUserDashboardComponent = NotairesDashboardPage; break;
    case 'Particulier': DefaultUserDashboardComponent = ParticulierDashboard; break;
    default: DefaultUserDashboardComponent = AdminDashboardPage; // Fallback générique
  }

  // Le DashboardLayout est déjà géré dans App.jsx autour de <ProtectedRoute>
  // Ici, nous nous concentrons uniquement sur les <Routes> internes au dashboard
  return (
    <Routes>
      {/* Routes spécifiques à l'administrateur */}
      {user.role === 'admin' && (
        <>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users/*" element={<AdminUsersPage />} />
          <Route path="users/particuliers" element={<AdminUsersPage />} />
          <Route path="users/vendeurs" element={<AdminUsersPage />} />
          <Route path="users/mairies" element={<AdminUsersPage />} />
          <Route path="users/banques" element={<AdminUsersPage />} />
          <Route path="users/notaires" element={<AdminUsersPage />} />
          <Route path="users/promoteurs" element={<AdminUsersPage />} />
          <Route path="users/agriculteurs" element={<AdminUsersPage />} />
          <Route path="users/investisseurs" element={<AdminUsersPage />} />
          <Route path="parcels/*" element={<AdminParcelsPage />} />
          <Route path="blog/*" element={<AdminBlogPage />} />
          <Route path="agents/*" element={<AdminAgentsPage />} />
          <Route path="requests/*" element={<AdminRequestsPage />} />
          <Route path="reports/*" element={<AdminReportsPage />} />
          <Route path="contracts/*" element={<AdminContractsPage />} />
          <Route path="compliance/*" element={<AdminCompliancePage />} />
          <Route path="transactions/*" element={<AdminTransactionsPage />} />
          <Route path="*" element={<AdminDashboardPage />} /> {/* Fallback admin */}
        </>
      )}

      {/* Routes spécifiques à l'agent */}
      {user.role === 'agent' && (
        <>
          <Route index element={<AgentDashboardPage />} />
          <Route path="clients/*" element={<AgentClientsPage />} />
          <Route path="parcels/*" element={<AgentParcelsPage />} />
          <Route path="tasks/*" element={<AgentTasksPage />} />
          <Route path="*" element={<AgentDashboardPage />} /> {/* Fallback agent */}
        </>
      )}

      {/* Routes communes et spécifiques aux autres types d'utilisateurs (Particulier, Vendeur, Mairie, etc.) */}
      {user.role !== 'admin' && user.role !== 'agent' && (
        <>
          <Route index element={<DefaultUserDashboardComponent />} />

          {/* Routes spécifiques aux particuliers */}
          {user.type === 'Particulier' && (
            <>
              <Route path="my-acquisitions" element={<PlaceholderPage title="Mes Acquisitions" />} />
              <Route path="my-requests" element={<PlaceholderPage title="Mes Demandes" />} />
              <Route path="my-disputes" element={<PlaceholderPage title="Mes Litiges" />} />
            </>
          )}

          {/* Routes spécifiques aux vendeurs */}
          {user.type === 'Vendeur' && (
            <>
              <Route path="my-listings" element={<PlaceholderPage title="Mes Annonces" />} />
              <Route path="my-transactions" element={<PlaceholderPage title="Mes Transactions" />} />
              <Route path="submit-parcel" element={<PlaceholderPage title="Soumettre une Parcelle" />} />
            </>
          )}

          {/* Routes spécifiques aux investisseurs */}
          {user.type === 'Investisseur' && (
            <>
              <Route path="investment-opportunities" element={<PlaceholderPage title="Opportunités d'Investissement" />} />
              <Route path="portfolio" element={<PlaceholderPage title="Mon Portefeuille" />} />
            </>
          )}

          {/* Routes spécifiques aux promoteurs */}
          {user.type === 'Promoteur' && (
            <>
              <Route path="my-projects" element={<PlaceholderPage title="Mes Projets" />} />
              <Route path="land-acquisition" element={<PlaceholderPage title="Acquisition Foncière" />} />
            </>
          )}

          {/* Routes spécifiques aux agriculteurs */}
          {user.type === 'Agriculteur' && (
            <>
              <Route path="my-lands" element={<PlaceholderPage title="Mes Terres" />} />
              <Route path="subsidies" element={<PlaceholderPage title="Demandes de Subventions" />} />
              <Route path="weather" element={<PlaceholderPage title="Météo Agricole" />} />
            </>
          )}

          {/* Routes spécifiques aux banques */}
          {user.type === 'Banque' && (
            <>
              <Route path="funding-requests" element={<FundingRequestsPage />} />
              <Route path="guarantees" element={<GuaranteesPage />} />
              <Route path="land-valuation" element={<LandValuationPage />} />
              <Route path="compliance" element={<CompliancePage />} />
            </>
          )}

          {/* Routes spécifiques aux mairies */}
          {user.type === 'Mairie' && (
            <>
              <Route path="land-management" element={<LandManagementPage />} />
              <Route path="urban-plan" element={<UrbanPlanPage />} />
              <Route path="cadastre" element={<CadastrePage />} />
              <Route path="disputes" element={<DisputesPage />} />
              <Route path="mairie-requests" element={<MairieRequestsPage />} />
            </>
          )}

          {/* Routes spécifiques aux notaires */}
          {user.type === 'Notaire' && (
            <>
              <Route path="cases" element={<CasesPage />} />
              <Route path="authentication" element={<AuthenticationPage />} />
              <Route path="archives" element={<ArchivesPage />} />
              <Route path="land-valuation" element={<LandValuationPage />} /> {/* Partagé avec Banque */}
            </>
          )}

          {/* Fallback pour les autres types d'utilisateurs */}
          <Route path="*" element={<DefaultUserDashboardComponent />} />
        </>
      )}
    </Routes>
  );
};

export default DashboardPage;
