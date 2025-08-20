// src/fix-accent-encoding.js
// Script pour corriger les problèmes d'encodage des caractères spéciaux et accents

// Fonction pour remplacer les caractères mal encodés dans le code JSX
function fixCharacters(code) {
  const replacements = {
    'é': 'é',
    'é': 'è',
    'é': 'à',
    'é': 'ç',
    'é': 'ê',
    'é': 'î',
    'é': 'ô',
    'é': 'û',
    'é': 'ë',
    'é': 'ï',
    'é': 'ü',
    'é': 'â',
    'é': 'ù',
    'é': 'ÿ',
    'é': 'œ',
    'é': 'É',
    'é': 'È',
    'é': 'À',
    'é': 'Ç',
    'é': 'Ê',
    'é': 'Î',
    'é': 'Ô',
    'é': 'Û',
    'é': 'Ë',
    'é': 'Ï',
    'é': 'Ü',
    'é': 'Â',
    'é': 'Ù',
    'é': 'é',
    // Ajoutez d'autres remplacements au besoin
  };

  // Remplacer tous les caractères mal encodés
  let fixedCode = code;
  for (const [encoded, correct] of Object.entries(replacements)) {
    fixedCode = fixedCode.replace(new RegExp(encoded, 'g'), correct);
  }

  return fixedCode;
}

// Export de la fonction pour utilisation dans d'autres fichiers
export { fixCharacters };

// Si exécuté directement en Node.js
if (typeof window === 'undefined') {
  const fs = require('fs');
  const path = require('path');

  // Fonction pour corriger un fichier
  const fixFile = (filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fixed = fixCharacters(content);
      
      if (content !== fixed) {
        fs.writeFileSync(filePath, fixed, 'utf8');        return true;
      }
      return false;
    } catch (error) {      return false;
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
    const srcDir = path.resolve(__dirname, 'src');    const fixedCount = processDirectory(srcDir);  };

  // Exécution du script
  main();
}
