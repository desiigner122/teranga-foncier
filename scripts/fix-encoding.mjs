// fix-encoding.mjs
// Script pour corriger les problèmes d'encodage dans les fichiers JSX
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mappings courants d'encodage incorrect
const fixEncodings = [
  { from: 'Œ', to: 'é' },
  { from: 'Ÿ', to: 'à' },
  { from: 'Ž', to: 'è' },
  { from: 'Š', to: 'ê' },
  { from: '‹', to: 'ù' }
];

// Fonction pour corriger l'encodage d'un fichier
const fixFileEncoding = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    for (const mapping of fixEncodings) {
      if (content.includes(mapping.from)) {
        content = content.replace(new RegExp(mapping.from, 'g'), mapping.to);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Encodage corrigé: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur lors de la correction de l'encodage du fichier ${filePath}:`, error);
    return false;
  }
};

// Fonction pour parcourir récursivement un répertoire
const processDirectory = (dir, extensions = ['.jsx', '.js']) => {
  let fixedCount = 0;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixedCount += processDirectory(filePath, extensions);
    } else if (extensions.includes(path.extname(filePath))) {
      if (fixFileEncoding(filePath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
};

// Point d'entrée principal
const main = () => {
  const srcDir = path.resolve(path.join(__dirname, '..', 'src'));
  console.log(`🔍 Correction des problèmes d'encodage dans ${srcDir}...`);
  
  const fixedCount = processDirectory(srcDir);
  console.log(`🎉 Terminé! ${fixedCount} fichiers corrigés.`);
};

// Exécution du script
main();
