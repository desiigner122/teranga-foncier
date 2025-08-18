// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet, Link, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DashboardLayout from '@/components/layout/DashboardLayout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import ParcelsListPage from '@/pages/ParcelsListPage';
import ParcelDetailPage from '@/pages/ParcelDetailPage';
import ProfilePage from '@/pages/ProfilePage';
import ContactPage from '@/pages/ContactPage';
import AboutPage from '@/pages/AboutPage';
import MapPage from '@/pages/MapPage';
import MyRequestsPage from '@/pages/MyRequestsPage';
import SettingsPage from '@/pages/SettingsPage';
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';
import LegalPage from '@/pages/LegalPage';
import PrivacyPage from '@/pages/PrivacyPage';
import CookiePolicyPage from '@/pages/CookiePolicyPage';
import HowItWorksPage from '@/pages/HowItWorksPage';
import FaqPage from '@/pages/FaqPage';
import PartnersPage from '@/pages/PartnersPage';
import SellPropertyPage from '@/pages/SellPropertyPage';
import MyListingsPage from '@/pages/MyListingsPage';
import MyFavoritesPage from '@/pages/MyFavoritesPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SavedSearchesPage from '@/pages/SavedSearchesPage';
import ComparisonPage from '@/pages/ComparisonPage';
import SecureMessagingPage from '@/pages/SecureMessagingPage';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import ScrollToTop from '@/components/layout/ScrollToTop';
import { motion } from 'framer-motion';
import { ComparisonProvider } from '@/context/ComparisonContext';
import MunicipalLandRequestPage from '@/pages/MunicipalLandRequestPage';
import MunicipalLandRequestInfoPage from '@/pages/MunicipalLandRequestInfoPage';
import GlobalChatbot from '@/components/GlobalChatbot';
import SolutionsBanquesPage from '@/pages/solutions/SolutionsBanquesPage';
import PricingPage from '@/pages/PricingPage';
import GlossaryPage from '@/pages/GlossaryPage';
import TaxGuidePage from '@/pages/TaxGuidePage';
import CaseTrackingPage from '@/pages/CaseTrackingPage';
import DigitalVaultPage from '@/pages/DigitalVaultPage';
import TransactionsPage from '@/pages/TransactionsPage';
import PaymentPage from '@/pages/PaymentPage';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/context/AuthContext';
import { ChatbotProvider } from '@/context/ChatbotContext';
import { MessagingNotificationProvider } from '@/context/MessagingNotificationContext';
import VerificationPage from '@/pages/VerificationPage';
import IdentityVerificationPage from '@/pages/IdentityVerificationPage';
import VendeurDashboard from '@/pages/dashboards/VendeurDashboard';
import InvestisseurDashboard from '@/pages/dashboards/InvestisseurDashboard';
import PromoteurDashboard from '@/pages/dashboards/PromoteurDashboard';
import AgriculteurDashboard from '@/pages/dashboards/AgriculteurDashboard';
import BanqueDashboard from '@/pages/dashboards/BanqueDashboard';
import NotairesDashboard from '@/pages/dashboards/NotairesDashboard';
import MairiesDashboard from '@/pages/dashboards/MairiesDashboard';

// Dashboard Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUsersPageAdvanced from '@/pages/admin/AdminUsersPageAdvanced';
import AdminParcelsPage from '@/pages/admin/AdminParcelsPage';
import AdminBlogPage from '@/pages/admin/AdminBlogPage';
import AdminAgentsPage from '@/pages/admin/AdminAgentsPage';
import AdminRequestsPage from '@/pages/admin/AdminRequestsPage';
import AdminReportsPage from '@/pages/admin/AdminReportsPage';
import AdminContractsPage from '@/pages/admin/AdminContractsPage';
import AdminDisputesPage from '@/pages/admin/AdminDisputesPage';
import AdminCompliancePage from '@/pages/admin/AdminCompliancePage';
import AdminTransactionsPage from '@/pages/admin/AdminTransactionsPage';
import AdminAIAssistantPage from '@/pages/admin/AdminAIAssistantPage';

