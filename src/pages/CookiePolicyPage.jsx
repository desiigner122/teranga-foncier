import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Cookie, Settings, ShieldCheck, Info, CheckCircle, XCircle } from 'lucide-react';

const CookiePolicyPage = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const PolicySection = ({ icon: Icon, title, children }) => (
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
          <Cookie className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Politique Relative aux Cookies</h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Comprendre comment nous utilisons les cookies pour améliorer votre expérience sur Teranga Foncier.
          </p>
          <p className="text-sm text-muted-foreground mt-2">Dernière mise à jour : 18 Juin 2025</p>
        </motion.div>

        <div className="space-y-10">
          <motion.p variants={itemVariants} className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Cette politique explique ce que sont les cookies, comment Teranga Foncier les utilise sur sa plateforme, et les choix qui s'offrent à vous.
          </motion.p>

          <PolicySection icon={Info} title="1. Qu'est-ce qu'un Cookie ?">
            <p>
              Un cookie est un petit fichier texte stocké sur votre ordinateur ou appareil mobile par votre navigateur web lorsque vous visitez certains sites web. Les cookies sont largement utilisés pour faire fonctionner les sites web, ou pour travailler plus efficacement, ainsi que pour fournir des informations aux propriétaires du site.
            </p>
            <p>
              Ils permettent aux sites web de se souvenir de vos actions et préférences (telles que la connexion, la langue, la taille de la police et d'autres préférences d'affichage) sur une période donnée, afin que vous n'ayez pas à les saisir à nouveau chaque fois que vous revenez sur le site ou naviguez d'une page à une autre.
            </p>
          </PolicySection>

          <PolicySection icon={ShieldCheck} title="2. Comment Teranga Foncier Utilise les Cookies ?">
            <p>Nous utilisons des cookies pour diverses raisons, détaillées ci-dessous :</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>Cookies Strictement Nécessaires :</strong> Ces cookies sont essentiels pour vous permettre de naviguer sur la plateforme et d'utiliser ses fonctionnalités, comme l'accès aux zones sécurisées. Sans ces cookies, les services que vous avez demandés, comme la connexion à votre compte, ne peuvent pas être fournis.
                <span className="block text-xs text-primary/80 mt-1">(Ex: cookies de session, cookies d'authentification)</span>
              </li>
              <li>
                <strong>Cookies de Performance et d'Analyse :</strong> Ces cookies collectent des informations sur la façon dont les visiteurs utilisent notre plateforme, par exemple quelles pages les visiteurs consultent le plus souvent, et s'ils reçoivent des messages d'erreur des pages web. Ces cookies ne collectent pas d'informations permettant d'identifier un visiteur. Toutes les informations collectées par ces cookies sont agrégées et donc anonymes. Ils ne sont utilisés que pour améliorer le fonctionnement de la plateforme.
                <span className="block text-xs text-primary/80 mt-1">(Ex: Google Analytics - anonymisé)</span>
              </li>
              <li>
                <strong>Cookies de Fonctionnalité :</strong> Ces cookies permettent à la plateforme de se souvenir des choix que vous faites (comme votre nom d'utilisateur, votre langue ou la région dans laquelle vous vous trouvez) et de fournir des fonctionnalités améliorées et plus personnelles. Par exemple, ils peuvent être utilisés pour mémoriser vos préférences de recherche ou les parcelles que vous avez ajoutées à vos favoris.
                <span className="block text-xs text-primary/80 mt-1">(Ex: cookies de préférences linguistiques, cookies de personnalisation)</span>
              </li>
              <li>
                <strong>Cookies de Ciblage ou Publicitaires (Utilisation Limitée) :</strong> Actuellement, Teranga Foncier n'utilise pas de cookies de ciblage ou publicitaires de tiers de manière extensive. Si cela devait changer, cette politique serait mise à jour. Nous pouvons utiliser des cookies pour mesurer l'efficacité de nos propres campagnes promotionnelles internes.
              </li>
            </ul>
          </PolicySection>

          <PolicySection icon={Settings} title="3. Vos Choix Concernant les Cookies">
            <p>Vous avez plusieurs options pour contrôler ou limiter la manière dont nous et nos partenaires utilisons les cookies :</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                <strong>Paramètres du Navigateur :</strong> La plupart des navigateurs web vous permettent de contrôler les cookies via leurs paramètres. Vous pouvez configurer votre navigateur pour qu'il vous avertisse avant d'accepter les cookies, ou vous pouvez le configurer pour qu'il les refuse purement et simplement. Veuillez noter que si vous désactivez les cookies, certaines fonctionnalités de notre plateforme pourraient ne pas fonctionner correctement.
              </li>
              <li>
                <strong>Outil de Consentement aux Cookies :</strong> Lors de votre première visite sur notre plateforme, un bandeau de consentement aux cookies apparaîtra, vous permettant d'accepter ou de personnaliser vos préférences en matière de cookies non essentiels.
              </li>
              <li>
                <strong>Cookies Tiers :</strong> Pour certains cookies tiers (comme Google Analytics), vous pouvez souvent vous désinscrire directement via les options fournies par ces tiers.
              </li>
            </ul>
            <p className="mt-3">
              Pour en savoir plus sur les cookies, y compris comment voir quels cookies ont été installés et comment les gérer et les supprimer, visitez <a href="https://www.allaboutcookies.org/fr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.allaboutcookies.org/fr/</a>.
            </p>
          </PolicySection>
          
          <PolicySection icon={CheckCircle} title="4. Cookies que Nous Utilisons (Exemples)">
             <p>Voici une liste non exhaustive des types de cookies que nous pourrions utiliser :</p>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-foreground uppercase bg-muted/50">
                        <tr>
                            <th scope="col" className="px-4 py-2">Nom du Cookie (Exemple)</th>
                            <th scope="col" className="px-4 py-2">Type</th>
                            <th scope="col" className="px-4 py-2">Finalité</th>
                            <th scope="col" className="px-4 py-2">Durée</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-border/30">
                            <td className="px-4 py-2"><code>session_id</code></td>
                            <td className="px-4 py-2">Strictement Nécessaire</td>
                            <td className="px-4 py-2">Maintien de la session utilisateur</td>
                            <td className="px-4 py-2">Session</td>
                        </tr>
                        <tr className="border-b border-border/30">
                            <td className="px-4 py-2"><code>tf_prefs</code></td>
                            <td className="px-4 py-2">Fonctionnalité</td>
                            <td className="px-4 py-2">Sauvegarde des préférences utilisateur</td>
                            <td className="px-4 py-2">1 an</td>
                        </tr>
                        <tr className="border-b border-border/30">
                            <td className="px-4 py-2"><code>_ga</code> (Google Analytics)</td>
                            <td className="px-4 py-2">Performance/Analyse</td>
                            <td className="px-4 py-2">Analyse du trafic (anonymisé)</td>
                            <td className="px-4 py-2">2 ans</td>
                        </tr>
                         <tr className="border-b border-border/30">
                            <td className="px-4 py-2"><code>cookie_consent</code></td>
                            <td className="px-4 py-2">Strictement Nécessaire</td>
                            <td className="px-4 py-2">Stocke vos préférences de consentement</td>
                            <td className="px-4 py-2">1 an</td>
                        </tr>
                    </tbody>
                </table>
             </div>
             <p className="text-xs mt-2 text-muted-foreground">Cette liste est indicative et peut évoluer.</p>
          </PolicySection>

          <PolicySection icon={XCircle} title="5. Modifications de cette Politique de Cookies">
            <p>
              Nous pouvons mettre à jour cette Politique de Cookies de temps à autre. Nous vous encourageons à consulter cette page régulièrement pour toute modification. La date de la dernière mise à jour sera indiquée en haut de cette page.
            </p>
          </PolicySection>

          <motion.div variants={itemVariants} className="text-center pt-6">
            <p className="text-muted-foreground">
              Pour toute question concernant notre utilisation des cookies, veuillez nous contacter via notre <Link to="/contact" className="text-primary hover:underline">page de contact</Link> ou consulter notre <Link to="/privacy" className="text-primary hover:underline">Politique de Confidentialité</Link> complète.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CookiePolicyPage;