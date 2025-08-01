import { addDays, subDays, formatISO } from 'date-fns';

const now = new Date();

const senegalDepartments = [
    "Dakar", "Guédiawaye", "Pikine", "Rufisque", "Bambey", "Diourbel", "Mbacké",
    "Fatick", "Foundiougne", "Gossas", "Birkilane", "Kaffrine", "Koungheul",
    "Malem Hodar", "Guinguinéo", "Kaolack", "Nioro du Rip", "Kédougou",
    "Salémata", "Saraya", "Kolda", "Médina Yoro Foulah", "Vélingara",
    "Kébémer", "Linguère", "Louga", "Kanel", "Matam", "Ranérou Ferlo",
    "Saint-Louis", "Dagana", "Podor", "Sédhiou", "Bounkiling", "Goudomp",
    "Tambacounda", "Bakel", "Goudiry", "Koumpentoum", "Mbour", "Thiès",
    "Tivaouane", "Bignona", "Oussouye", "Ziguinchor"
];

const parcelTypes = ['Résidentiel', 'Commercial', 'Agricole', 'Industriel', 'Mixte', 'Touristique'];
const ownerTypes = ['Particulier', 'Mairie', 'Promoteur', 'Investisseur', 'Bailleur', 'Agriculteur'];
const statuses = ['Disponible', 'Réservée', 'Vendue'];
const docStatuses = ['Vérifié', 'Partiellement Vérifié', 'En attente', 'Info Manquante'];

const generateParcels = () => {
    const parcels = [];
    let idCounter = 1;

    senegalDepartments.forEach(dept => {
        for (let i = 0; i < 10; i++) {
            const type = parcelTypes[Math.floor(Math.random() * parcelTypes.length)];
            const area = Math.floor(Math.random() * (type === 'Agricole' ? 48000 : 4850) + (type === 'Agricole' ? 2000 : 150));
            const price = area * (Math.floor(Math.random() * 150000) + 5000);
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const docStatus = docStatuses[Math.floor(Math.random() * docStatuses.length)];
            const ownerType = ownerTypes[Math.floor(Math.random() * ownerTypes.length)];
            const dateAdded = subDays(now, Math.floor(Math.random() * 365));

            parcels.push({
                id: `${dept.substring(0, 3).toUpperCase()}-${type.substring(0, 3).toUpperCase()}-${String(idCounter).padStart(3, '0')}`,
                reference: `REF-${dept.substring(0, 3).toUpperCase()}-${String(idCounter).padStart(4, '0')}`,
                name: `Terrain ${type} ${dept} #${i + 1}`,
                location_name: `${dept}, Sénégal`,
                description: `Belle parcelle de ${area}m² dans la zone de ${dept}. Idéal pour projet ${type.toLowerCase()}.`,
                price: price,
                area_sqm: area,
                area: area,
                status: status,
                documents: [
                    { name: "Titre Foncier (simulé)", status: docStatus === 'Vérifié' ? 'Vérifié' : 'En attente' },
                    { name: "Plan de situation (simulé)", status: "Disponible" }
                ],
                images: [],
                coordinates: { lat: 14.7167 + (Math.random() - 0.5), lng: -17.4677 + (Math.random() - 0.5) },
                zone: dept,
                type: type,
                is_featured: Math.random() < 0.1,
                verified: docStatus === 'Vérifié',
                documentStatus: docStatus,
                titreFoncier: `TF ${Math.floor(Math.random() * 90000) + 10000}/${dept.substring(0, 2).toUpperCase()}`,
                dateAdded: formatISO(dateAdded),
                created_at: formatISO(dateAdded),
                updated_at: formatISO(addDays(dateAdded, Math.floor(Math.random() * 30))),
                ownerType: ownerType,
                potential: `Fort potentiel de développement pour un projet ${type.toLowerCase()}.`
            });
            idCounter++;
        }
    });
    return parcels;
};

export const sampleParcels = generateParcels();
