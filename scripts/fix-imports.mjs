import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

// Fonction pour corriger les imports dupliqués
function fixDuplicateImports(content) {
  // Récupérer tous les imports
  const importRegex = /import\s+(?:{[^}]*}|\w+)\s+from\s+['"][^'"]+['"];?\s*/g;
  const imports = [...content.matchAll(importRegex)].map(match => ({
    text: match[0],
    start: match.index,
    end: match.index + match[0].length
  }));
  
  // Trouver les noms de symboles importés
  const symbolsRegex = /import\s+{([^}]*)}\s+from\s+['"]([^'"]+)['"];?\s*/g;
  const importedSymbols = new Map(); // Map des chemins d'import aux ensembles de symboles
  
  let match;
  while ((match = symbolsRegex.exec(content)) !== null) {
    const symbols = match[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim());
    const source = match[2];
    
    if (!importedSymbols.has(source)) {
      importedSymbols.set(source, new Set());
    }
    
    for (const symbol of symbols) {
      importedSymbols.get(source).add(symbol);
    }
  }
  
  // Trouver les imports de modules entiers
  const moduleImportRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?\s*/g;
  const importedModules = new Map();
  
  while ((match = moduleImportRegex.exec(content)) !== null) {
    const moduleName = match[1];
    const source = match[2];
    
    if (!importedModules.has(source)) {
      importedModules.set(source, new Set());
    }
    
    importedModules.get(source).add(moduleName);
  }
  
  // Trouver les imports en double pour les remplacer
  const uniqueImports = new Map(); // Map des chemins d'import aux ensembles de symboles uniques
  const importsBySource = new Map(); // Map des chemins d'import aux imports correspondants
  
  for (const importInfo of imports) {
    const symbolMatch = /import\s+{([^}]*)}\s+from\s+['"]([^'"]+)['"];?\s*/.exec(importInfo.text);
    
    if (symbolMatch) {
      const symbols = symbolMatch[1].split(',').map(s => s.trim());
      const source = symbolMatch[2];
      
      if (!uniqueImports.has(source)) {
        uniqueImports.set(source, new Set());
      }
      
      if (!importsBySource.has(source)) {
        importsBySource.set(source, []);
      }
      
      importsBySource.get(source).push(importInfo);
      
      for (const symbol of symbols) {
        uniqueImports.get(source).add(symbol);
      }
    }
    
    const moduleMatch = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?\s*/.exec(importInfo.text);
    
    if (moduleMatch) {
      const moduleName = moduleMatch[1];
      const source = moduleMatch[2];
      
      if (!uniqueImports.has(source)) {
        uniqueImports.set(source, new Set());
      }
      
      if (!importsBySource.has(source)) {
        importsBySource.set(source, []);
      }
      
      importsBySource.get(source).push(importInfo);
      uniqueImports.get(source).add(moduleName);
    }
  }
  
  // Construire le nouveau contenu
  let newContent = content;
  let offset = 0;
  
  for (const [source, imports] of importsBySource.entries()) {
    if (imports.length > 1) {
      // Plusieurs imports du même module, on les remplace par un seul
      const uniqueSymbols = [...uniqueImports.get(source)];
      
      // Vérifier s'il s'agit d'un import de symboles ou de module entier
      const isSymbolImport = imports[0].text.includes('{');
      
      let newImport;
      if (isSymbolImport) {
        newImport = `import { ${uniqueSymbols.join(', ')} } from '${source}';\n`;
      } else {
        newImport = `import ${uniqueSymbols[0]} from '${source}';\n`;
      }
      
      // Remplacer le premier import par le nouvel import
      newContent = newContent.slice(0, imports[0].start + offset) + newImport + newContent.slice(imports[0].end + offset);
      offset += newImport.length - (imports[0].end - imports[0].start);
      
      // Supprimer les autres imports
      for (let i = 1; i < imports.length; i++) {
        newContent = newContent.slice(0, imports[i].start + offset) + newContent.slice(imports[i].end + offset);
        offset -= (imports[i].end - imports[i].start);
      }
    }
  }
  
  return newContent;
}

// Fonction pour traiter un fichier
function processFile(filePath) {
  try {
    // Lire le contenu du fichier
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Corriger les imports dupliqués
    const newContent = fixDuplicateImports(content);
    
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
        console.log(`Imports corrigés: ${filePath}`);
        fixedFiles++;
      }
    }
  }

  return fixedFiles;
}

// Exécuter le script
console.log("Correction des imports dupliqués...");
const fixedFilesCount = processDirectory(srcDir);
console.log(`Terminé! ${fixedFilesCount} fichiers ont été corrigés.`);
