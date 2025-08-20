// fix-accent-encoding.mjs
// Script pour corriger les problèmes d'encodage des caractères spéciaux et accents
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour remplacer les caractères mal encodés dans le code JSX
function fixCharacters(code) {
  const replacements = {
    '�': 'é',
    '�': 'è',
    '�': 'à',
    '�': 'ç',
    '�': 'ê',
    '�': 'î',
    '�': 'ô',
    '�': 'û',
    '�': 'ë',
    '�': 'ï',
    '�': 'ü',
    '�': 'â',
    '�': 'ù',
    '�': 'ÿ',
    '�': 'œ',
    '�': 'É',
    '�': 'È',
    '�': 'À',
    '�': 'Ç',
    '�': 'Ê',
    '�': 'Î',
    '�': 'Ô',
    '�': 'Û',
    '�': 'Ë',
    '�': 'Ï',
    '�': 'Ü',
    '�': 'Â',
    '�': 'Ù',
    '�': 'Œ',
    // Ajoutez d'autres remplacements au besoin
  };

  // Remplacer tous les caractères mal encodés
  let fixedCode = code;
  for (const [encoded, correct] of Object.entries(replacements)) {
    fixedCode = fixedCode.replace(new RegExp(encoded, 'g'), correct);
  }

  return fixedCode;
}

// Fonction pour corriger un fichier
const fixFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixCharacters(content);
    
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`✅ Fichier corrigé: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Erreur lors de la correction du fichier ${filePath}:`, error);
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
      if (fixFile(filePath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
};

// Point d'entrée principal
const main = () => {
  const srcDir = path.resolve(path.join(__dirname, '..', 'src'));
  console.log(`🔍 Recherche des problèmes d'encodage dans ${srcDir}...`);
  
  const fixedCount = processDirectory(srcDir);
  console.log(`🎉 Terminé! ${fixedCount} fichiers corrigés.`);
};

// Exécution du script
main();
