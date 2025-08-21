import fs from "fs";
import path from "path";

const rootDir = path.resolve("src"); // ton code est dans src/
let occurrences = [];

/**
 * Recherche récursive de fichiers JS/TS
 */
function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(jsx?|tsx?)$/.test(file)) {
      const content = fs.readFileSync(fullPath, "utf8");

      const matches = [...content.matchAll(/export function useToast\s*\(/g)];
      if (matches.length > 0) {
        occurrences.push({ file: fullPath, count: matches.length });
      }
    }
  }
}

/**
 * Supprime automatiquement toutes les occurrences sauf la première
 */
function fixDuplicates() {
  if (occurrences.length <= 1) {
    console.log("✅ Aucun doublon trouvé. Ton projet est clean !");
    return;
  }

  console.log("⚠️ Plusieurs `useToast` trouvés :");
  occurrences.forEach((o, i) =>
    console.log(`${i + 1}. ${o.file} (${o.count} occurrence)`)
  );

  // garder la première et supprimer les autres
  for (let i = 1; i < occurrences.length; i++) {
    const file = occurrences[i].file;
    let content = fs.readFileSync(file, "utf8");

    content = content.replace(/export function useToast\s*\([\s\S]*?\{[\s\S]*?\}\s*/g, "");

    fs.writeFileSync(file, content, "utf8");
    console.log(`❌ Supprimé la définition en trop dans: ${file}`);
  }

  console.log("✅ Nettoyage terminé !");
}

// Lancer
scanDir(rootDir);
fixDuplicates();