// Agent Dashboard Pages
import AgentDashboardPage from '@/pages/agent/AgentDashboardPage';
import AgentClientsPage from '@/pages/agent/AgentClientsPage';
import AgentParcelsPage from '@/pages/agent/AgentParcelsPage';
import AgentTasksPage from '@/pages/agent/AgentTasksPage';

// Role-based Dashboard Pages
import ParticulierDashboard from '@/pages/dashboards/ParticulierDashboard';

// Specific Role Pages
import LandManagementPage from '@/pages/dashboards/mairie/LandManagementPage';
import UrbanPlanPage from '@/pages/dashboards/mairie/UrbanPlanPage';
import CadastrePage from '@/pages/dashboards/mairie/CadastrePage';
import DisputesPage from '@/pages/dashboards/mairie/DisputesPage';
import MairieRequestsPage from '@/pages/dashboards/mairie/MairieRequestsPage';
import FundingRequestsPage from '@/pages/dashboards/banque/FundingRequestsPage';
import GuaranteesPage from '@/pages/dashboards/banque/GuaranteesPage';
import LandValuationPage from '@/pages/dashboards/banque/LandValuationPage';
import CompliancePage from '@/pages/dashboards/banque/CompliancePage';
// Notaire-specific pages
import ArchivesPage from '@/pages/dashboards/notaire/ArchivesPage';
import AuthenticationPage from '@/pages/dashboards/notaire/AuthenticationPage';
import CasesPage from '@/pages/dashboards/notaire/CasesPage';
import ComplianceCheckPage from '@/pages/dashboards/notaire/ComplianceCheckPage';

// Investisseur-specific pages
import MarketAnalysisPage from '@/pages/dashboards/investisseur/MarketAnalysisPage';
import OpportunitiesPage from '@/pages/dashboards/investisseur/OpportunitiesPage';
import RoiCalculatorPage from '@/pages/dashboards/investisseur/RoiCalculatorPage';
import InvestmentsPage from '@/pages/dashboards/investisseur/InvestmentsPage';
import DueDiligencePage from '@/pages/dashboards/investisseur/DueDiligencePage';

// Promoteur-specific pages
import ProjectsPage from '@/pages/dashboards/promoteur/ProjectsPage';
import ConstructionTrackingPage from '@/pages/dashboards/promoteur/ConstructionTrackingPage';
import SalesPage from '@/pages/dashboards/promoteur/SalesPage';

// Agriculteur-specific pages
import MyLandsPage from '@/pages/dashboards/agriculteur/MyLandsPage';
import SoilAnalysisPage from '@/pages/dashboards/agriculteur/SoilAnalysisPage';
import WeatherPage from '@/pages/dashboards/agriculteur/WeatherPage';
import LogbookPage from '@/pages/dashboards/agriculteur/LogbookPage';
import EquipmentPage from '@/pages/dashboards/agriculteur/EquipmentPage';

// Additional platform pages
import TransactionTrackingPage from '@/pages/TransactionTrackingPage';
import MarketPredictionPage from '@/pages/MarketPredictionPage';
import DocumentManagementPage from '@/pages/DocumentManagementPage';
import AlertsNotificationsPage from '@/pages/AlertsNotificationsPage';

