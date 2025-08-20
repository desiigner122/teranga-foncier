#!/usr/bin/env node
/**
 * Script pour corriger les conflits de variables dans les hooks
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 CORRECTION DES CONFLITS DE VARIABLES');
console.log('='.repeat(50));

/**
 * Corriger les conflits dans un fichier
 */
function fixVariableConflicts(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    let hasChanges = false;
    const fileName = filePath.split(/[\\/]/).pop();
    
    console.log(`🔄 ${fileName}`);
    
    // Pattern 1: Conflit loading
    if (content.includes('const [loading, setLoading]') && content.includes('loading, error, refetch')) {
      content = content.replace(
        /const \{ data: (\w+), loading, error, refetch \}/g,
        'const { data: $1, loading: $1Loading, error: $1Error, refetch }'
      );
      hasChanges = true;
      console.log('  ✅ Conflit loading corrigé');
    }
    
    // Pattern 2: Conflit error
    if (content.includes('const [error, setError]') && content.includes('loading, error, refetch')) {
      content = content.replace(
        /const \{ data: (\w+), loading, error, refetch \}/g,
        'const { data: $1, loading: $1Loading, error: $1Error, refetch }'
      );
      hasChanges = true;
      console.log('  ✅ Conflit error corrigé');
    }
    
    // Pattern 3: Pattern générique pour éviter les conflits
    const realtimeHookPattern = /const \{ data: (\w+), loading, error, refetch \}/g;
    const matches = content.match(realtimeHookPattern);
    if (matches) {
      matches.forEach(match => {
        const tableName = match.match(/data: (\w+)/)[1];
        const replacement = `const { data: ${tableName}, loading: ${tableName}Loading, error: ${tableName}Error, refetch }`;
        content = content.replace(match, replacement);
        hasChanges = true;
        console.log(`  ✅ Hook ${tableName} renommé pour éviter conflits`);
      });
    }
    
    // Corriger aussi les références dans le code
    if (hasChanges) {
      // Remplacer les références aux anciennes variables dans les conditions
      content = content.replace(/if \(loading\)/g, 'if (loading || dataLoading)');
      content = content.replace(/\{loading\}/g, '{loading || dataLoading}');
    }
    
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
  
  // Focus sur les fichiers qui utilisent des hooks temps réel
  const relevantFiles = files.filter(file => {
    const content = readFileSync(file, 'utf8');
    return content.includes('useRealtimeTable') || content.includes('loading, error, refetch');
  });
  
  console.log(`📊 ${relevantFiles.length} fichiers avec hooks temps réel trouvés\n`);
  
  let fixedCount = 0;
  
  for (const file of relevantFiles) {
    if (fixVariableConflicts(file)) {
      fixedCount++;
    }
  }
  
  console.log('\n🎉 CORRECTION TERMINÉE');
  console.log('='.repeat(50));
  console.log(`📊 Fichiers traités: ${relevantFiles.length}`);
  console.log(`✅ Fichiers corrigés: ${fixedCount}`);
  
  if (fixedCount > 0) {
    console.log('\n🚀 Prochaine étape: npm run build');
  } else {
    console.log('\n✨ Aucun conflit trouvé');
  }
}

// Exécution
main().catch(console.error);
