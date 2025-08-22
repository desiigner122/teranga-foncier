// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Importation de Button est toujours nécessaire pour les autres usages
import { Button } from '@/components/ui/button'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Search, MapPin, Handshake, ShieldCheck, TrendingUp, MessageSquareText, Landmark, Users, FileText, DollarSign,
  Newspaper, Map, BarChart, Lightbulb, Gavel, ClipboardCheck, Briefcase, Leaf, Store, Banknote, UserCheck,
  ArrowRight, CheckCircle, Globe, Clock, Sparkles, Lock, Zap, Building, Shield, Award, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatbot } from '@/context/ChatbotContext';
import SupabaseDataService from '@/services/supabaseDataService';

const HomePage = () => {
  const { openChatbot } = useChatbot();
  const [featuredParcels, setFeaturedParcels] = useState([]);
  const [blogArticles, setBlogArticles] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données réelles au montage du composant
  useEffect(() => {
    const loadRealData = async () => {
      try {
        setLoading(true);

        // Charger les parcelles en vedette (les plus récentes)
        const parcels = await SupabaseDataService.getParcels(3);
        const formattedParcels = parcels.map(parcel => ({
          id: parcel.id,
          name: parcel.title || `Parcelle ${parcel.reference}`,
          reference: parcel.reference,
          location: parcel.location || 'Localisation non spécifiée',
          area: parcel.area_sqm ? `${parcel.area_sqm} m²` : 'Surface non spécifiée',
          price: parcel.price ? `${new Intl.NumberFormat('fr-SN').format(parcel.price)} XOF` : 'Prix à négocier',
          image: parcel.image_url || 'https://placehold.co/400x250/0052A3/FFFFFF?text=Parcelle',
          status: parcel.status === 'available' ? 'Disponible' : 
                  parcel.status === 'reserved' ? 'Réservée' : 
                  parcel.status === 'sold' ? 'Vendue' : 'En attente'
        }));
        setFeaturedParcels(formattedParcels);

        // Charger les articles de blog les plus récents
        const blogs = await SupabaseDataService.getBlogPosts(3);
        const formattedBlogs = blogs.map(blog => ({
          id: blog.id,
          title: blog.title,
          date: new Date(blog.created_at).toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          }),
          description: blog.excerpt || blog.content?.substring(0, 150) + '...',
          image: blog.featured_image_url || 'https://placehold.co/400x280/FFD700/000000?text=Article',
          link: `/blog/${blog.id}`
        }));
        setBlogArticles(formattedBlogs);

        // Pour les témoignages, on peut utiliser des utilisateurs récents ou créer une table testimonials
        // Pour l'instant, on va utiliser des données de fallback si pas de témoignages réels
        const users = await SupabaseDataService.getUsers(3);
        const formattedTestimonials = users.length > 0 ? users.map((user, index) => ({
          id: user.id,
          name: user.full_name || 'Utilisateur anonyme',
          role: user.role || 'user',
          quote: getTestimonialForRole(user.role || 'user'),
          avatar: `https://placehold.co/80x80/E0F2F7/0288D1?text=${user.full_name?.substring(0, 2).toUpperCase() || 'UN'}`
        })) : [
          {
            id: 't1',
            name: 'Fatoumata Ndiaye',
            role: 'Particulier',
            quote: '"Teranga Foncier a rendu l\'achat de mon terrain incroyablement simple et sécurisé. Une équipe très professionnelle et une plateforme intuitive !"',
            avatar: 'https://placehold.co/80x80/E0F2F7/0288D1?text=FN'
          },
          {
            id: 't2',
            name: 'M. Diallo',
            role: 'Banque',
            quote: '"La plateforme a révolutionné la gestion de nos actifs fonciers. Fiabilité, transparence et efficacité au rendez-vous pour nos opérations bancaires."',
            avatar: 'https://placehold.co/80x80/D4EDDA/155724?text=MD'
          },
          {
            id: 't3',
            name: 'Awa Sow',
            role: 'Notaire',
            quote: '"Un service client exceptionnel et des démarches simplifiées. Teranga Foncier est un partenaire indispensable pour notre étude."',
            avatar: 'https://placehold.co/80x80/FCE5CD/E67E22?text=AS'
          }
        ];
        setTestimonials(formattedTestimonials);

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // En cas d'erreur, utiliser des données de fallback
        setFeaturedParcels(getDefaultParcels());
        setBlogArticles(getDefaultBlogs());
        setTestimonials(getDefaultTestimonials());
      } finally {
        setLoading(false);
      }
    };

    loadRealData();
  }, []);

  // Fonction utilitaire pour générer des témoignages selon le rôle
  const getTestimonialForRole = (role) => {
    const testimonials = {
      'Particulier': '"Teranga Foncier a simplifié mes démarches foncières. Interface intuitive et équipe compétente !"',
      'Vendeur': '"Excellent outil pour gérer mes annonces de terrains. Visibilité et transparence garanties."',
      'Banque': '"Plateforme fiable pour l\'évaluation et le suivi des garanties foncières. Très professionnel."',
      'Notaire': '"Service remarquable pour la vérification des titres fonciers. Gain de temps considérable."',
      'Mairie': '"Solution digitale efficace pour la gestion des terrains communaux. Recommandé."',
      'Agent': '"Outil indispensable pour accompagner mes clients dans leurs projets fonciers."'
    };
    return testimonials[role] || '"Excellente expérience avec Teranga Foncier. Service de qualité !"';
  };

  // Données de fallback en cas d'erreur
  const getDefaultParcels = () => [
    {
      id: 'fp1',
      name: 'Parcelle Résidentielle à Diamniadio',
      reference: 'REF-DIA-001',
      location: 'Diamniadio, Dakar',
      area: '300 m²',
      price: '25 000 000 XOF',
      image: 'https://placehold.co/400x250/0052A3/FFFFFF?text=Parcelle+Diamniadio',
      status: 'Disponible'
    },
    {
      id: 'fp2',
      name: 'Terrain Agricole à Thiès',
      reference: 'REF-THS-002',
      location: 'Thiès, Région de Thiès',
      area: '5000 m²',
      price: '15 000 000 XOF',
      image: 'https://placehold.co/400x250/00A3AD/FFFFFF?text=Terrain+Thiès',
      status: 'Disponible'
    },
    {
      id: 'fp3',
      name: 'Parcelle Commerciale à Dakar',
      reference: 'REF-DKR-003',
      location: 'Plateau, Dakar',
      area: '150 m²',
      price: '45 000 000 XOF',
      image: 'https://placehold.co/400x250/F0A800/FFFFFF?text=Parcelle+Dakar',
      status: 'Réservée'
    }
  ];

  const getDefaultBlogs = () => [
    {
      id: 'b1',
      title: 'La numérisation du foncier : une révolution au Sénégal',
      date: '25 Juillet 2025',
      description: 'Découvrez comment la technologie transforme l\'accès et la gestion des terres au Sénégal...',
      image: 'https://placehold.co/400x280/FFD700/000000?text=Article+Numerisation',
      link: '/blog/article-1'
    },
    {
      id: 'b2',
      title: 'Acheter un terrain à Dakar : Le guide complet',
      date: '18 Juillet 2025',
      description: 'Nos experts partagent leurs conseils pour sécuriser votre investissement foncier dans la capitale...',
      image: 'https://placehold.co/400x280/ADD8E6/000000?text=Article+Achat+Dakar',
      link: '/blog/article-2'
    },
    {
      id: 'b3',
      title: 'Demande de terrain en mairie : Simplifiez vos démarches',
      date: '10 Juillet 2025',
      description: 'Découvrez comment notre plateforme simplifie vos démarches administratives pour l\'acquisition de terrains communaux...',
      image: 'https://placehold.co/400x280/90EE90/000000?text=Article+Mairie',
      link: '/blog/article-3'
    }
  ];

  const getDefaultTestimonials = () => [
    {
      id: 't1',
      name: 'Fatou Ndiaye',
      role: 'Particulier',
      quote: '"Teranga Foncier a rendu l\'achat de mon terrain incroyablement simple et sécurisé. Une équipe très professionnelle et une plateforme intuitive !"',
      avatar: 'https://placehold.co/80x80/E0F2F7/0288D1?text=FN'
    },
    {
      id: 't2',
      name: 'M. Diallo',
      role: 'Banque XYZ',
      quote: '"La plateforme a révolutionné la gestion de nos actifs fonciers. Fiabilité, transparence et efficacité au rendez-vous pour nos opérations bancaires."',
      avatar: 'https://placehold.co/80x80/D4EDDA/155724?text=MD'
    },
    {
      id: 't3',
      name: 'Awa Sow',
      role: 'Notaire',
      quote: '"Un service client exceptionnel et des démarches simplifiées. Teranga Foncier est un partenaire indispensable pour notre étude."',
      avatar: 'https://placehold.co/80x80/FCE5CD/E67E22?text=AS'
    }
  ];

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col min-h-screen font-inter bg-gray-50 dark:bg-background"
    >
      {/* Hero Section - Réorienté: priorité demande terrain communal + confiance anti-fraude */}
      <section 
        className="relative w-full min-h-[700px] md:min-h-[760px] bg-cover bg-center flex items-center text-white overflow-hidden" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3')" }}
      >
        {/* Overlay pour assombrir l'image et améliorer la lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-800/80 to-emerald-700/60"></div>

        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center text-center h-full">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight max-w-5xl"
          >
            Accédez aux Terrains Communaux & Sécurisez Vos Transactions Foncières
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="text-lg md:text-2xl mb-10 max-w-4xl mx-auto opacity-90 font-medium"
          >
            Demandez officiellement un terrain de votre commune, vérifiez les titres et déposez vos annonces en toute transparence grâce à notre dispositif anti-fraude.
          </motion.p>
          
          {/* Bloc principal d'action: Demande terrain communal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
            className="w-full max-w-3xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-10 border border-white/40"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3"><Landmark className="h-8 w-8 text-blue-700"/> Demandez un Terrain Communal</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">Sélectionnez région, département et commune sur la page dédiée et suivez l'avancement de votre dossier en temps réel. Réduisez les délais et évitez les pertes de documents.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link onClick={()=>SupabaseDataService.recordHomepageCta('hero_municipal_request')} to="/municipal-land-request-info" className="flex-1 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-5 rounded-xl shadow-md transition-all">
                <span className="flex items-center gap-2">Démarrer ma Demande <ArrowRight className="h-5 w-5"/></span>
              </Link>
              <Link onClick={()=>SupabaseDataService.recordHomepageCta('hero_explore_parcels')} to="/parcelles" className="flex-1 inline-flex items-center justify-center bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-lg px-8 py-5 rounded-xl border border-blue-200 transition-all">
                <span className="flex items-center gap-2">Explorer les Parcelles <MapPin className="h-5 w-5"/></span>
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2"><Shield className="h-5 w-5 text-emerald-600"/><span>Dossier horodaté & suivi transparent</span></div>
              <div className="flex items-start gap-2"><Sparkles className="h-5 w-5 text-blue-600"/><span>Réduction des allers-retours administratifs</span></div>
              <div className="flex items-start gap-2"><Lock className="h-5 w-5 text-indigo-600"/><span>Protection des documents fournis</span></div>
            </div>
          </motion.div>

          {/* Bande confiance anti-fraude */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 w-full max-w-5xl"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xl border border-white/40">
              <div className="flex items-start gap-3">
                <Award className="h-8 w-8 text-amber-500"/>
                <div>
                  <p className="font-semibold text-gray-900">Badge Vendeur Vérifié</p>
                  <p className="text-xs text-gray-600 mt-1">Soumettez les titres et pièces clés pour booster la visibilité de votre annonce.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-8 w-8 text-emerald-600"/>
                <div>
                  <p className="font-semibold text-gray-900">Anti-Fraude Intégré</p>
                  <p className="text-xs text-gray-600 mt-1">Contrôles croisés & journalisation des actions pour réduire les risques.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-8 w-8 text-red-500"/>
                <div>
                  <p className="font-semibold text-gray-900">Alerte Anomalies</p>
                  <p className="text-xs text-gray-600 mt-1">Signalement proactif des incohérences documentaires.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section "Comment ça marche ?" - Design Eskimoz */}
      <section className="py-16 bg-white dark:bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-12">
            Comment ça marche ?
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={itemVariants}>
              <Card className="p-6 text-center shadow-lg rounded-xl h-full flex flex-col items-center justify-center bg-blue-50/50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800">
                <Clock className="h-14 w-14 text-blue-600 mb-4" strokeWidth={1.5} />
                <CardTitle className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">1. Créez votre compte</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Inscrivez-vous rapidement pour accéder à toutes les fonctionnalités de la plateforme.</CardDescription>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="p-6 text-center shadow-lg rounded-xl h-full flex flex-col items-center justify-center bg-green-50/50 dark:bg-green-950/50 border border-green-100 dark:border-green-800">
                <FileText className="h-14 w-14 text-green-600 mb-4" strokeWidth={1.5} />
                <CardTitle className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">2. Soumettez votre demande</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Que ce soit pour une parcelle vérifiée ou une demande en mairie, le processus est simplifié.</CardDescription>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="p-6 text-center shadow-lg rounded-xl h-full flex flex-col items-center justify-center bg-purple-50/50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-800">
                <CheckCircle className="h-14 w-14 text-purple-600 mb-4" strokeWidth={1.5} />
                <CardTitle className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">3. Suivez et concrétisez</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Suivez l'état de votre dossier en temps réel et finalisez votre acquisition en toute sérénité.</CardDescription>
              </Card>
            </motion.div>
          </motion.div>
          <div className="text-center mt-12">
            {/* Correction: Appliquer les styles de bouton directement au Link */}
            <Link to="/how-it-works" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-lg px-8 py-6 font-bold transition-all duration-300 transform hover:scale-105">
              <span className="flex items-center gap-2">
                En savoir plus sur le processus <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Section "Nos Engagements" - Design Eskimoz */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-12">
            Nos Engagements pour Votre Sérénité
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={itemVariants}>
              <Card className="p-6 text-center shadow-lg rounded-xl h-full flex flex-col items-center justify-center bg-white dark:bg-card border border-gray-200 dark:border-gray-700">
                <Sparkles className="h-14 w-14 text-yellow-600 mb-4" strokeWidth={1.5} />
                <CardTitle className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Innovation</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Nous utilisons les dernières technologies pour simplifier et sécuriser vos démarches foncières.</CardDescription>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="p-6 text-center shadow-lg rounded-xl h-full flex flex-col items-center justify-center bg-white dark:bg-card border border-gray-200 dark:border-gray-700">
                <Lock className="h-14 w-14 text-red-600 mb-4" strokeWidth={1.5} />
                <CardTitle className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Sécurité</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Vos données et transactions sont protégées par des protocoles de sécurité avancés.</CardDescription>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="p-6 text-center shadow-lg rounded-xl h-full flex flex-col items-center justify-center bg-white dark:bg-card border border-gray-200 dark:border-gray-700">
                <Handshake className="h-14 w-14 text-blue-600 mb-4" strokeWidth={1.5} />
                <CardTitle className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Transparence</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Accédez à des informations claires et complètes pour chaque propriété.</CardDescription>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section "Terrains en Vedette" - Design Eskimoz */}
      <section className="py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 dark:text-white mb-12">
            Nos Terrains en Vedette
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featuredParcels.map((parcel) => (
              <motion.div key={parcel.id} variants={itemVariants} whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="h-full flex flex-col rounded-xl shadow-md overflow-hidden bg-white dark:bg-card border border-gray-200 dark:border-gray-700">
                  <img src={parcel.image} alt={parcel.name} className="object-cover h-56 w-full" loading="lazy" />
                  <CardHeader className="flex-grow pb-2">
                    <CardTitle className="text-2xl font-bold">{parcel.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{parcel.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-800 dark:text-white">{parcel.area}</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{parcel.price}</span>
                    </div>
                    {/* Correction: Appliquer les styles de bouton directement au Link */}
                    <Link to={`/parcelles/${parcel.id}`} className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold py-2 px-4">
                      <span className="flex items-center gap-2">
                        Voir les détails <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center mt-12">
            {/* Correction: Appliquer les styles de bouton directement au Link */}
            <Link to="/parcelles" className="inline-flex items-center justify-center text-blue-600 border-2 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900 rounded-lg px-8 py-6 font-bold transition-all duration-300 transform hover:scale-105">
              <span className="flex items-center gap-2">
                Explorer les Terrains Vérifiés <MapPin className="h-6 w-6" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section - "Retricir les cards" et design Eskimoz */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 dark:text-white mb-12">
            Nos Solutions pour Chaque Profil
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" /* Réduction du gap */
          >
            <motion.div variants={itemVariants}>
              <Card className="rounded-xl hover:shadow-xl transition-shadow h-full flex flex-col p-5 bg-white dark:bg-card border border-gray-200 dark:border-gray-700"> /* Réduction du padding */
                <CardHeader className="pb-2">
                  <Building className="h-12 w-12 text-blue-600 mb-3" strokeWidth={1.5} /> /* Icônes légèrement plus petites */
                  <CardTitle className="text-xl font-bold">Mairies</CardTitle> /* Titre légèrement plus petit */
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm leading-relaxed">Gérez le foncier communal, les demandes citoyens et le cadastre numérique avec une efficacité inégalée.</p>
                  {/* Correction: Appliquer les styles de bouton directement au Link */}
                  <Link to="/solutions/mairies" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-semibold mt-4">
                    <span className="flex items-center gap-2">
                      En savoir plus <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="rounded-xl hover:shadow-xl transition-shadow h-full flex flex-col p-5 bg-white dark:bg-card border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <Gavel className="h-12 w-12 text-green-600 mb-3" strokeWidth={1.5} />
                  <CardTitle className="text-xl font-bold">Notaires</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm leading-relaxed">Simplifiez l'authentification des actes et la gestion des dossiers fonciers en toute sécurité.</p>
                  {/* Correction: Appliquer les styles de bouton directement au Link */}
                  <Link to="/solutions/notaires" className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-semibold mt-4">
                    <span className="flex items-center gap-2">
                      En savoir plus <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="rounded-xl hover:shadow-xl transition-shadow h-full flex flex-col p-5 bg-white dark:bg-card border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <Banknote className="h-12 w-12 text-purple-600 mb-3" strokeWidth={1.5} />
                  <CardTitle className="text-xl font-bold">Banques</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm leading-relaxed">Optimisez la gestion de vos garanties foncières et accélérez les demandes de financement.</p>
                  {/* Correction: Appliquer les styles de bouton directement au Link */}
                  <Link to="/solutions/banques" className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-semibold mt-4">
                    <span className="flex items-center gap-2">
                      En savoir plus <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="rounded-xl hover:shadow-xl transition-shadow h-full flex flex-col p-5 bg-white dark:bg-card border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <UserCheck className="h-12 w-12 text-orange-600 mb-3" strokeWidth={1.5} />
                  <CardTitle className="text-xl font-bold">Agents Fonciers</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm leading-relaxed">Gérez vos clients et parcelles efficacement, suivez vos tâches quotidiennes en toute simplicité.</p>
                  {/* Correction: Appliquer les styles de bouton directement au Link */}
                  <Link to="/solutions/agents" className="inline-flex items-center text-orange-600 hover:text-orange-700 text-sm font-semibold mt-4">
                    <span className="flex items-center gap-2">
                      En savoir plus <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Discover Section - Design Eskimoz */}
      <section className="py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-6">
              Le Foncier Sénégalais en un Coup d'Œil
            </h2>
            <p className="text-gray-700 dark:text-gray-300 font-normal leading-relaxed mb-4 text-lg">
              Explorez notre carte interactive pour visualiser les opportunités foncières, les valeurs estimées et les zones de développement à travers le Sénégal.
            </p>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6 text-lg">
              <li className="flex items-center"><Globe className="h-6 w-6 text-blue-500 mr-3" /> Accès aux données géospatiales précises.</li>
              <li className="flex items-center"><TrendingUp className="h-6 w-6 text-green-500 mr-3" /> Tendances des prix des terrains par région.</li>
              <li className="flex items-center"><ClipboardCheck className="h-6 w-6 text-purple-500 mr-3" /> Informations vérifiées et à jour.</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Correction: Appliquer les styles de bouton directement au Link */}
              <Link to="/parcelles" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-lg px-8 py-6 font-bold transition-all duration-300 transform hover:scale-105">
                <span className="flex items-center gap-2">
                  Voir la Carte Interactive <Map className="ml-2 h-5 w-5" />
                </span>
              </Link>
              {/* Correction: Appliquer les styles de bouton directement au Link */}
              <Link to="/parcelles" className="inline-flex items-center justify-center text-blue-600 border-2 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900 rounded-lg px-8 py-6 font-bold">
                <span>Explorer les Terrains</span>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            {/* Placeholder pour la carte du Sénégal - Image plus stylisée et arrondie */}
            <motion.img
              src="https://placehold.co/600x400/007bff/FFFFFF?text=Carte+du+Senegal" // Placeholder
              alt="Carte du Sénégal"
              className="rounded-xl shadow-xl border-4 border-blue-100 dark:border-blue-900"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      {/* Blog Section - Design Eskimoz */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 dark:text-white mb-12">
            Nos Derniers Articles et Actualités
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {blogArticles.map((article) => (
              <motion.div key={article.id} variants={itemVariants} whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="h-full flex flex-col shadow-md rounded-xl overflow-hidden bg-white dark:bg-card border border-gray-200 dark:border-gray-700">
                  <img src={article.image} alt={article.title} className="object-cover h-56 w-full" loading="lazy" />
                  <CardHeader className="flex-grow pb-2">
                    <CardTitle className="text-2xl font-bold">{article.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{article.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-base mb-4">{article.description}</p>
                    {/* Correction: Appliquer les styles de bouton directement au Link */}
                    <Link to={article.link} className="inline-flex items-center text-blue-600 hover:text-blue-700 text-base font-semibold">
                      <span className="flex items-center gap-2">
                        Lire plus <ArrowRight className="ml-1 h-4 w-4" />
                      </span>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center mt-12">
            {/* Correction: Appliquer les styles de bouton directement au Link */}
            <Link to="/blog" className="inline-flex items-center justify-center text-blue-600 border-2 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900 rounded-lg px-8 py-6 font-bold">
              <span className="flex items-center gap-2">
                Voir toutes les actualités <Newspaper className="ml-2 h-5 w-5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Chatbot Section - Alignement du bouton au milieu et design Eskimoz */}
      <section className="py-16 bg-blue-50 dark:bg-blue-950">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-card p-12 rounded-xl shadow-xl max-w-3xl mx-auto flex flex-col items-center"
          >
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Une question ? Parlez à notre IA !
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
              Notre assistant virtuel intelligent est là pour vous guider à travers les démarches foncières et répondre à vos interrogations.
            </p>
            {/* Correction: Utilisation directe du bouton sans Link */}
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center gap-2 rounded-lg px-8 py-6 font-bold transition-all duration-300 transform hover:scale-105"
              onClick={openChatbot}
              aria-label="Lancer le chatbot"
            >
              <MessageSquareText className="h-5 w-5" /> Lancer le Chatbot
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section - Design Eskimoz */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-12">
            Ce que disent nos utilisateurs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <motion.div key={testimonial.id} variants={itemVariants} whileHover={{ scale: 1.03 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }}>
                <Card className="bg-white dark:bg-card p-8 rounded-xl shadow-md flex flex-col items-center text-center border border-gray-200 dark:border-gray-700">
                  <img src={testimonial.avatar} alt={testimonial.name} className="rounded-full mb-4 border-2 border-blue-200" />
                  <p className="text-gray-700 dark:text-gray-200 text-lg italic mb-4 leading-relaxed">"{testimonial.quote}"</p>
                  <p className="font-bold text-gray-800 dark:text-white text-base">- {testimonial.name}, {testimonial.role}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default HomePage;
