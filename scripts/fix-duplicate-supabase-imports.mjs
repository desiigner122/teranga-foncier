#!/usr/bin/env node
/**
 * Script pour corriger les imports dupliqués de SupabaseDataService
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 CORRECTION DES IMPORTS DUPLIQUÉS');
console.log('='.repeat(50));

/**
 * Corriger les imports dupliqués dans un fichier
 */
function fixDuplicateImports(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    const fileName = filePath.split(/[\\/]/).pop();
    
    console.log(`🔄 ${fileName}`);
    
    // Pattern pour détecter les imports dupliqués de SupabaseDataService
    const duplicatePattern = /import \{ SupabaseDataService \} import \{ SupabaseDataService \} from '@\/services\/supabaseDataService';/g;
    
    if (duplicatePattern.test(content)) {
      content = content.replace(
        duplicatePattern,
        "import { SupabaseDataService } from '@/services/supabaseDataService';"
      );
      
      writeFileSync(filePath, content, 'utf8');
      console.log('  ✅ Import dupliqué corrigé');
      return true;
    }
    
    console.log('  ✨ OK');
    return false;
    
  } catch (error) {
    console.error(`  ❌ Erreur: ${error.message}`);
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  const srcDir = join(__dirname, '..', 'src');
  const pattern = join(srcDir, '**', '*.{js,jsx}').replace(/\\/g, '/');
  
  const files = await glob(pattern);
  
  console.log(`📊 ${files.length} fichiers JS/JSX trouvés\n`);
  
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
    console.log('\n✨ Aucun import dupliqué trouvé');
  }
}

// Exécution
main().catch(console.error);
