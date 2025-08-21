import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Définir le chemin du répertoire source
const srcDir = path.join(__dirname, 'src');

// Fonction pour trouver tous les fichiers JS/JSX de manière récursive
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findJSFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Fonction pour corriger les imports de useToast
function fixUseToastImports() {
  const jsFiles = findJSFiles(srcDir);
  let fixedFilesCount = 0;

  jsFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let wasModified = false;

    // Rechercher et remplacer les imports incorrects de useToast
    const incorrectImportPatterns = [
      /import\s+{\s*useToast\s*}\s+from\s+['"]\.\.\/\.\.\/hooks\/useToast['"];?/g,
      /import\s+{\s*useToast\s*}\s+from\s+['"]\.\.\/hooks\/useToast['"];?/g,
      /import\s+{\s*useToast\s*}\s+from\s+['"]\.\/hooks\/useToast['"];?/g,
      /import\s+{\s*useToast\s*}\s+from\s+['"]\.\.\/(\.\.\/)*hooks\/useToast['"];?/g,
    ];

    for (const pattern of incorrectImportPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, `import { useToast } from "@/components/ui/use-toast";`);
        wasModified = true;
      }
    }

    // Si le fichier utilise useToast mais n'a pas d'import, ajoutez-le
    if (content.includes('useToast(') && !content.includes('import { useToast }')) {
      // Trouver où insérer l'import (après les autres imports)
      const importLines = content.match(/import.*from.*;?/g) || [];
      if (importLines.length > 0) {
        const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
        const lastImportLength = importLines[importLines.length - 1].length;

        // Insérer après le dernier import
        content = 
          content.substring(0, lastImportIndex + lastImportLength) + 
          `\nimport { useToast } from "@/components/ui/use-toast";` + 
          content.substring(lastImportIndex + lastImportLength);
      } else {
        // Insérer au début du fichier s'il n'y a pas d'autres imports
        content = `import { useToast } from "@/components/ui/use-toast";\n` + content;
      }
      wasModified = true;
    }

    if (wasModified) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedFilesCount++;
      console.log(`✅ Corrigé les imports useToast dans: ${path.relative(__dirname, filePath)}`);
    }
  });

  console.log(`\n🎉 Terminé ! ${fixedFilesCount} fichiers ont été corrigés pour useToast.`);
}

fixUseToastImports();
