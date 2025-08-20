#!/usr/bin/env node
/**
 * Script pour corriger tous les mauvais chemins d'imports
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 CORRECTION DES CHEMINS D\'IMPORTS');
console.log('='.repeat(50));

// Corrections des chemins d'imports
const pathCorrections = [
  {
    from: '@/contexts/RealtimeContext',
    to: '@/context/RealtimeContext.jsx'
  },
  {
    from: '@/hooks/use-toast',
    to: '@/components/ui/use-toast'
  },
  {
    from: '@/contexts/AuthContext',
    to: '@/contexts/AuthContext'
  }
];

/**
 * Corriger les chemins d'imports dans un fichier
 */
function fixImportPaths(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    const fileName = filePath.split(/[\\/]/).pop();
    let hasChanges = false;
    
    console.log(`🔄 ${fileName}`);
    
    // Appliquer chaque correction
    for (const correction of pathCorrections) {
      const regex = new RegExp(correction.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (regex.test(content)) {
        content = content.replace(regex, correction.to);
        hasChanges = true;
        console.log(`  ✅ ${correction.from} → ${correction.to}`);
      }
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
 * Fonction principale
 */
async function main() {
  const srcDir = join(__dirname, '..', 'src');
  const pattern = join(srcDir, '**', '*.{js,jsx}').replace(/\\/g, '/');
  
  const files = await glob(pattern);
  
  console.log(`📊 ${files.length} fichiers JS/JSX trouvés\n`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (fixImportPaths(file)) {
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
    console.log('\n✨ Aucun chemin incorrect trouvé');
  }
}

// Exécution
main().catch(console.error);
