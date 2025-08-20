import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

// Patterns pour détecter les variables non définies courantes
const commonPatterns = [
  {
    test: /\buseSupabaseClient\b(?!\s*=)/,
    import: "import { useSupabaseClient } from '@supabase/auth-helpers-react';"
  },
  {
    test: /\buseUser\b(?!\s*=)/,
    import: "import { useUser } from '@supabase/auth-helpers-react';"
  },
  {
    test: /\buseNavigate\b(?!\s*=)/,
    import: "import { useNavigate } from 'react-router-dom';"
  },
  {
    test: /\buseParams\b(?!\s*=)/,
    import: "import { useParams } from 'react-router-dom';"
  },
  {
    test: /\buseLocation\b(?!\s*=)/,
    import: "import { useLocation } from 'react-router-dom';"
  },
  {
    test: /\btoast\b(?!\s*=).*?\b(success|error|info|warning)\b/,
    import: "import { toast } from 'react-toastify';"
  },
  {
    test: /\buseTranslation\b(?!\s*=)/,
    import: "import { useTranslation } from 'react-i18next';"
  },
  {
    test: /\buseQuery\b(?!\s*=)/,
    import: "import { useQuery } from 'react-query';"
  },
  {
    test: /\buseMutation\b(?!\s*=)/,
    import: "import { useMutation } from 'react-query';"
  },
  {
    test: /\buseQueryClient\b(?!\s*=)/,
    import: "import { useQueryClient } from 'react-query';"
  },
  {
    test: /\buseForm\b(?!\s*=)/,
    import: "import { useForm } from 'react-hook-form';"
  },
  {
    test: /\bsupabase\b(?!\s*=)(?!.*import)/,
    import: "import { supabase } from '../lib/supabaseClient';"
  },
  {
    test: /\bLink\b(?!\s*=)(?!.*import).*?(?=\s*to=)/,
    import: "import { Link } from 'react-router-dom';"
  },
  {
    test: /\bFormattedMessage\b(?!\s*=)(?!.*import)/,
    import: "import { FormattedMessage } from 'react-intl';"
  },
  {
    test: /\buseContext\b(?!\s*=)(?!.*import)/,
    import: "import { useContext } from 'react';"
  },
  {
    test: /\buseEffect\b(?!\s*=)(?!.*import)/,
    import: "import { useEffect } from 'react';"
  },
  {
    test: /\buseCallback\b(?!\s*=)(?!.*import)/,
    import: "import { useCallback } from 'react';"
  },
  {
    test: /\buseMemo\b(?!\s*=)(?!.*import)/,
    import: "import { useMemo } from 'react';"
  },
  {
    test: /\buseRef\b(?!\s*=)(?!.*import)/,
    import: "import { useRef } from 'react';"
  },
  {
    test: /\buseState\b(?!\s*=)(?!.*import)/,
    import: "import { useState } from 'react';"
  },
  {
    test: /\bReact\.useState\b(?!\s*=)(?!.*import)/,
    import: "import React from 'react';"
  },
  {
    test: /\bReact\.useEffect\b(?!\s*=)(?!.*import)/,
    import: "import React from 'react';"
  },
  {
    test: /\bReact\.useRef\b(?!\s*=)(?!.*import)/,
    import: "import React from 'react';"
  },
  {
    test: /\bReact\.useContext\b(?!\s*=)(?!.*import)/,
    import: "import React from 'react';"
  },
  {
    test: /\bReact\.Fragment\b(?!\s*=)(?!.*import)/,
    import: "import React from 'react';"
  }
];

// Fonction pour ajouter les imports manquants
function addMissingImports(filePath, content) {
  let missingImports = new Set();
  let hasAnyMatch = false;

  for (const pattern of commonPatterns) {
    if (pattern.test.test(content) && !content.includes(pattern.import)) {
      missingImports.add(pattern.import);
      hasAnyMatch = true;
    }
  }

  if (!hasAnyMatch) {
    return content;
  }

  // Trouver le bon endroit pour ajouter les imports
  const importRegex = /^import .+?;[\r\n]*/gm;
  const lastImportMatch = [...content.matchAll(importRegex)].pop();
  
  if (lastImportMatch) {
    const lastImportIndex = lastImportMatch.index + lastImportMatch[0].length;
    return content.slice(0, lastImportIndex) + 
           [...missingImports].join('\n') + '\n' + 
           content.slice(lastImportIndex);
  } else {
    // S'il n'y a pas d'imports existants, ajoutez-les au début du fichier
    return [...missingImports].join('\n') + '\n' + content;
  }
}

// Fonction pour parcourir récursivement les répertoires
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let fixedFiles = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      fixedFiles += processDirectory(filePath);
    } else if (/\.(jsx?|tsx?)$/.test(file)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const updatedContent = addMissingImports(filePath, content);
      
      if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`Fixed imports in: ${filePath}`);
        fixedFiles++;
      }
    }
  }

  return fixedFiles;
}

// Exécuter le script
console.log("Correction des imports manquants...");
const fixedFilesCount = processDirectory(srcDir);
console.log(`Terminé! ${fixedFilesCount} fichiers ont été corrigés.`);
