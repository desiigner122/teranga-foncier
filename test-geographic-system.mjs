// Test du système géographique pour le Sénégal
import { senegalGeoData, geoUtils } from './src/data/senegalGeoData.js';

console.log('🌍 Test du système géographique pour le Sénégal');
console.log('===================================================');

// Test 1: Affichage des régions
console.log('\n📍 Régions disponibles:');
const regions = geoUtils.getAllRegions();
regions.forEach((region, index) => {
  const departments = geoUtils.getDepartmentsByRegion(region.code);
  console.log(`${index + 1}. ${region.name} (${departments.length} départements)`);
});

// Test 2: Test de la région de Dakar
console.log('\n🏢 Détail de la région de Dakar:');
const dakarDepartments = geoUtils.getDepartmentsByRegion('DK');
console.log(`- Région: Dakar`);
console.log(`- Départements: ${dakarDepartments.length}`);

dakarDepartments.forEach(dept => {
  const communes = geoUtils.getCommunesByDepartment('DK', dept.code);
  console.log(`  📍 ${dept.name} (${communes.length} communes)`);
  communes.slice(0, 3).forEach(commune => { // Limiter à 3 pour la lisibilité
    console.log(`    - ${commune.name}`);
  });
  if (communes.length > 3) {
    console.log(`    ... et ${communes.length - 3} autres communes`);
  }
});

// Test 3: Recherche de communes
console.log('\n🔍 Recherche de communes contenant "Dakar":');
const dakarCommunes = geoUtils.searchCommune('Dakar');
dakarCommunes.slice(0, 5).forEach(result => { // Limiter pour la lisibilité
  console.log(`- ${result.commune} (${result.department}, ${result.region})`);
});

// Test 4: Validation d'un ensemble géographique
console.log('\n✅ Test de validation:');
const testData = {
  region: 'DK',
  department: 'DK_DA',
  commune: 'Dakar'
};

const isValid = geoUtils.validateLocation(testData.region, testData.department, testData.commune);
console.log(`Configuration "${testData.region} > ${testData.department} > ${testData.commune}": ${isValid ? '✅ Valide' : '❌ Invalide'}`);

// Test 5: Statistiques globales
console.log('\n📊 Statistiques globales:');
let totalDepartments = 0;
let totalCommunes = 0;

senegalGeoData.regions.forEach(region => {
  totalDepartments += region.departments.length;
  region.departments.forEach(dept => {
    totalCommunes += dept.communes.length;
  });
});

console.log(`- Régions: ${senegalGeoData.regions.length}`);
console.log(`- Départements: ${totalDepartments}`);
console.log(`- Communes: ${totalCommunes}`);

console.log('\n🎉 Test terminé avec succès !');
