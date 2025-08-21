// Script complet pour la détection et correction automatique de tous les problèmes d'ESLint
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des corrections courantes
const commonFixes = {
  // Correction des imports de supabaseClient
  supabaseClientImport: {
    from: /import supabase from ['"]\.\.\/lib\/supabaseClient['"];/g,
    to: 'import supabase from "../../lib/supabaseClient";'
  },
  
  // Imports manquants courants
  missingImports: {
    useToast: {
      check: (content) => !content.includes('import { useToast }'),
      add: 'import { useToast } from "../../hooks/useToast";'
    },
    useAuth: {
      check: (content) => !content.includes('import { useAuth }'),
      add: 'import { useAuth } from "../../contexts/AuthContext";'
    },
    useNavigate: {
      check: (content) => !content.includes('import { useNavigate }'),
      add: 'import { useNavigate } from "react-router-dom";'
    },
    useRealtimeTable: {
      check: (content) => !content.includes('import { useRealtimeTable }'),
      add: 'import { useRealtimeTable } from "../../hooks/useRealtimeTable";'
    }
  },
  
  // Composants UI manquants courants
  missingUIComponents: {
    dialog: {
      check: (content) => content.includes('Dialog') && !content.includes('import { Dialog'),
      add: 'import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";'
    },
    table: {
      check: (content) => content.includes('Table') && !content.includes('import { Table'),
      add: 'import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "../../components/ui/table";'
    },
    alertDialog: {
      check: (content) => content.includes('AlertDialog') && !content.includes('import { AlertDialog'),
      add: 'import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";'
    }
  }
};

// Fonction pour rechercher tous les fichiers avec l'extension donnée
async function findAllFiles(dir, extensions = ['.js', '.jsx']) {
  const allFiles = [];
  
  async function scanDir(directory) {
    try {
      const entries = fs.readdirSync(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        
        if (entry.isDirectory() && !entry.name.includes('node_modules') && !entry.name.includes('dist')) {
          await scanDir(fullPath);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          allFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Erreur lors de la lecture du répertoire ${directory}:`, error);
    }
  }
  
  await scanDir(dir);
  return allFiles;
}

// Fonction pour détecter les erreurs de build
async function detectBuildErrors() {
  try {
    // Exécuter le build et capturer la sortie
    const { stdout, stderr } = await execAsync('npm run build');
    return { success: true, output: stdout + stderr };
  } catch (error) {
    // Le build a échoué, retourner les erreurs
    return { success: false, output: error.stdout + error.stderr };
  }
}

// Fonction pour extraire les erreurs d'importation
function extractImportErrors(buildOutput) {
  const errors = [];
  
  // Recherche des erreurs d'importation
  const importErrorRegex = /Could not resolve "([^"]+)" from "([^"]+)"/g;
  
  let match;
  while ((match = importErrorRegex.exec(buildOutput)) !== null) {
    errors.push({
      type: 'import',
      module: match[1],
      file: match[2]
    });
  }
  
  return errors;
}

// Fonction pour corriger automatiquement un fichier
async function fixFile(filePath) {
  // Vérifier si le fichier existe
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Fichier non trouvé: ${filePath}`);
    return false;
  }
  
  // Lire le contenu du fichier
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let modified = false;
  
  // 1. Corriger les imports de supabaseClient
  if (newContent.includes("import supabase from '../lib/supabaseClient'") || 
      newContent.includes('import supabase from "../lib/supabaseClient"')) {
    newContent = newContent.replace(
      commonFixes.supabaseClientImport.from,
      commonFixes.supabaseClientImport.to
    );
    modified = true;
  }
  
  // 2. Ajouter les imports manquants courants
  for (const [name, importInfo] of Object.entries(commonFixes.missingImports)) {
    if (importInfo.check(newContent) && 
        (newContent.includes(name) || name === 'useAuth' || name === 'useToast')) {
      // Ajouter après le dernier import
      const lastImportIndex = newContent.lastIndexOf('import');
      if (lastImportIndex !== -1) {
        const endOfLastImport = newContent.indexOf(';', lastImportIndex);
        if (endOfLastImport !== -1) {
          newContent = 
            newContent.substring(0, endOfLastImport + 1) + 
            '\n' + importInfo.add + 
            newContent.substring(endOfLastImport + 1);
          modified = true;
        }
      }
    }
  }
  
  // 3. Ajouter les composants UI manquants
  for (const [name, componentInfo] of Object.entries(commonFixes.missingUIComponents)) {
    if (componentInfo.check(newContent)) {
      // Ajouter après le dernier import
      const lastImportIndex = newContent.lastIndexOf('import');
      if (lastImportIndex !== -1) {
        const endOfLastImport = newContent.indexOf(';', lastImportIndex);
        if (endOfLastImport !== -1) {
          newContent = 
            newContent.substring(0, endOfLastImport + 1) + 
            '\n' + componentInfo.add + 
            newContent.substring(endOfLastImport + 1);
          modified = true;
        }
      }
    }
  }
  
  // Si des modifications ont été apportées, écrire le fichier
  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Corrigé: ${path.relative(__dirname, filePath)}`);
    return true;
  }
  
  return false;
}

// Fonction pour corriger tous les fichiers avec des erreurs d'importation
async function fixImportErrors() {
  console.log('🔍 Analyse des erreurs de build...');
  
  // Détecter les erreurs de build
  const { success, output } = await detectBuildErrors();
  
  if (success) {
    console.log('✅ Le build a réussi! Aucune correction nécessaire.');
    return 0;
  }
  
  // Extraire les erreurs d'importation
  const errors = extractImportErrors(output);
  
  if (errors.length === 0) {
    console.log('⚠️ Aucune erreur d\'importation détectée, mais le build a échoué pour une autre raison.');
    return 0;
  }
  
  console.log(`🔧 Correction de ${errors.length} erreurs d'importation...`);
  
  // Map pour éviter de traiter le même fichier plusieurs fois
  const filesToFix = new Map();
  
  for (const error of errors) {
    filesToFix.set(error.file, error);
  }
  
  let fixCount = 0;
  
  // Corriger chaque fichier
  for (const [file, error] of filesToFix) {
    const filePath = path.join(__dirname, file);
    if (await fixFile(filePath)) {
      fixCount++;
    }
  }
  
  // Aussi vérifier et corriger tous les fichiers .jsx pour les imports manquants courants
  console.log('🔍 Recherche des fichiers avec des imports potentiellement manquants...');
  
  const allJsxFiles = await findAllFiles(path.join(__dirname, 'src'), ['.jsx']);
  
  for (const filePath of allJsxFiles) {
    if (await fixFile(filePath)) {
      fixCount++;
    }
  }
  
  return fixCount;
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 Démarrage de la correction automatique des erreurs d\'ESLint...');
    
    const fixedCount = await fixImportErrors();
    
    if (fixedCount > 0) {
      console.log(`\n🎉 Terminé! ${fixedCount} fichier(s) corrigé(s).`);
      
      // Exécuter un nouveau build pour vérifier les corrections
      console.log('\n🔄 Exécution d\'un nouveau build pour vérifier les corrections...');
      
      const { success, output } = await detectBuildErrors();
      
      if (success) {
        console.log('✅ Build réussi! Toutes les erreurs ont été corrigées avec succès.');
      } else {
        console.log('⚠️ Le build a toujours des erreurs. Certains problèmes pourraient nécessiter une correction manuelle.');
        
        // Afficher les erreurs restantes
        const remainingErrors = extractImportErrors(output);
        if (remainingErrors.length > 0) {
          console.log('\nErreurs restantes:');
          for (const error of remainingErrors) {
            console.log(`- ${error.file}: Impossible de résoudre "${error.module}"`);
          }
        }
      }
    } else {
      console.log('ℹ️ Aucun fichier n\'a été modifié.');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script:', error);
    process.exit(1);
  }
}

// Exécuter le script
main();
