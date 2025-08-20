#!/usr/bin/env node
/**
 * Script pour corriger les imports en double générés par le script précédent
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
    let hasChanges = false;
    const fileName = filePath.split(/[\\/]/).pop();
    
    console.log(`🔄 ${fileName}`);
    
    // Corriger chaque pattern
    DUPLICATE_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, (match, word1, word2) => {
          // Si c'est le pattern spécifique "word import { word }"
          if (pattern.source.includes('\\1')) {
            const result = `import { ${word1} } from`;
            console.log(`  ✅ Pattern ${index + 1}: ${match.substring(0, 40)}... → ${result}`);
            hasChanges = true;
            return result;
          }
          // Pattern général
          const result = `import { ${word2 || word1} } from`;
          console.log(`  ✅ Pattern ${index + 1}: ${match.substring(0, 40)}... → ${result}`);
          hasChanges = true;
          return result;
        });
      }
    });
    
    // Patterns spécifiques supplémentaires
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
      }
    ];
    
    specificFixes.forEach(fix => {
      if (fix.from.test(content)) {
        content = content.replace(fix.from, fix.to);
        console.log(`  ✅ ${fix.name}: corrigé`);
        hasChanges = true;
      }
    });
    
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
