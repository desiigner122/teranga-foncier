#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtention du chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.join(__dirname, 'src');
const PAGES_DIR = path.join(__dirname, 'src', 'pages');
const COMPONENTS_DIR = path.join(__dirname, 'src', 'components');
const EXTENSIONS = ['.jsx', '.js', '.tsx', '.ts'];

// Statistiques
let totalFiles = 0;
let fixedFiles = 0;

// Patterns de corrections
const patterns = [
  // Détection d'imports React dupliqués
  {
    name: 'React Hooks dupliqués',
    regex: /import\s+React,\s*{[^}]*}\s+from\s+['"]react['"][^;]*;.*?import\s+{\s*([^}]*)\s*}\s+from\s+['"]react['"][^;]*;/gs,
    fix: (content, matches) => {
      // Cette fonction prend le contenu et les correspondances trouvées
      // et combine les imports pour éviter les duplications
      let modified = content;
      
      for (const match of matches) {
        const fullMatch = match[0];
        const duplicatedImports = match[1];
        
        // Extraire tous les hooks de l'import original
        const originalImportMatch = /import\s+React,\s*{([^}]*)}\s+from\s+['"]react['"][^;]*;/g.exec(fullMatch);
        if (!originalImportMatch) continue;
        
        const originalImports = originalImportMatch[1];
        
        // Créer un ensemble d'imports uniques
        const uniqueImports = new Set([
          ...originalImports.split(',').map(i => i.trim()),
          ...duplicatedImports.split(',').map(i => i.trim())
        ].filter(Boolean));
        
        // Créer le nouvel import
        const newImport = `import React, { ${Array.from(uniqueImports).join(', ')} } from 'react';`;
        
        // Remplacer dans le contenu
        modified = modified.replace(fullMatch, newImport);
      }
      
      return modified;
    }
  },
  // Détection d'imports useState, useEffect, etc. dupliqués
  {
    name: 'Hooks React dupliqués (sans React)',
    regex: /import\s+{[^}]*?(useState|useEffect|useRef|useMemo|useCallback|useContext)[^}]*?}\s+from\s+['"]react['"][^;]*;.*?import\s+{\s*([^}]*?(useState|useEffect|useRef|useMemo|useCallback|useContext)[^}]*?)\s*}\s+from\s+['"]react['"][^;]*;/gs,
    fix: (content, matches) => {
      let modified = content;
      
      for (const match of matches) {
        const fullMatch = match[0];
        const duplicatedImports = match[2];
        
        // Extraire tous les hooks de l'import original
        const originalImportMatch = /import\s+{([^}]*)}\s+from\s+['"]react['"][^;]*;/g.exec(fullMatch);
        if (!originalImportMatch) continue;
        
        const originalImports = originalImportMatch[1];
        
        // Créer un ensemble d'imports uniques
        const uniqueImports = new Set([
          ...originalImports.split(',').map(i => i.trim()),
          ...duplicatedImports.split(',').map(i => i.trim())
        ].filter(Boolean));
        
        // Créer le nouvel import
        const newImport = `import { ${Array.from(uniqueImports).join(', ')} } from 'react';`;
        
        // Remplacer dans le contenu
        modified = modified.replace(fullMatch, newImport);
      }
      
      return modified;
    }
  },
  // Import useEffect dupliqué simple
  {
    name: 'useEffect dupliqué simple',
    regex: /import\s+{[^}]*useEffect[^}]*}\s+from\s+['"]react['"][^;]*;.*?import\s+{\s*useEffect\s*}\s+from\s+['"]react['"][^;]*;/gs,
    fix: (content, matches) => {
      return content.replace(/import\s+{\s*useEffect\s*}\s+from\s+['"]react['"][^;]*;/g, '');
    }
  },
  // Import useState dupliqué simple
  {
    name: 'useState dupliqué simple',
    regex: /import\s+{[^}]*useState[^}]*}\s+from\s+['"]react['"][^;]*;.*?import\s+{\s*useState\s*}\s+from\s+['"]react['"][^;]*;/gs,
    fix: (content, matches) => {
      return content.replace(/import\s+{\s*useState\s*}\s+from\s+['"]react['"][^;]*;/g, '');
    }
  },
  // Import useMemo dupliqué simple
  {
    name: 'useMemo dupliqué simple',
    regex: /import\s+{[^}]*useMemo[^}]*}\s+from\s+['"]react['"][^;]*;.*?import\s+{\s*useMemo\s*}\s+from\s+['"]react['"][^;]*;/gs,
    fix: (content, matches) => {
      return content.replace(/import\s+{\s*useMemo\s*}\s+from\s+['"]react['"][^;]*;/g, '');
    }
  },
  // Import useRef dupliqué simple
  {
    name: 'useRef dupliqué simple',
    regex: /import\s+{[^}]*useRef[^}]*}\s+from\s+['"]react['"][^;]*;.*?import\s+{\s*useRef\s*}\s+from\s+['"]react['"][^;]*;/gs,
    fix: (content, matches) => {
      return content.replace(/import\s+{\s*useRef\s*}\s+from\s+['"]react['"][^;]*;/g, '');
    }
  },
  // Import useCallback dupliqué simple
  {
    name: 'useCallback dupliqué simple',
    regex: /import\s+{[^}]*useCallback[^}]*}\s+from\s+['"]react['"][^;]*;.*?import\s+{\s*useCallback\s*}\s+from\s+['"]react['"][^;]*;/gs,
    fix: (content, matches) => {
      return content.replace(/import\s+{\s*useCallback\s*}\s+from\s+['"]react['"][^;]*;/g, '');
    }
  },
  // Import useContext dupliqué simple
  {
    name: 'useContext dupliqué simple',
    regex: /import\s+{[^}]*useContext[^}]*}\s+from\s+['"]react['"][^;]*;.*?import\s+{\s*useContext\s*}\s+from\s+['"]react['"][^;]*;/gs,
    fix: (content, matches) => {
      return content.replace(/import\s+{\s*useContext\s*}\s+from\s+['"]react['"][^;]*;/g, '');
    }
  },
  // Imports multiples de hooks React
  {
    name: 'Imports multiples hooks',
    regex: /import\s+{\s*useEffect,\s*useState(?:[^}]*)\s*}\s+from\s+['"]react['"][^;]*;.*?import\s+{\s*useEffect,\s*useState(?:[^}]*)\s*}\s+from\s+['"]react['"][^;]*;/gs,
    fix: (content, matches) => {
      return content.replace(/import\s+{\s*useEffect,\s*useState(?:[^}]*)\s*}\s+from\s+['"]react['"][^;]*;/g, '');
    }
  },
  // Import avec combinaison spécifique
  {
    name: 'Imports multiples hooks avec useMemo',
    regex: /import\s+{\s*useEffect,\s*useMemo,\s*useState\s*}\s+from\s+['"]react['"][^;]*;.*?import\s+{\s*useEffect,\s*useMemo,\s*useState\s*}\s+from\s+['"]react['"][^;]*;/gs,
    fix: (content, matches) => {
      return content.replace(/import\s+{\s*useEffect,\s*useMemo,\s*useState\s*}\s+from\s+['"]react['"][^;]*;/g, '');
    }
  },
  // Imports dupliqués pour supabaseClient
  {
    name: 'Imports dupliqués supabaseClient',
    regex: /import\s+{\s*supabase(?:[^}]*)\s*}\s+from\s+['"]@\/lib\/supabaseClient['"][^;]*;.*?import\s+{\s*supabase(?:[^}]*)\s*}\s+from\s+['"][^"']*\/lib\/supabaseClient['"][^;]*;/gs,
    fix: (content, matches) => {
      // Cette fonction conserve l'import avec @/ et supprime l'autre
      let modified = content;
      
      for (const match of matches) {
        const fullMatch = match[0];
        // Trouve l'import qui n'utilise pas @/
        const duplicateImport = /import\s+{\s*supabase(?:[^}]*)\s*}\s+from\s+['"][^@][^"']*\/lib\/supabaseClient['"][^;]*;/g.exec(fullMatch);
        if (duplicateImport) {
          modified = modified.replace(duplicateImport[0], '');
        }
      }
      
      return modified;
    }
  },
  // Suppression d'import duplicatif simple
  {
    name: 'Suppression duplications basiques',
    regex: /(import\s+{[^}]+}\s+from\s+['"][^'"]+['"][^;]*;)(\s*\n\s*\1)/g,
    fix: (content, matches) => {
      return content.replace(/(import\s+{[^}]+}\s+from\s+['"][^'"]+['"][^;]*;)(\s*\n\s*\1)/g, '$1');
    }
  }
];

// Fonction pour traverser récursivement les répertoires
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (EXTENSIONS.includes(path.extname(filePath))) {
      processFile(filePath);
    }
  }
}

// Fonction pour traiter un fichier
function processFile(filePath) {
  totalFiles++;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let wasFixed = false;
    
    for (const pattern of patterns) {
      const matches = [...content.matchAll(pattern.regex)];
      if (matches.length > 0) {
        content = pattern.fix(content, matches);
        wasFixed = true;
        console.log(`🔍 ${path.relative(__dirname, filePath)}: Correction de ${pattern.name}`);
      }
    }
    
    if (wasFixed) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedFiles++;
      console.log(`✅ ${path.relative(__dirname, filePath)}: Fichier corrigé`);
    }
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
  }
}

console.log('🚀 DÉMARRAGE DE LA CORRECTION DES IMPORTS DUPLIQUÉS...');

// Traiter tous les fichiers des répertoires spécifiés
console.log('📂 Analyse des fichiers dans les répertoires src/pages et src/components...');
walkDir(PAGES_DIR);
walkDir(COMPONENTS_DIR);

console.log('\n🎉 CORRECTION TERMINÉE...');
console.log(`📊 Fichiers traités: ${totalFiles}`);
console.log(`✅ Fichiers corrigés: ${fixedFiles}`);
