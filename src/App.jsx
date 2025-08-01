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
import VerificationPage from '@/pages/VerificationPage';


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
              <Routes>
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

                <Route path="/verification" element={<VerificationPage />} />

                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
                  <Route path="/dashboard/*" element={<DashboardPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="my-requests" element={<MyRequestsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="sell-property" element={<SellPropertyPage />} />
                  <Route path="my-listings" element={<MyListingsPage />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route path="payment/:transactionId" element={<PaymentPage />} />
                  <Route path="favorites" element={<MyFavoritesPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="messaging" element={<SecureMessagingPage />} />
                  <Route path="case-tracking/:id" element={<CaseTrackingPage />} />
                  <Route path="digital-vault" element={<DigitalVaultPage />} />
                  <Route path="municipal-land-request" element={<MunicipalLandRequestPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />

              </Routes>
              <Toaster />
              <GlobalChatbot />
            </ChatbotProvider>
          </AuthProvider>
        </ComparisonProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;