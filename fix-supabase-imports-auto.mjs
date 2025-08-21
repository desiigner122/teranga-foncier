// Script pour détecter et corriger automatiquement les imports de supabaseClient
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour rechercher tous les fichiers avec l'extension donnée
async function findAllFiles(dir, extensions = ['.js', '.jsx']) {
  const allFiles = [];
  
  async function scanDir(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory() && !entry.name.includes('node_modules')) {
        await scanDir(fullPath);
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        allFiles.push(fullPath);
      }
    }
  }
  
  await scanDir(dir);
  return allFiles;
}

// Fonction pour détecter les erreurs d'importation de supabaseClient
async function detectSupabaseImportErrors() {
  try {
    // Exécuter le build et capturer la sortie
    const { stdout, stderr } = await execAsync('npm run build');
    const buildOutput = stdout + stderr;
    
    // Chercher les erreurs spécifiques d'importation de supabaseClient
    const importErrors = [];
    const errorRegex = /Could not resolve "\.\.\/lib\/supabaseClient" from "([^"]+)"/g;
    
    let match;
    while ((match = errorRegex.exec(buildOutput)) !== null) {
      importErrors.push(match[1]);
    }
    
    return importErrors;
  } catch (error) {
    // Le build a échoué, rechercher également dans l'erreur
    const buildOutput = error.stdout + error.stderr;
    
    const importErrors = [];
    const errorRegex = /Could not resolve "\.\.\/lib\/supabaseClient" from "([^"]+)"/g;
    
    let match;
    while ((match = errorRegex.exec(buildOutput)) !== null) {
      importErrors.push(match[1]);
    }
    
    return importErrors;
  }
}

// Fonction pour vérifier et corriger les imports de supabaseClient
async function fixSupabaseImports() {
  console.log('🔍 Recherche des fichiers avec des imports de supabaseClient incorrects...');
  
  // Détection automatique des fichiers avec des erreurs d'importation
  const errorFiles = await detectSupabaseImportErrors();
  
  if (errorFiles.length === 0) {
    console.log('✅ Aucune erreur d\'importation de supabaseClient détectée!');
    return 0;
  }
  
  console.log(`🔧 Correction des imports dans ${errorFiles.length} fichiers...`);
  
  let fixCount = 0;
  
  for (const filePath of errorFiles) {
    // Chemin absolu du fichier
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ Fichier non trouvé: ${filePath}`);
      continue;
    }
    
    // Lire le contenu du fichier
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Remplacer l'import incorrect
    const newContent = content.replace(
      /import supabase from ['"]\.\.\/lib\/supabaseClient['"];/g,
      'import supabase from "../../lib/supabaseClient";'
    );
    
    // Si des modifications ont été apportées, écrire le fichier
    if (content !== newContent) {
      fs.writeFileSync(fullPath, newContent, 'utf8');
      console.log(`✅ Fixé: ${filePath}`);
      fixCount++;
    } else {
      console.log(`ℹ️ Pas de modification nécessaire pour: ${filePath}`);
    }
  }
  
  return fixCount;
}

// Fonction principale
async function main() {
  try {
    const fixedCount = await fixSupabaseImports();
    console.log(`\n🎉 Terminé! ${fixedCount} fichier(s) corrigé(s).`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script:', error);
    process.exit(1);
  }
}

// Exécuter le script
main();