const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1 pt-20">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const NotFoundPage = () => (
   <div className="container mx-auto text-center py-20 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
     <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 100 }}>
       <h1 className="text-6xl font-bold text-primary">404</h1>
       <h2 className="text-2xl font-semibold mb-4">Page Non Trouvée</h2>
       <p className="text-muted-foreground mb-8 max-w-md">Désolé, la page que vous recherchez semble s'être égarée dans le cadastre numérique.</p>
       <Button asChild size="lg" className="bg-gradient-to-r from-green-500 to-primary hover:opacity-90 text-white">
         <Link to="/">Retourner à l'Accueil</Link>
       </Button>
     </motion.div>
   </div>
);

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ComparisonProvider>
          <ScrollToTop />
          <AuthProvider>
            <ChatbotProvider>
              <MessagingNotificationProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="parcelles" element={<ParcelsListPage />} />
                    <Route path="parcelles/:id" element={<ParcelDetailPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="how-it-works" element={<HowItWorksPage />} />
                    <Route path="faq" element={<FaqPage />} />
                    <Route path="partners" element={<PartnersPage />} />
                    <Route path="map" element={<MapPage />} />
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="blog/:slug" element={<BlogPostPage />} />
                    <Route path="legal" element={<LegalPage />} />
                    <Route path="privacy" element={<PrivacyPage />} />
                    <Route path="cookie-policy" element={<CookiePolicyPage />} />
                    <Route path="saved-searches" element={<SavedSearchesPage />} />
                    <Route path="compare" element={<ComparisonPage />} />
                    <Route path="municipal-land-request-info" element={<MunicipalLandRequestInfoPage />} />
                    <Route path="solutions/banques" element={<SolutionsBanquesPage />} />
                    <Route path="pricing" element={<PricingPage />} />
                    <Route path="glossary" element={<GlossaryPage />} />
                    <Route path="tax-guide" element={<TaxGuidePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* Verification Routes */}
                  <Route path="/verification" element={<VerificationPage />} />
                  <Route path="/identity-verification" element={
                    <ProtectedRoute>
                      <IdentityVerificationPage />
                    </ProtectedRoute>
                  } />

                  {/* Dashboard Routes - All under DashboardLayout */}
                  <Route element={<ProtectedRoute requireVerification={true}><DashboardLayout /></ProtectedRoute>}>
                    {/* Dashboard Dispatcher */}
                    <Route path="/dashboard" element={<DashboardPage />} />
                    
                    {/* Admin Routes */}
                    <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
                    <Route path="/dashboard/admin/users" element={<AdminUsersPageAdvanced />} />
                    <Route path="/dashboard/admin/parcels" element={<AdminParcelsPage />} />
                    <Route path="/dashboard/admin/blog" element={<AdminBlogPage />} />
                    <Route path="/dashboard/admin/agents" element={<AdminAgentsPage />} />
                    <Route path="/dashboard/admin/requests" element={<AdminRequestsPage />} />
                    <Route path="/dashboard/admin/reports" element={<AdminReportsPage />} />
                    <Route path="/dashboard/admin/contracts" element={<AdminContractsPage />} />
                    <Route path="/dashboard/admin/compliance" element={<AdminCompliancePage />} />
                    <Route path="/dashboard/admin/disputes" element={<AdminDisputesPage />} />
                    <Route path="/dashboard/admin/transactions" element={<AdminTransactionsPage />} />
                    <Route path="/dashboard/admin/ai-assistant" element={<AdminAIAssistantPage />} />

                    {/* Agent Routes */}
                    <Route path="/dashboard/agent" element={<AgentDashboardPage />} />
                    <Route path="/dashboard/agent/clients" element={<AgentClientsPage />} />
                    <Route path="/dashboard/agent/parcels" element={<AgentParcelsPage />} />
                    <Route path="/dashboard/agent/tasks" element={<AgentTasksPage />} />

                    {/* Role-specific Dashboard Routes */}
                    <Route path="/dashboard/particulier" element={<ParticulierDashboard />} />
                    <Route path="/dashboard/vendeur" element={<VendeurDashboard />} />
                    <Route path="/dashboard/investisseur" element={<InvestisseurDashboard />} />
                    <Route path="/dashboard/promoteur" element={<PromoteurDashboard />} />
                    <Route path="/dashboard/agriculteur" element={<AgriculteurDashboard />} />
                    <Route path="/dashboard/banque" element={<BanqueDashboard />} />
                    <Route path="/dashboard/mairie" element={<MairiesDashboard />} />
                    <Route path="/dashboard/notaire" element={<NotairesDashboard />} />

                    {/* Mairie-specific Routes */}
                    <Route path="/dashboard/mairie/land-management" element={<LandManagementPage />} />
                    <Route path="/dashboard/mairie/urban-plan" element={<UrbanPlanPage />} />
                    <Route path="/dashboard/mairie/cadastre" element={<CadastrePage />} />
                    <Route path="/dashboard/mairie/disputes" element={<DisputesPage />} />
                    <Route path="/dashboard/mairie/requests" element={<MairieRequestsPage />} />

                    {/* Banque-specific Routes */}
                    <Route path="/dashboard/banque/funding-requests" element={<FundingRequestsPage />} />
                    <Route path="/dashboard/banque/guarantees" element={<GuaranteesPage />} />
                    <Route path="/dashboard/banque/land-valuation" element={<LandValuationPage />} />
                    <Route path="/dashboard/banque/compliance" element={<CompliancePage />} />

                    {/* Notaire-specific Routes */}
                    <Route path="/dashboard/notaire/cases" element={<CasesPage />} />
                    <Route path="/dashboard/notaire/authentication" element={<AuthenticationPage />} />
                    <Route path="/dashboard/notaire/archives" element={<ArchivesPage />} />
                    <Route path="/dashboard/notaire/compliance-check" element={<ComplianceCheckPage />} />

                    {/* Investisseur-specific Routes */}
                    <Route path="/dashboard/investisseur/market-analysis" element={<MarketAnalysisPage />} />
                    <Route path="/dashboard/investisseur/opportunities" element={<OpportunitiesPage />} />
                    <Route path="/dashboard/investisseur/roi-calculator" element={<RoiCalculatorPage />} />
                    <Route path="/dashboard/investisseur/investissements" element={<InvestmentsPage />} />
                    <Route path="/dashboard/investisseur/due-diligence" element={<DueDiligencePage />} />

                    {/* Promoteur-specific Routes */}
                    <Route path="/dashboard/promoteur/projects" element={<ProjectsPage />} />
                    <Route path="/dashboard/promoteur/construction-tracking" element={<ConstructionTrackingPage />} />
                    <Route path="/dashboard/promoteur/sales" element={<SalesPage />} />

                    {/* Agriculteur-specific Routes */}
                    <Route path="/dashboard/agriculteur/my-lands" element={<MyLandsPage />} />
                    <Route path="/dashboard/agriculteur/soil-analysis" element={<SoilAnalysisPage />} />
                    <Route path="/dashboard/agriculteur/weather" element={<WeatherPage />} />
                    <Route path="/dashboard/agriculteur/logbook" element={<LogbookPage />} />
                    <Route path="/dashboard/agriculteur/equipment" element={<EquipmentPage />} />

                    {/* Common Protected Routes */}
                    <Route path="/dashboard/profile" element={<ProfilePage />} />
                    <Route path="/dashboard/my-requests" element={<MyRequestsPage />} />
                    <Route path="/dashboard/settings" element={<SettingsPage />} />
                    <Route path="/dashboard/sell-property" element={<SellPropertyPage />} />
                    <Route path="/dashboard/my-listings" element={<MyListingsPage />} />
                    <Route path="/dashboard/transactions" element={<TransactionsPage />} />
                    <Route path="/dashboard/payment/:transactionId" element={<PaymentPage />} />
                    <Route path="/dashboard/favorites" element={<MyFavoritesPage />} />
                    <Route path="/dashboard/notifications" element={<NotificationsPage />} />
                    <Route path="/dashboard/messaging" element={<SecureMessagingPage />} />
                    <Route path="/dashboard/case-tracking/:id" element={<CaseTrackingPage />} />
                    <Route path="/dashboard/digital-vault" element={<DigitalVaultPage />} />
                    <Route path="/dashboard/municipal-land-request" element={<MunicipalLandRequestPage />} />
                    
                    {/* Advanced Platform Features */}
                    <Route path="/dashboard/transaction-tracking" element={<TransactionTrackingPage />} />
                    <Route path="/dashboard/market-prediction" element={<MarketPredictionPage />} />
                    <Route path="/dashboard/document-management" element={<DocumentManagementPage />} />
                    <Route path="/dashboard/alerts-notifications" element={<AlertsNotificationsPage />} />

                    {/* Legacy Route Redirects */}
                    <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
                    <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
                    <Route path="/my-requests" element={<Navigate to="/dashboard/my-requests" replace />} />
                    <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
                    <Route path="/favorites" element={<Navigate to="/dashboard/favorites" replace />} />
                    <Route path="/notifications" element={<Navigate to="/dashboard/notifications" replace />} />
                    <Route path="/messaging" element={<Navigate to="/dashboard/messaging" replace />} />
                  </Route>

                  {/* Catch-all 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
                <Toaster />
                <GlobalChatbot />
                </MessagingNotificationProvider>
              </ChatbotProvider>
            </AuthProvider>
        </ComparisonProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;