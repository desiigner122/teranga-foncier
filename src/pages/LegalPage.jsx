import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Landmark, Server, Copyright, AlertTriangle, Database, ShieldAlert } from 'lucide-react';

const LegalPage = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-b from-background to-gray-50 dark:from-background dark:to-gray-900/20 min-h-screen"
    >
      <div className="container mx-auto py-16 px-4 max-w-4xl">
        <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
          <FileText className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Mentions Légales</h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Informations importantes concernant l'utilisation de la plateforme Teranga Foncier.
          </p>
        </motion.div>

        <div className="space-y-10">
          <motion.section variants={itemVariants} className="p-6 bg-card border border-border/50 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center"><Landmark className="mr-3 h-6 w-6 text-primary"/>1. Informations Générales</h2>
            <div className="space-y-2 text-muted-foreground leading-relaxed">
              <p>
                Le site web Teranga Foncier (ci-après "la Plateforme") est édité par Abdoulaye Diémé, entrepreneur individuel.
              </p>
              <p>Immatriculation au Registre du Commerce et des Sociétés de Dakar : <strong className="text-foreground">SN.DKR.2024.A.00000</strong> (Numéro fictif, à compléter par l'utilisateur).</p>
              <p>Siège social : Dakar, Sénégal.</p>
              <p>Numéro NINEA : <strong className="text-foreground">000000000</strong> (Numéro fictif, à compléter par l'utilisateur).</p>
              <p>Directeur de la publication : Abdoulaye Diémé.</p>
              <p>
                Contact Principal : <a href="mailto:contact@terangafoncier.com" className="text-primary hover:underline">contact@terangafoncier.com</a>.
              </p>
              <p>
                Contact Secondaire : <a href="mailto:palaye122@gmail.com" className="text-primary hover:underline">palaye122@gmail.com</a> | <a href="tel:+221775934241" className="text-primary hover:underline">+221 77 593 42 41</a>.
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants} className="p-6 bg-card border border-border/50 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center"><Server className="mr-3 h-6 w-6 text-primary"/>2. Hébergement</h2>
            <div className="space-y-2 text-muted-foreground leading-relaxed">
              <p>
                La Plateforme est hébergée par un fournisseur de services cloud de premier plan pour garantir la disponibilité et la sécurité.
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants} className="p-6 bg-card border border-border/50 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center"><Copyright className="mr-3 h-6 w-6 text-primary"/>3. Propriété Intellectuelle</h2>
            <div className="space-y-2 text-muted-foreground leading-relaxed">
              <p>
                L'ensemble des éléments constituant la Plateforme (textes, graphismes, logiciels, photographies, images, vidéos, sons, plans, noms, logos, marques, créations et œuvres protégeables diverses, bases de données, etc.) ainsi que la Plateforme elle-même, relèvent des législations sénégalaises et internationales sur le droit d'auteur et sur les droits voisins.
              </p>
              <p>
                Ces éléments sont la propriété exclusive de Teranga Foncier / Abdoulaye Diémé, hormis les éléments réalisés par des intervenants extérieurs n'ayant pas cédé leurs droits d'auteur. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments de la Plateforme, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Teranga Foncier / Abdoulaye Diémé.
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants} className="p-6 bg-card border border-border/50 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center"><AlertTriangle className="mr-3 h-6 w-6 text-primary"/>4. Responsabilité</h2>
            <div className="space-y-2 text-muted-foreground leading-relaxed">
              <p>
                Teranga Foncier s'efforce d'assurer au mieux de ses possibilités, l'exactitude et la mise à jour des informations diffusées sur la Plateforme. Toutefois, Teranga Foncier ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à la disposition sur la Plateforme.
              </p>
              <p>
                En conséquence, Teranga Foncier décline toute responsabilité pour toute interruption de la Plateforme, survenance de bogues, pour toute inexactitude ou omission portant sur des informations disponibles sur la Plateforme, ou pour tous dommages résultant d'une intrusion frauduleuse d'un tiers.
              </p>
              <p>
                Les informations fournies concernant les parcelles (statut juridique, documents, etc.) sont basées sur les vérifications effectuées par Teranga Foncier au moment de leur publication. <strong className="text-foreground">Il incombe impérativement à l'acheteur de procéder à ses propres vérifications complémentaires</strong>, notamment auprès des autorités compétentes (Cadastre, Domaines, Mairies) et d'un notaire, avant toute transaction. Teranga Foncier agit en tant qu'intermédiaire facilitant la mise en relation et la vérification initiale, mais ne se substitue pas aux diligences légales et notariales finales qui sont de la responsabilité de l'acheteur.
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants} className="p-6 bg-card border border-border/50 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center"><Database className="mr-3 h-6 w-6 text-primary"/>5. Données Personnelles</h2>
            <div className="space-y-2 text-muted-foreground leading-relaxed">
              <p>
                La collecte et le traitement des données personnelles sont régis par notre <Link to="/privacy" className="text-primary hover:underline font-medium">Politique de Confidentialité</Link>, conformément à la loi sénégalaise n° 2008-08 du 25 janvier 2008 sur la protection des données à caractère personnel, et ses modifications ultérieures. Le responsable du traitement est Abdoulaye Diémé.
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants} className="p-6 bg-card border border-border/50 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center"><ShieldAlert className="mr-3 h-6 w-6 text-primary"/>6. Droit Applicable et Juridiction</h2>
            <div className="space-y-2 text-muted-foreground leading-relaxed">
              <p>
                Les présentes mentions légales sont régies par le droit sénégalais. En cas de litige et à défaut d'accord amiable, la compétence est attribuée aux tribunaux compétents de Dakar.
              </p>
            </div>
          </motion.section>

          <motion.p variants={itemVariants} className="text-sm text-muted-foreground pt-4 text-center">Dernière mise à jour : 18 Juin 2025</motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default LegalPage;