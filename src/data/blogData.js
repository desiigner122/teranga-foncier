import { subDays, formatISO } from 'date-fns';

const now = new Date();

export const sampleBlogPosts = [
  {
    id: 'post1',
    title: '5 Conseils pour Acheter un Terrain au Sénégal depuis l\'Étranger',
    slug: 'conseils-achat-terrain-diaspora',
    category: "Guide d'Achat",
    excerpt: 'Acheter un terrain au Sénégal depuis la diaspora demande de la préparation. Découvrez nos 5 conseils clés pour sécuriser votre investissement foncier.',
    content: `
L'achat d'un terrain au Sénégal, surtout lorsqu'on réside à l'étranger, peut sembler complexe. Cependant, avec une bonne préparation et les bonnes informations, il est tout à fait possible de réaliser cet investissement en toute sérénité. Voici nos 5 conseils essentiels :

**1. Vérification Approfondie des Documents Fonciers :**
Avant tout engagement, la vérification des documents est primordiale. Assurez-vous de l'authenticité du Titre Foncier, du Bail ou de la Délibération. Faites appel à un notaire ou un expert foncier sur place pour une analyse rigoureuse. Teranga Foncier vous propose des services de vérification documentaire pour vous garantir une transaction transparente.

**2. Mandater une Personne de Confiance ou un Professionnel :**
Si vous ne pouvez pas être sur place, mandatez une personne de confiance (famille, ami) ou, idéalement, un professionnel de l'immobilier ou un avocat spécialisé. Définissez clairement les limites de son mandat.

**3. Comprendre le Processus d'Achat et les Frais Associés :**
Renseignez-vous sur les étapes du processus d'achat au Sénégal (promesse de vente, acte de vente, enregistrement) et les frais annexes (frais de notaire, droits d'enregistrement, impôts fonciers). Cela vous évitera les mauvaises surprises.

**4. Visite Physique du Terrain (si possible ou par mandataire) :**
Une visite physique est cruciale pour vérifier l'emplacement exact, l'accessibilité, la viabilisation (eau, électricité), et l'environnement du terrain. Si vous ne pouvez vous déplacer, votre mandataire doit effectuer cette visite et vous fournir un rapport détaillé avec photos et vidéos.

**5. Utiliser des Canaux de Paiement Sécurisés :**
Privilégiez les virements bancaires internationaux ou les services de transfert d'argent reconnus. Évitez les paiements en espèces importants sans traçabilité. Un notaire peut également servir d'intermédiaire sécurisé pour les transactions financières.

Chez Teranga Foncier, nous comprenons les défis de la diaspora et nous nous engageons à vous fournir l'accompagnement et les outils nécessaires pour un investissement foncier réussi et sécurisé au Sénégal. N'hésitez pas à nous contacter pour discuter de votre projet.
    `,
    imageUrlPlaceholder: 'blog/conseils-diaspora.jpg',
    author_name: 'Abdoulaye Diémé',
    published_at: formatISO(subDays(now, 3)),
    tags: ["Achat Terrain", "Sécurité Foncière", "Diaspora"]
  },
  {
    id: 'post2',
    title: 'Titre Foncier vs Bail vs Délibération : Comprendre les Différences',
    slug: 'titre-foncier-bail-deliberation-senegal',
    category: "Juridique",
    excerpt: 'Le statut juridique d\'un terrain est crucial. Apprenez à distinguer Titre Foncier, Bail et Délibération pour faire un choix éclairé.',
    content: `
Naviguer dans le système foncier sénégalais nécessite de bien comprendre les différents types de titres de propriété. Les trois principaux que vous rencontrerez sont le Titre Foncier, le Bail et la Délibération.

**Le Titre Foncier (TF) :**
C'est le document qui confère le droit de propriété le plus absolu et le plus sécurisé sur un terrain. Il est définitif, inattaquable et enregistré au livre foncier tenu par la Conservation de la Propriété Foncière. Obtenir un TF est souvent le Graal pour tout investisseur car il garantit une sécurité juridique maximale. Le processus pour l'obtenir peut être long et coûteux mais en vaut la peine.

**Le Bail Emphytéotique ou Ordinaire :**
Le bail est un contrat par lequel l'État (ou une collectivité locale) concède la jouissance d'un terrain du domaine national pour une longue durée (généralement entre 18 et 99 ans), moyennant une redevance. Le détenteur d'un bail (le preneur) a des droits réels sur le terrain (construire, hypothéquer) mais n'en est pas propriétaire au sens plein du TF. À la fin du bail, le terrain revient en principe à l'État. Il est possible, sous conditions, de transformer un bail en Titre Foncier.

**La Délibération (ou Acte Administratif Affectant un Terrain) :**
Souvent délivrée par les communes ou les communautés rurales, la délibération est un acte administratif qui attribue un droit d'occupation ou d'usage sur une parcelle du domaine national. Ce n'est pas un titre de propriété en soi, mais plutôt une étape préliminaire qui peut, potentiellement et après plusieurs démarches (dont l'immatriculation), mener à l'obtention d'un bail puis d'un Titre Foncier. Les terrains sous délibération sont généralement moins chers mais présentent un niveau de sécurité juridique inférieur tant que le processus d'immatriculation n'est pas complété.

**Quel Titre Choisir ?**
*   **Pour une sécurité maximale et un investissement à long terme :** Visez un terrain avec Titre Foncier.
*   **Pour des projets spécifiques ou des terrains du domaine national :** Le Bail peut être une option viable, surtout si une transformation en TF est envisageable.
*   **Pour des acquisitions plus abordables mais nécessitant une régularisation :** La Délibération peut être un point de départ, mais soyez conscient des démarches supplémentaires et des risques si la procédure n'aboutit pas.

Il est crucial de se faire accompagner par des professionnels (notaires, avocats spécialisés en droit foncier, experts de Teranga Foncier) pour vérifier la validité et la nature exacte du titre avant toute transaction.
    `,
    imageUrlPlaceholder: 'blog/documents-juridiques.jpg',
    author_name: 'Expert Foncier',
    published_at: formatISO(subDays(now, 10)),
    tags: ["Titre Foncier", "Droit Foncier", "Cadastre"]
  },
  {
    id: 'post3',
    title: 'Les Zones d\'Avenir pour l\'Investissement Foncier à Dakar et Environs',
    slug: 'zones-avenir-investissement-dakar',
    category: "Marché Immobilier",
    excerpt: 'Où investir au Sénégal ? Tour d\'horizon des zones prometteuses autour de Dakar pour un investissement foncier rentable et stratégique.',
    content: `
Dakar et sa périphérie connaissent une expansion rapide, offrant de nombreuses opportunités d'investissement foncier. Voici quelques zones clés à surveiller :

**1. Diamniadio et le Pôle Urbain :**
Incontestablement la zone d'avenir la plus médiatisée. Avec ses infrastructures modernes (autoroute, TER, cité ministérielle, universités, parcs industriels), Diamniadio attire les investissements résidentiels, commerciaux et industriels. Les prix y ont augmenté mais le potentiel de valorisation reste important.

**2. Lac Rose et la Zone Nord :**
Cette zone bénéficie de sa proximité avec Dakar et de l'extension de l'urbanisation. Le potentiel touristique autour du Lac Rose est un atout, tout comme les projets de développement routier. Idéal pour des projets résidentiels et touristiques.

**3. La Petite Côte (Saly, Somone, Ngaparou, Popenguine) :**
Destination touristique établie, la Petite Côte continue d'attirer les investisseurs pour des résidences secondaires, des hôtels, et des commerces. La demande locative y est forte. Attention cependant à la pression foncière et à la réglementation côtière.

**4. Thiès et sa Région :**
Positionnée comme un carrefour stratégique, Thiès bénéficie de sa proximité avec Dakar, de l'aéroport AIBD et de Diamniadio. La ville se développe et offre des opportunités pour des projets résidentiels, commerciaux et logistiques à des prix encore plus abordables que Dakar.

**5. Les Alentours de l'Aéroport International Blaise Diagne (AIBD) :**
La zone autour de l'AIBD est en plein essor. Des projets logistiques, hôteliers, et résidentiels y voient le jour. C'est une zone stratégique pour les investisseurs visionnaires.

**Critères à Considérer avant d'Investir :**
*   **Accessibilité et Infrastructures :** Routes, eau, électricité, proximité des services.
*   **Statut Juridique des Terrains :** Privilégiez les Titres Fonciers ou les Baux en cours de transformation.
*   **Plans d'Urbanisme :** Renseignez-vous sur les plans directeurs d'urbanisme pour anticiper le développement futur de la zone.
*   **Potentiel de Valorisation :** Évaluez la demande locative, le potentiel de plus-value à long terme.

Teranga Foncier vous accompagne dans l'identification des meilleures opportunités en fonction de votre profil d'investisseur et de vos objectifs.
    `,
    imageUrlPlaceholder: 'blog/zones-investissement.jpg',
    author_name: 'Analyste Immobilier',
    published_at: formatISO(subDays(now, 30)),
    tags: ["Investissement", "Urbanisme", "Dakar"]
  },
  {
    id: 'post4',
    title: 'Financer son Projet Agricole au Sénégal : Quelles Options ?',
    slug: 'financement-projet-agricole-senegal',
    category: "Agriculture",
    excerpt: 'Du micro-crédit aux subventions étatiques, explorez les pistes pour financer l\'acquisition de votre terrain agricole et le lancement de votre exploitation.',
    content: `
Lancer un projet agricole au Sénégal est une aventure prometteuse, mais le financement peut être un défi. Voici un aperçu des options disponibles :

**1. Autofinancement et Épargne Personnelle :**
C'est souvent le point de départ pour de nombreux entrepreneurs agricoles. L'avantage est l'absence de dettes, mais cela peut limiter l'envergure initiale du projet.

**2. Prêts Bancaires Spécifiques à l'Agriculture :**
Plusieurs banques au Sénégal proposent des produits de financement adaptés au secteur agricole. Ces prêts peuvent couvrir l'achat de terrain, de matériel, d'intrants, etc. Il est important de préparer un business plan solide pour convaincre les institutions financières. Renseignez-vous auprès de la BNDE (Banque Nationale de Développement Économique) ou d'autres banques commerciales ayant un guichet agricole.

**3. Institutions de Microfinance (IMF) :**
Les IMF sont souvent plus accessibles pour les petits exploitants ou les projets de moindre envergure. Elles proposent des micro-crédits avec des conditions parfois plus souples que les banques traditionnelles.

**4. Subventions et Programmes Gouvernementaux :**
L'État sénégalais, à travers divers ministères et agences (comme la DER/FJ, le PRACAS), met en place des programmes de subventions et d'accompagnement pour le secteur agricole. Restez informé des appels à projets et des critères d'éligibilité.

**5. Capital-Investissement et Investisseurs Privés :**
Pour des projets plus ambitieux, rechercher des investisseurs privés ou des fonds de capital-investissement spécialisés dans l'agribusiness peut être une option. Cela implique souvent de céder une partie des parts de l'entreprise.

**6. Crowdfunding Agricole :**
Des plateformes de financement participatif dédiées à l'agriculture émergent. C'est une manière de lever des fonds auprès d'un large public intéressé par le soutien à l'agriculture locale.

**Conseils pour Maximiser vos Chances de Financement :**
*   **Élaborez un Business Plan Détaillé :** Présentez clairement votre projet, vos objectifs, vos prévisions financières, et votre stratégie.
*   **Sécurisez le Foncier :** Avoir un titre de propriété clair (TF, Bail) est un atout majeur pour rassurer les financeurs. Teranga Foncier peut vous aider à trouver des terrains avec un statut juridique sécurisé.
*   **Formez-vous et Entourez-vous :** Démontrez votre expertise ou votre capacité à vous entourer de compétences techniques.
*   **Commencez Petit et Prouvez le Concept :** Un projet pilote réussi peut faciliter l'obtention de financements plus importants.

N'hésitez pas à consulter les experts de Teranga Foncier qui peuvent vous orienter vers les solutions de financement les plus adaptées à votre projet agricole.
    `,
    imageUrlPlaceholder: 'blog/financement-agricole.jpg',
    author_name: 'Expert Agricole',
    published_at: formatISO(subDays(now, 45)),
    tags: ["Agriculture", "Financement", "Projet Agricole"]
  },
  {
    id: 'post5',
    title: 'L\'impact des Nouvelles Infrastructures sur la Valeur Foncière',
    slug: 'impact-infrastructures-valeur-fonciere',
    category: "Marché Immobilier",
    excerpt: 'Autoroutes, TER, pôles urbains... Comment les grands projets d\'infrastructure transforment-ils le paysage foncier et créent-ils de nouvelles opportunités ?',
    content: `
Le développement d'infrastructures est un moteur clé de la valorisation foncière. Au Sénégal, les récents et futurs grands projets ont un impact significatif sur le marché immobilier.

**1. Les Autoroutes et Routes Modernisées :**
L'extension du réseau autoroutier (Dakar-Diamniadio-AIBD, Thiès-Touba, etc.) a désenclavé de nombreuses zones, réduisant les temps de trajet et rendant des localités auparavant éloignées plus attractives. Les terrains situés à proximité des échangeurs autoroutiers ou le long de ces axes voient généralement leur valeur augmenter.

**2. Le Train Express Régional (TER) :**
Le TER a transformé la mobilité dans la région de Dakar. Les zones desservies par les gares du TER (Rufisque, Bargny, Diamniadio) connaissent une forte demande pour des projets résidentiels et commerciaux. La proximité d'une gare TER est devenue un critère de valorisation important.

**3. Les Pôles Urbains et Zones Économiques Spéciales :**
La création de pôles urbains comme Diamniadio ou de Zones Économiques Spéciales (ZES) concentre les investissements, les emplois et les services. Cela stimule la demande de logements, de bureaux et de commerces aux alentours, et donc la valeur des terrains.

**4. L'Aéroport International Blaise Diagne (AIBD) :**
L'aéroport a ouvert toute la zone de Diass, Ndayane, et Kirène à de nouvelles opportunités. Des projets logistiques, hôteliers, industriels et résidentiels se développent pour répondre aux besoins liés à cette plateforme aéroportuaire majeure.

**Comment Anticiper et Bénéficier de ces Évolutions ?**
*   **Suivre les Annonces Officielles :** Restez informé des plans de développement d'infrastructures du gouvernement.
*   **Analyser les Plans Directeurs d'Urbanisme (PDU) :** Ces documents donnent des indications sur l'aménagement futur des territoires.
*   **Investir en Amont (avec Prudence) :** Acheter des terrains dans des zones identifiées pour de futurs projets d'infrastructure peut offrir un fort potentiel de plus-value. Cependant, cela comporte aussi des risques si les projets sont retardés ou modifiés.
*   **Considérer l'Impact à Long Terme :** Ne vous focalisez pas uniquement sur l'effet d'annonce. Évaluez comment l'infrastructure améliorera durablement l'attractivité et la fonctionnalité de la zone.

Chez Teranga Foncier, nous intégrons l'analyse des projets d'infrastructure dans notre évaluation des opportunités foncières pour vous aider à faire des investissements éclairés et porteurs de valeur.
    `,
    imageUrlPlaceholder: 'blog/infrastructures-senegal.jpg',
    author_name: 'Urbaniste Consultant',
    published_at: formatISO(subDays(now, 60)),
    tags: ["Urbanisme", "Valeur Foncière", "Infrastructure"]
  },
];