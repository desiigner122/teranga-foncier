// fix-components.mjs
// Script pour corriger automatiquement les problèmes les plus courants dans les composants React
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Liste des corrections à effectuer
const fixes = [
  // Correction 1: Ajouter scrollToBottom dans les composants qui utilisent cette fonction
  {
    pattern: /(const\s+\w+Ref\s*=\s*useRef\(null\);[\s\S]+?)(?=\s*const\s+\w+\s*=|return\s*\(|export\s+default)/,
    replacement: (match, codeBeforeNextFunction) => {
      // Si scrollToBottom n'est pas défini dans le composant
      if (!match.includes('scrollToBottom')) {
        const refNameMatch = match.match(/const\s+(\w+)Ref\s*=\s*useRef\(null\);/);
        if (refNameMatch && refNameMatch[1]) {
          const refName = refNameMatch[1];
          return `${codeBeforeNextFunction}\n  // Fonction de défilement vers le bas ajoutée
  const scrollToBottom = () => {
    if (${refName}Ref.current) {
      ${refName}Ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };`;
        }
      }
      return match;
    }
  },
  
  // Correction 2: Importer les hooks manquants
  {
    pattern: /import React,\s*{\s*([^}]+)\s*}\s*from\s*'react';/,
    replacement: (match, imports) => {
      const missingHooks = [];
      
      if (match.includes('useRef') && !imports.includes('useRef')) {
        missingHooks.push('useRef');
      }
      if (match.includes('useState') && !imports.includes('useState')) {
        missingHooks.push('useState');
      }
      if (match.includes('useEffect') && !imports.includes('useEffect')) {
        missingHooks.push('useEffect');
      }
      if (match.includes('useCallback') && !imports.includes('useCallback')) {
        missingHooks.push('useCallback');
      }
      
      if (missingHooks.length > 0) {
        const newImports = imports.trim() + (imports.trim() ? ', ' : '') + missingHooks.join(', ');
        return `import React, { ${newImports} } from 'react';`;
      }
      
      return match;
    }
  },
  
  // Correction 3: Mettre à jour useEffect pour appeler scrollToBottom quand les messages changent
  {
    pattern: /(useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*,\s*\[\s*messages\s*\]\s*\);)/,
    replacement: (match) => {
      if (!match.includes('scrollToBottom')) {
        return match.replace(/(useEffect\(\s*\(\)\s*=>\s*{)/, '$1\n    scrollToBottom();');
      }
      return match;
    }
  },
  
  // Correction 4: Référence manquante pour les éléments à faire défiler
  {
    pattern: /<div(\s+className=['"][^'"]*['"])?\s*>\s*<\/div>\s*{\/\* Fin des messages \*\/}/,
    replacement: `<div$1 ref={messagesEndRef}></div>\n            {/* Fin des messages */}`
  },
  
  // Correction 5: Correction pour l'absence de initialSuggestions
  {
    pattern: /const\s+\[\s*currentSuggestions\s*,\s*setCurrentSuggestions\s*\]\s*=\s*useState\(\s*\[\s*\]\s*\);/,
    replacement: `const [initialSuggestions] = useState([
    "Comment obtenir un titre foncier ?",
    "Comment vérifier l'authenticité d'un titre ?",
    "Quelles sont les étapes pour acheter un terrain ?"
  ]);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);`
  },
  
  // Correction 6: Ajouter l'initialisation des messages pour éviter messages.map undefined
  {
    pattern: /const\s+\[\s*messages\s*,\s*setMessages\s*\]\s*=\s*useState\(\s*\);/,
    replacement: `const [messages, setMessages] = useState([]);`
  },
  
  // Correction 7: Ajouter les dépendances manquantes dans useEffect
  {
    pattern: /(useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*,\s*\[\s*\]\s*\);)/g,
    replacement: (match) => {
      // Analyse du contenu de useEffect pour détecter les variables utilisées
      const effectBody = match.match(/useEffect\(\s*\(\)\s*=>\s*{([\s\S]*?)}\s*,\s*\[\s*\]\s*\);/)[1];
      
      // Liste des variables potentielles à surveiller
      const potentialDeps = ['messages', 'isOpen', 'inputValue', 'loading', 'data', 'error'];
      const detectedDeps = [];
      
      potentialDeps.forEach(dep => {
        if (new RegExp(`\\b${dep}\\b`).test(effectBody)) {
          detectedDeps.push(dep);
        }
      });
      
      if (detectedDeps.length > 0) {
        return match.replace(/\[\s*\]/, `[${detectedDeps.join(', ')}]`);
      }
      
      return match;
    }
  }
];

// Fonction pour appliquer les corrections à un fichier
const fixComponentFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    for (const fix of fixes) {
      const oldContent = content;
      content = content.replace(fix.pattern, fix.replacement);
      
      if (oldContent !== content) {
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
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
const processDirectory = (dir, extensions = ['.jsx']) => {
  let fixedCount = 0;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixedCount += processDirectory(filePath, extensions);
    } else if (extensions.includes(path.extname(filePath))) {
      if (fixComponentFile(filePath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
};

// Point d'entrée principal
const main = () => {
  const srcDir = path.resolve(path.join(__dirname, '..', 'src'));
  console.log(`🔍 Correction des composants React dans ${srcDir}...`);
  
  const fixedCount = processDirectory(srcDir);
  console.log(`🎉 Terminé! ${fixedCount} composants corrigés.`);
};

// Exécution du script
main();
