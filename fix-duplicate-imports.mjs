// fix-duplicate-imports.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    // Get all .jsx files in the src directory
    const files = await glob('src/**/*.jsx', { ignore: 'node_modules/**' });
    console.log(`Found ${files.length} JSX files to check.`);

    let fixedFiles = 0;
    const reactHooks = ['useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useContext', 'useReducer'];
    
    for (const file of files) {
      let content = fs.readFileSync(file, 'utf8');
      let originalContent = content;

      // Check for duplicate React hooks imports
      const reactHooksImportRegex = new RegExp(`import\\s+{(?:[^}]*(?:${reactHooks.join('|')})[^}]*)+}\\s+from\\s+['"]react['"][;]?`, 'g');
      const reactImports = content.match(reactHooksImportRegex) || [];

      // Check for duplicate import statements for 'supabase'
      const supabaseImportRegex = /import\s+{\s*supabase\s*}\s+from\s+['"][^'"]*supabaseClient['"][;]?/g;
      const supabaseImports = content.match(supabaseImportRegex) || [];

      // Check for duplicate toast imports
      const toastImportRegex = /import\s+{\s*toast\s*}\s+from\s+['"]react-toastify['"][;]?/g;
      const toastImports = content.match(toastImportRegex) || [];

      if (reactImports.length > 1 || supabaseImports.length > 1 || toastImports.length > 0) {
        // Remove duplicate React hooks imports, keeping only the first one
        if (reactImports.length > 1) {
          console.log(`Found ${reactImports.length} React hooks imports in ${file}`);
          
          // Extract all imported hooks
          const allHooks = [];
          reactImports.forEach(importStmt => {
            const matches = importStmt.match(/{([^}]*)}/);
            if (matches && matches[1]) {
              const hooks = matches[1].split(',').map(h => h.trim()).filter(h => h);
              allHooks.push(...hooks);
            }
          });

          // Create a deduplicated list of hooks
          const uniqueHooks = [...new Set(allHooks)];
          
          // Create a new import statement with all hooks
          const newImport = `import { ${uniqueHooks.join(', ')} } from 'react';`;
          
          // Replace all React imports with the new consolidated import
          for (const importStmt of reactImports) {
            content = content.replace(importStmt, '');
          }
          
          // Add the consolidated import at the top after the React import if it exists
          const reactImportRegex = /import\s+React(?:,\s*{[^}]*})?\s+from\s+['"]react['"][;]?/;
          if (reactImportRegex.test(content)) {
            content = content.replace(reactImportRegex, (match) => `${match}\n${newImport}`);
          } else {
            // If there's no React import, add it at the top
            content = `${newImport}\n${content}`;
          }
        }

        // Remove duplicate supabase imports, keeping only the first one
        if (supabaseImports.length > 1) {
          console.log(`Found ${supabaseImports.length} supabase imports in ${file}`);
          
          // Keep only the first import
          const firstImport = supabaseImports[0];
          for (let i = 1; i < supabaseImports.length; i++) {
            content = content.replace(supabaseImports[i], '');
          }
        }

        // Remove react-toastify imports as we're using @/components/ui/use-toast instead
        if (toastImports.length > 0) {
          console.log(`Found ${toastImports.length} react-toastify imports in ${file}`);
          for (const importStmt of toastImports) {
            content = content.replace(importStmt, '');
          }
        }

        // Clean up any consecutive empty lines
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

        // Write changes if the content has changed
        if (content !== originalContent) {
          fs.writeFileSync(file, content, 'utf8');
          fixedFiles++;
          console.log(`Fixed duplicate imports in ${file}`);
        }
      }
    }

    console.log(`Fixed ${fixedFiles} files.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
