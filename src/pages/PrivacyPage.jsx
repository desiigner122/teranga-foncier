import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, UserCircle, Database, FileLock, Server, Users, Edit3, Cookie, RotateCcw, MailWarning } from 'lucide-react';

const PrivacyPage = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const PolicyPoint = ({ icon: Icon, title, children }) => (
    <motion.section variants={itemVariants} className="p-6 bg-card border border-border/50 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center">
        <Icon className="mr-3 h-7 w-7 text-primary flex-shrink-0"/>{title}
      </h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed text-sm md:text-base">
        {children}
      </div>
    </motion.section>
  );

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-b from-background to-gray-50 dark:from-background dark:to-gray-900/20 min-h-screen"
    >
      <div className="container mx-auto py-16 px-4 max-w-4xl">
        <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
          <Shield className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Politique de Confidentialité</h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Votre confiance est notre priorité. Découvrez comment nous protégeons vos données personnelles.
          </p>
          <p className="text-sm text-muted-foreground mt-2">Dernière mise à jour : 18 Juin 2025</p>
        </motion.div>

        <div className="space-y-10">
          <motion.p variants={itemVariants} className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Teranga Foncier ("Teranga Foncier", "nous", "notre"), dirigé par Abdoulaye Diémé, s'engage à protéger la confidentialité de vos informations personnelles. Cette Politique de Confidentialité décrit comment nous collectons, utilisons, divulguons et protégeons les informations que vous nous fournissez lorsque vous utilisez notre site web et nos services (collectivement, la "Plateforme").
          </motion.p>

          <PolicyPoint icon={UserCircle} title="1. Informations Collectées">
            <p>Nous collectons diverses informations pour vous offrir un service optimal :</p>
            <ul className="list-disc list-inside space-y-1.5 pl-4">
              <li>
                <strong>Identification personnelle :</strong> Nom, prénom, adresse email, numéro de téléphone, adresse postale, et copie de pièce d'identité (uniquement si nécessaire pour une transaction ou vérification de vendeur).
              </li>
              <li>
                <strong>Informations de compte :</strong> Nom d'utilisateur, mot de passe (fortement crypté).
              </li>
              <li>
                <strong>Données de transaction :</strong> Détails des parcelles consultées/demandées, échanges de messages, documents que vous soumettez (pour achat ou vente), historique.
              </li>
              <li>
                <strong>Informations sur les biens :</strong> Détails de la propriété, documents soumis pour vérification par nos équipes.
              </li>
              <li>
                <strong>Données techniques de navigation :</strong> Adresse IP, type de navigateur, OS, pages visitées, dates/heures d'accès (via cookies et technologies similaires, voir section Cookies).
              </li>
            </ul>
          </PolicyPoint>

          <PolicyPoint icon={Database} title="2. Utilisation de Vos Informations">
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside space-y-1.5 pl-4">
              <li>Fournir, opérer, maintenir et améliorer notre Plateforme.</li>
              <li>Créer, gérer et sécuriser votre compte utilisateur.</li>
              <li>Traiter efficacement vos demandes d'information, d'achat ou de vente.</li>
              <li>Effectuer les vérifications nécessaires des biens et des documents.</li>
              <li>Faciliter la mise en relation avec nos agents ou d'autres utilisateurs (acheteurs/vendeurs) dans le cadre d'une transaction.</li>
              <li>Communiquer avec vous concernant votre compte, vos transactions et les mises à jour importantes.</li>
              <li>Personnaliser votre expérience et vous proposer du contenu pertinent.</li>
              <li>Analyser l'utilisation de la Plateforme pour optimiser nos services et fonctionnalités.</li>
              <li>Prévenir la fraude, les abus et assurer la sécurité de la Plateforme.</li>
              <li>Respecter nos obligations légales, réglementaires et contractuelles.</li>
            </ul>
          </PolicyPoint>

          <PolicyPoint icon={Users} title="3. Partage Sécurisé des Informations">
            <p>Nous ne vendons ni ne louons vos informations personnelles. Le partage est limité et sécurisé :</p>
            <ul className="list-disc list-inside space-y-1.5 pl-4">
              <li>
                <strong>Avec nos agents fonciers :</strong> Pour traiter vos demandes et vous fournir un accompagnement personnalisé.
              </li>
              <li>
                <strong>Entre utilisateurs (Acheteur/Vendeur) :</strong> Uniquement les informations nécessaires (ex: nom, contact après accord explicite) pour faciliter une transaction.
              </li>
              <li>
                <strong>Partenaires de transaction :</strong> Notaires, administrations (informations strictement nécessaires et avec votre consentement implicite lié à la transaction).
              </li>
              <li>
                <strong>Fournisseurs de services tiers :</strong> Pour l'hébergement, l'analyse, etc., sous des accords de confidentialité stricts.
              </li>
              <li>
                <strong>Obligations légales :</strong> Si requis par la loi, une procédure judiciaire, ou pour protéger nos droits et la sécurité de tous.
              </li>
            </ul>
          </PolicyPoint>

          <PolicyPoint icon={FileLock} title="4. Sécurité de Vos Données">
            <p>
              La sécurité de vos données est primordiale. Nous mettons en œuvre des mesures techniques et organisationnelles robustes (cryptage, pare-feu, contrôles d'accès, audits réguliers) pour protéger vos informations contre tout accès non autorisé, divulgation, altération ou destruction.
            </p>
            <p>
              Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est infaillible à 100%. Nous vous encourageons à utiliser des mots de passe forts et uniques, et à ne jamais les partager.
            </p>
          </PolicyPoint>

          <PolicyPoint icon={Server} title="5. Conservation des Données">
            <p>
              Nous conservons vos informations personnelles uniquement le temps nécessaire pour les finalités décrites, pour respecter nos obligations légales (ex: comptabilité, conservation des preuves), ou pour la gestion d'éventuels litiges. Les durées de conservation peuvent varier selon la nature des données et les exigences légales.
            </p>
          </PolicyPoint>

          <PolicyPoint icon={Edit3} title="6. Vos Droits et Contrôles">
            <p>
              Conformément à la loi sénégalaise n° 2008-08 sur la protection des données personnelles, vous disposez de droits d'accès, de rectification, de suppression, de limitation et d'opposition au traitement de vos données. Vous pouvez également demander la portabilité de vos données.
            </p>
            <p>
              Exercez ces droits en contactant notre Délégué à la Protection des Données (DPO) à : <a href="mailto:contact@terangafoncier.com" className="text-primary hover:underline">contact@terangafoncier.com</a> ou via votre espace personnel. Une vérification d'identité pourra être demandée.
            </p>
          </PolicyPoint>

          <PolicyPoint icon={Cookie} title="7. Politique Relative aux Cookies">
            <p>
              Nous utilisons des cookies (essentiels, de performance, de fonctionnalité, de ciblage) pour améliorer votre expérience, analyser le trafic, sécuriser la plateforme et personnaliser le contenu. Vous pouvez gérer vos préférences via notre bandeau de consentement aux cookies et les paramètres de votre navigateur. Pour plus de détails, consultez notre <Link to="/cookie-policy" className="text-primary hover:underline font-medium">Politique de Cookies</Link>.
            </p>
          </PolicyPoint>

          <PolicyPoint icon={RotateCcw} title="8. Modifications de cette Politique">
            <p>
              Cette Politique de Confidentialité peut être mise à jour. Nous vous notifierons des changements importants (par email ou notification sur la Plateforme) et indiquerons la date de dernière mise à jour en haut de cette page. Nous vous encourageons à la consulter régulièrement.
            </p>
          </PolicyPoint>

          <PolicyPoint icon={MailWarning} title="9. Nous Contacter">
            <p>
              Pour toute question, préoccupation ou demande concernant cette Politique de Confidentialité ou vos données personnelles, veuillez contacter notre Délégué à la Protection des Données (DPO) :
            </p>
            <ul className="list-none space-y-1 pl-4">
              <li>Email Principal: <a href="mailto:contact@terangafoncier.com" className="text-primary hover:underline">contact@terangafoncier.com</a></li>
              <li>Email Secondaire: <a href="mailto:palaye122@gmail.com" className="text-primary hover:underline">palaye122@gmail.com</a></li>
              <li>Adresse Postale : DPO Teranga Foncier, Dakar, Sénégal.</li>
              <li>Ou via notre <Link to="/contact" className="text-primary hover:underline font-medium">page de contact</Link>.</li>
            </ul>
          </PolicyPoint>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPage;