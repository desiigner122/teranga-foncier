import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

// Patterns pour les variables non utilisées
function findUnusedVariables(content) {
  // Regex pour trouver les imports non utilisés
  const importRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"].+?['"]/g;
  let match;
  let unusedVars = [];

  while ((match = importRegex.exec(content)) !== null) {
    const importedItems = match[1].split(',').map(item => {
      // Extrait le nom réel en cas d'alias (e.g., "useState as useStateAlias")
      const parts = item.trim().split(/\s+as\s+/);
      return parts[parts.length - 1].trim();
    });

    for (const item of importedItems) {
      // Cherche l'utilisation de la variable en dehors de l'import
      const itemRegex = new RegExp(`\\b${item}\\b`, 'g');
      const allMatches = [...content.matchAll(itemRegex)];

      // Si on ne trouve qu'une occurrence (celle dans l'import), elle est non utilisée
      if (allMatches.length === 1) {
        unusedVars.push(item);
      }
    }
  }

  return unusedVars;
}

// Fonction pour supprimer les console.log
function removeConsoleLogs(content) {
  // Regex pour trouver les console.log, console.warn, console.error
  const consoleLogRegex = /^\s*console\.(log|warn|error|info)\(.+?\);?\s*\n/gm;
  return content.replace(consoleLogRegex, '');
}

// Fonction pour supprimer les variables inutilisées des imports
function removeUnusedImports(content, unusedVars) {
  if (unusedVars.length === 0) return content;

  let newContent = content;

  // Traitement des imports
  const importRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"](.+?)['"];?/g;
  let match;
  let offset = 0;

  while ((match = importRegex.exec(content)) !== null) {
    const originalImport = match[0];
    const importedItems = match[1].split(',').map(item => item.trim());
    const source = match[2];
    
    // Filtrer les items qui ne sont pas dans unusedVars
    const filteredItems = importedItems.filter(item => {
      const parts = item.split(/\s+as\s+/);
      const name = parts[0].trim();
      return !unusedVars.includes(name) && !unusedVars.includes(parts[parts.length - 1].trim());
    });
    
    if (filteredItems.length === 0) {
      // Supprimer l'import complet
      newContent = newContent.slice(0, match.index + offset) + 
                  newContent.slice(match.index + offset + originalImport.length);
      offset -= originalImport.length;
    } else if (filteredItems.length < importedItems.length) {
      // Modifier l'import pour ne garder que les variables utilisées
      const newImport = `import { ${filteredItems.join(', ')} } from '${source}';`;
      newContent = newContent.slice(0, match.index + offset) + 
                  newImport + 
                  newContent.slice(match.index + offset + originalImport.length);
      offset += newImport.length - originalImport.length;
    }
  }

  return newContent;
}

// Fonction pour traiter un fichier
function processFile(filePath) {
  try {
    // Lire le contenu du fichier
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Trouver les variables non utilisées
    const unusedVars = findUnusedVariables(content);
    
    // Supprimer les console.log
    let newContent = removeConsoleLogs(content);
    
    // Supprimer les variables non utilisées des imports
    newContent = removeUnusedImports(newContent, unusedVars);
    
    // Si le contenu a changé, écrire le nouveau contenu
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Erreur lors du traitement du fichier ${filePath}: ${error.message}`);
    return false;
  }
}

// Fonction pour parcourir récursivement les répertoires
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let fixedFiles = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      fixedFiles += processDirectory(filePath);
    } else if (/\.(jsx?|tsx?)$/.test(file)) {
      if (processFile(filePath)) {
        console.log(`Nettoyé: ${filePath}`);
        fixedFiles++;
      }
    }
  }

  return fixedFiles;
}

// Exécuter le script
console.log("Nettoyage des variables inutilisées et des console.log...");
const fixedFilesCount = processDirectory(srcDir);
console.log(`Terminé! ${fixedFilesCount} fichiers ont été nettoyés.`);
