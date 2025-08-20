#!/usr/bin/env node
/**
 * Script pour corriger les imports en double dans les fichiers React
 * Cible les problèmes spécifiques de notre codebase:
 * 1. Imports dupliqués des hooks React (useState, useEffect, etc.)
 * 2. Imports dupliqués de supabase
 * 3. Imports dupliqués de toast (react-toastify)
 * 4. Autres imports dupliqués courants
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 CORRECTION DES IMPORTS EN DOUBLE');
console.log('='.repeat(50));

/**
 * Patterns d'imports en double à corriger
 */
const DUPLICATE_PATTERNS = [
  // Pattern: Imports dupliqués de hooks React
  /import\s+\{\s*(useEffect|useState|useRef|useContext|useCallback|useMemo|useReducer)(\s*,\s*(useEffect|useState|useRef|useContext|useCallback|useMemo|useReducer))*\s*\}\s+from\s+['"]react['"]/g,
  
  // Imports dupliqués de supabase
  /import\s+\{\s*supabase\s*\}\s+from\s+['"](\.\.\/|\@\/)lib\/supabaseClient['"]/g,
  
  // Imports dupliqués de react-toastify
  /import\s+\{\s*toast\s*\}\s+from\s+['"]react-toastify['"]/g,
  
  // Pattern: word import { word } from
  /(\w+)\s+import\s+\{\s*\1\s*\}\s+from/g,
  
  // Pattern: import word import { word } from
  /import\s+(\w+)\s+import\s+\{\s*\1\s*\}\s+from/g,
  
  // Pattern général: any_word import { any_word } from
  /(\w+)\s+import\s+\{\s*(\w+)\s*\}\s+from/g
];

/**
 * Corriger un fichier spécifique
 */
function fixDuplicateImports(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    let originalContent = content;
    let hasChanges = false;
    const fileName = filePath.split(/[\\/]/).pop();
    
    console.log(`🔄 ${fileName}`);
    
    // 1. Corriger les imports dupliqués de React hooks
    const reactHooksPattern = /import\s+\{\s*(useEffect|useState|useRef|useContext|useCallback|useMemo|useReducer)(\s*,\s*(useEffect|useState|useRef|useContext|useCallback|useMemo|useReducer))*\s*\}\s+from\s+['"]react['"]/g;
    const reactHooksMatches = [...content.matchAll(reactHooksPattern)];
    
    if (reactHooksMatches.length > 1) {
      // Garder le premier, supprimer les autres
      const firstMatch = reactHooksMatches[0][0];
      for (let i = 1; i < reactHooksMatches.length; i++) {
        const matchText = reactHooksMatches[i][0];
        const matchIndex = content.indexOf(matchText, reactHooksMatches[i-1].index + firstMatch.length);
        if (matchIndex !== -1) {
          content = content.substring(0, matchIndex) + content.substring(matchIndex + matchText.length);
          console.log(`  ✅ Supprimé hooks React dupliqués: ${matchText.substring(0, 40)}...`);
          hasChanges = true;
        }
      }
    }

    // 2. Corriger les imports dupliqués de supabase
    const supabasePattern = /import\s+\{\s*supabase\s*\}\s+from\s+['"](\.\.\/|\@\/)lib\/supabaseClient['"]/g;
    const supabaseMatches = [...content.matchAll(supabasePattern)];
    
    if (supabaseMatches.length > 1) {
      // Garder le premier, supprimer les autres
      const firstMatch = supabaseMatches[0][0];
      for (let i = 1; i < supabaseMatches.length; i++) {
        const matchText = supabaseMatches[i][0];
        const matchIndex = content.indexOf(matchText, supabaseMatches[i-1].index + firstMatch.length);
        if (matchIndex !== -1) {
          content = content.substring(0, matchIndex) + content.substring(matchIndex + matchText.length);
          console.log(`  ✅ Supprimé supabase dupliqué: ${matchText.substring(0, 40)}...`);
          hasChanges = true;
        }
      }
    }

    // 3. Supprimer react-toastify si useToast de @/components/ui/use-toast est utilisé
    if (content.includes('import { useToast } from "@/components/ui/use-toast"') || 
        content.includes("import { useToast } from '@/components/ui/use-toast'")) {
      const toastifyPattern = /import\s+\{\s*toast\s*\}\s+from\s+['"]react-toastify['"]/g;
      const toastifyMatches = [...content.matchAll(toastifyPattern)];
      
      for (const match of toastifyMatches) {
        const matchText = match[0];
        const matchIndex = content.indexOf(matchText);
        if (matchIndex !== -1) {
          content = content.substring(0, matchIndex) + content.substring(matchIndex + matchText.length);
          console.log(`  ✅ Supprimé react-toastify (useToast déjà utilisé): ${matchText}`);
          hasChanges = true;
        }
      }
    }

    // 4. Corriger les autres patterns d'imports dupliqués
    for (const pattern of DUPLICATE_PATTERNS.slice(3)) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, (match, word1, word2) => {
          // Si c'est le pattern spécifique "word import { word }"
          if (pattern.source.includes('\\1')) {
            const result = `import { ${word1} } from`;
            console.log(`  ✅ Pattern: ${match.substring(0, 40)}... → ${result}`);
            hasChanges = true;
            return result;
          }
          // Pattern général
          const result = `import { ${word2 || word1} } from`;
          console.log(`  ✅ Pattern: ${match.substring(0, 40)}... → ${result}`);
          hasChanges = true;
          return result;
        });
      }
    }
    
    // 5. Patterns spécifiques supplémentaires
    const specificFixes = [
      {
        from: /SupabaseDataService\s+import\s+\{\s*SupabaseDataService\s*\}\s+from/g,
        to: 'import { SupabaseDataService } from',
        name: 'SupabaseDataService double'
      },
      {
        from: /LoadingSpinner\s+import\s+\{\s*LoadingSpinner\s*\}\s+from/g,
        to: 'import { LoadingSpinner } from',
        name: 'LoadingSpinner double'
      },
      {
        from: /useToast\s+import\s+\{\s*useToast\s*\}\s+from/g,
        to: 'import { useToast } from',
        name: 'useToast double'
      },
      {
        from: /import\s+\{\s*useState,\s*useEffect\s*\}\s+from\s+['"]react['"]\s*;\s*import\s+\{\s*useState,\s*useEffect\s*\}\s+from\s+['"]react['"]/g,
        to: 'import { useState, useEffect } from "react"',
        name: 'useState+useEffect dupliqués'
      },
      {
        from: /import\s+\{\s*supabase\s*\}\s+from\s+['"]@\/lib\/supabaseClient['"]\s*;\s*import\s+\{\s*supabase\s*\}\s+from\s+['"]\.\.\/lib\/supabaseClient['"]/g,
        to: 'import { supabase } from "@/lib/supabaseClient"',
        name: 'supabase @ et .. dupliqués'
      }
    ];
    
    specificFixes.forEach(fix => {
      if (fix.from.test(content)) {
        content = content.replace(fix.from, fix.to);
        console.log(`  ✅ ${fix.name}: corrigé`);
        hasChanges = true;
      }
    });
    
    // 6. Nettoyer les lignes vides multiples
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Sauvegarder si des changements ont été faits
    if (hasChanges) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`  💾 Sauvegardé`);
      return true;
    } else {
      console.log(`  ✨ OK`);
      return false;
    }
    
  } catch (error) {
    console.error(`  ❌ Erreur: ${error.message}`);
    return false;
  }
}

/**
 * Trouver tous les fichiers JS/JSX
 */
function findJSFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    try {
      const items = readdirSync(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(currentDir, item.name);
        
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
          traverse(fullPath);
        } else if (item.isFile() && (item.name.endsWith('.jsx') || item.name.endsWith('.js'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignorer les erreurs d'accès
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Fonction principale
 */
async function main() {
  const srcDir = join(__dirname, '..', 'src');
  const files = findJSFiles(srcDir);
  
  console.log(`📊 ${files.length} fichiers trouvés\n`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixDuplicateImports(file)) {
      fixedCount++;
    }
  }
  
  console.log('\n🎉 CORRECTION TERMINÉE');
  console.log('='.repeat(50));
  console.log(`📊 Fichiers traités: ${files.length}`);
  console.log(`✅ Fichiers corrigés: ${fixedCount}`);
  
  if (fixedCount > 0) {
    console.log('\n🚀 Prochaine étape: npm run build');
  } else {
    console.log('\n✨ Aucune correction nécessaire');
  }
}

// Exécution
main().catch(console.error);
