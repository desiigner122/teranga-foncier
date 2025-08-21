#!/usr/bin/env node

/**
 * Script de correction automatique des erreurs courantes dans le codebase
 * - Corrige les importations manquantes
 * - Résout les doublons de déclarations (useState, formData, etc.)
 * - Corrige les problèmes avec supabase
 * - Résout les erreurs de syntaxe courantes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mappings des composants/variables et leurs importations
const IMPORT_MAPPINGS = {
  // Icônes Lucide React
  'User': { module: 'lucide-react', type: 'named' },
  'Users': { module: 'lucide-react', type: 'named' },
  'Building': { module: 'lucide-react', type: 'named' },
  'DollarSign': { module: 'lucide-react', type: 'named' },
  'LandPlot': { module: 'lucide-react', type: 'named' },
  'Activity': { module: 'lucide-react', type: 'named' },
  'Bell': { module: 'lucide-react', type: 'named' },
  'Briefcase': { module: 'lucide-react', type: 'named' },
  'FileCheck': { module: 'lucide-react', type: 'named' },
  'BarChart': { module: 'lucide-react', type: 'named' },
  'PieChartIcon': { module: 'lucide-react', type: 'named', importAs: 'PieChart' },
  'Home': { module: 'lucide-react', type: 'named' },
  'Landmark': { module: 'lucide-react', type: 'named' },
  'Gavel': { module: 'lucide-react', type: 'named' },
  'UserCheck': { module: 'lucide-react', type: 'named' },
  'CalendarDays': { module: 'lucide-react', type: 'named' },
  'Eye': { module: 'lucide-react', type: 'named' },
  'Mail': { module: 'lucide-react', type: 'named' },
  'Phone': { module: 'lucide-react', type: 'named' },
  'Search': { module: 'lucide-react', type: 'named' },
  'Filter': { module: 'lucide-react', type: 'named' },
  'AlertCircle': { module: 'lucide-react', type: 'named' },
  'CheckCircle': { module: 'lucide-react', type: 'named' },
  'Clock': { module: 'lucide-react', type: 'named' },
  'MessageSquare': { module: 'lucide-react', type: 'named' },
  'Plus': { module: 'lucide-react', type: 'named' },
  'Edit': { module: 'lucide-react', type: 'named' },
  'Trash2': { module: 'lucide-react', type: 'named' },
  'RefreshCw': { module: 'lucide-react', type: 'named' },
  'TrendingUp': { module: 'lucide-react', type: 'named' },
  'ClipboardList': { module: 'lucide-react', type: 'named' },
  'Calendar': { module: 'lucide-react', type: 'named' },
  'Reply': { module: 'lucide-react', type: 'named' },
  'CheckCircle2': { module: 'lucide-react', type: 'named' },
  'MapPin': { module: 'lucide-react', type: 'named' },
  
  // Composants Recharts
  'BarChart as RechartsBarChart': { module: 'recharts', type: 'named', alias: true },
  'Bar': { module: 'recharts', type: 'named' },
  'Cell': { module: 'recharts', type: 'named' },
  'XAxis': { module: 'recharts', type: 'named' },
  'YAxis': { module: 'recharts', type: 'named' },
  'Tooltip': { module: 'recharts', type: 'named' },
  'Legend': { module: 'recharts', type: 'named' },
  'ResponsiveContainer': { module: 'recharts', type: 'named' },
  'PieChart': { module: 'recharts', type: 'named' },
  'Pie': { module: 'recharts', type: 'named' },
  'CartesianGrid': { module: 'recharts', type: 'named' },
  
  // Composants UI personnalisés
  'Button': { module: '@/components/ui/button', type: 'named' },
  'Card': { module: '@/components/ui/card', type: 'named' },
  'CardContent': { module: '@/components/ui/card', type: 'named' },
  'CardHeader': { module: '@/components/ui/card', type: 'named' },
  'CardTitle': { module: '@/components/ui/card', type: 'named' },
  'CardDescription': { module: '@/components/ui/card', type: 'named' },
  'Badge': { module: '@/components/ui/badge', type: 'named' },
  'Label': { module: '@/components/ui/label', type: 'named' },
  'Input': { module: '@/components/ui/input', type: 'named' },
  'Tabs': { module: '@/components/ui/tabs', type: 'named' },
  'TabsList': { module: '@/components/ui/tabs', type: 'named' },
  'TabsTrigger': { module: '@/components/ui/tabs', type: 'named' },
  'TabsContent': { module: '@/components/ui/tabs', type: 'named' },
  'Select': { module: '@/components/ui/select', type: 'named' },
  'SelectTrigger': { module: '@/components/ui/select', type: 'named' },
  'SelectValue': { module: '@/components/ui/select', type: 'named' },
  'SelectContent': { module: '@/components/ui/select', type: 'named' },
  'SelectItem': { module: '@/components/ui/select', type: 'named' },
  'Checkbox': { module: '@/components/ui/checkbox', type: 'named' },
  'Textarea': { module: '@/components/ui/textarea', type: 'named' },
  'Progress': { module: '@/components/ui/progress', type: 'named' },
  'Avatar': { module: '@/components/ui/avatar', type: 'named' },
  'AvatarFallback': { module: '@/components/ui/avatar', type: 'named' },
  'LoadingSpinner': { module: '@/components/ui/loading-spinner', type: 'named' },
  
  // Hooks et services
  'useToast': { module: '@/components/ui/use-toast', type: 'named' },
  'useAuth': { module: '@/context/AuthContext', type: 'named' },
  'useRealtimeTable': { module: '@/hooks/useRealtimeTable', type: 'named' },
  'SupabaseDataService': { module: '@/services/SupabaseDataService', type: 'default' },
  'supabase': { module: '@/lib/supabaseClient', type: 'default' },
  
  // React Router
  'Link': { module: 'react-router-dom', type: 'named' },
  'useNavigate': { module: 'react-router-dom', type: 'named' },
  'Navigate': { module: 'react-router-dom', type: 'named' },
  'Outlet': { module: 'react-router-dom', type: 'named' },
  
  // Animations
  'motion': { module: 'framer-motion', type: 'named' },
};

// Variables d'état commune qui doivent être initialisées
const COMMON_STATE_VARIABLES = [
  'loading',
  'setLoading',
  'searchTerm',
  'setSearchTerm',
  'statusFilter',
  'setStatusFilter',
  'typeFilter',
  'setTypeFilter',
  'formData',
  'setFormData',
  'showAddForm',
  'setShowAddForm',
  'selectedInquiry',
  'setSelectedInquiry',
  'selectedProject',
  'refreshing',
  'setRefreshing',
  'dataLoading',
  'chartData',
  'inquiries',
  'setInquiries',
  'properties',
  'setProperties'
];

// Variables communes à initialiser
const COMMON_VARIABLES = [
  { 
    name: 'propertyTypes', 
    initialization: `const propertyTypes = [
    { id: 'maison', name: 'Maison' },
    { id: 'appartement', name: 'Appartement' },
    { id: 'terrain', name: 'Terrain' },
    { id: 'commercial', name: 'Local Commercial' },
    { id: 'bureau', name: 'Bureau' }
  ];`
  },
  {
    name: 'statusOptions',
    initialization: `const statusOptions = [
    { id: 'disponible', name: 'Disponible' },
    { id: 'vendu', name: 'Vendu' },
    { id: 'reserve', name: 'Réservé' },
    { id: 'construction', name: 'En Construction' }
  ];`
  },
  {
    name: 'featuresOptions',
    initialization: `const featuresOptions = [
    { id: 'parking', name: 'Parking' },
    { id: 'piscine', name: 'Piscine' },
    { id: 'jardin', name: 'Jardin' },
    { id: 'balcon', name: 'Balcon' },
    { id: 'ascenseur', name: 'Ascenseur' },
    { id: 'securite', name: 'Sécurité 24/7' }
  ];`
  }
];

// Fichiers spéciaux qui nécessitent une attention particulière
const SPECIAL_CASES = {
  'AuthContext.jsx': {
    check: (content) => content.includes('export const useAuth') && content.includes('import { useAuth }'),
    fix: (content) => content.replace(/import { useAuth } from [^;]+;/g, '')
  },
  'ProtectedRoute.jsx': {
    check: (content) => content.includes('const ProtectedRoute = ({') && content.includes('const [loading'),
    fix: (content) => {
      return content
        .replace(/const ProtectedRoute = \({\s*const \[loading[^\)]+\n([^}]+)\}\) =>/g, 'const ProtectedRoute = ($1) =>')
        .replace(/const \{ isAuthenticated/g, 'const [localLoading, setLocalLoading] = useState(false);\n  const { isAuthenticated');
    }
  }
};

// Read and parse a file
function processFile(filePath, basePath) {
  try {
    // Skip node_modules and build directories
    if (filePath.includes('node_modules') || filePath.includes('dist') || filePath.includes('build')) {
      return false;
    }
    
    // Only process JS and JSX files
    if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) {
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Traitement spécial pour certains fichiers
    for (const [pattern, handler] of Object.entries(SPECIAL_CASES)) {
      if (fileName.includes(pattern) && handler.check(content)) {
        const fixedContent = handler.fix(content);
        if (fixedContent !== content) {
          fs.writeFileSync(filePath, fixedContent, 'utf8');
          console.log(`Applied special fix to ${filePath}`);
          return true;
        }
      }
    }
    
    // Check for duplicate state variables
    const stateVarMatches = [];
    const stateVarRegex = /const\s*\[\s*(\w+)\s*,\s*set(\w+)\s*\]\s*=\s*useState/g;
    let match;
    while ((match = stateVarRegex.exec(content)) !== null) {
      stateVarMatches.push({
        fullMatch: match[0],
        varName: match[1],
        setterName: `set${match[2]}`
      });
    }
    
    // Check for duplicate declarations
    const duplicateVars = [];
    stateVarMatches.forEach((stateVar, i) => {
      for (let j = i + 1; j < stateVarMatches.length; j++) {
        if (stateVar.varName === stateVarMatches[j].varName || 
            stateVar.setterName === stateVarMatches[j].setterName) {
          duplicateVars.push(stateVarMatches[j]);
        }
      }
    });
    
    if (duplicateVars.length > 0) {
      let fixedContent = content;
      duplicateVars.forEach(duplicate => {
        fixedContent = fixedContent.replace(duplicate.fullMatch, '/* REMOVED DUPLICATE */ ');
      });
      
      // Remove empty const declarations
      fixedContent = fixedContent.replace(/const\s*\/\* REMOVED DUPLICATE \*\/\s*;/g, '');
      
      if (fixedContent !== content) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log(`Fixed duplicate state vars in ${filePath}`);
        return true;
      }
    }
    
    // Look for redundant formData declarations
    if (content.includes('const [formData, setFormData] = useState({});') && 
        content.includes('const [formData, setFormData] = useState({')) {
      let fixedContent = content.replace('const [formData, setFormData] = useState({});', '');
      if (fixedContent !== content) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log(`Fixed redundant formData in ${filePath}`);
        return true;
      }
    }
    
    // Check for missing imports/declarations
    const missingImports = {};
    const missingStateVars = [];
    const missingVars = [];
    
    // Scan for component/variable usages
    for (const [component, importInfo] of Object.entries(IMPORT_MAPPINGS)) {
      const componentName = component.split(' as ')[0];
      const regex = new RegExp(`\\b${componentName}\\b(?!\\s*:)(?!\\s*=)(?!\\s*\\()`, 'g');
      
      if (regex.test(content)) {
        // Check if it's already imported
        const importRegex = new RegExp(`import[^;]*\\b${componentName}\\b[^;]*;`, 'g');
        if (!importRegex.test(content)) {
          const modulePath = importInfo.module;
          
          if (!missingImports[modulePath]) {
            missingImports[modulePath] = { named: [], default: null };
          }
          
          if (importInfo.type === 'named') {
            const importName = importInfo.importAs || componentName;
            const displayName = component.includes(' as ') ? component : (importInfo.importAs ? `${importName} as ${componentName}` : importName);
            missingImports[modulePath].named.push(displayName);
          } else if (importInfo.type === 'default' && !missingImports[modulePath].default) {
            missingImports[modulePath].default = componentName;
          }
        }
      }
    }
    
    // Check for common state variables
    for (const stateVar of COMMON_STATE_VARIABLES) {
      const regex = new RegExp(`\\b${stateVar}\\b(?!\\s*:)(?!\\s*=)(?!\\s*\\()`, 'g');
      
      if (regex.test(content)) {
        // Check if it's already declared as state
        const stateRegex = new RegExp(`const\\s*\\[\\s*${stateVar}\\s*,\\s*[^\\]]+\\]\\s*=\\s*useState`, 'g');
        const constRegex = new RegExp(`const\\s+${stateVar}\\s*=`, 'g');
        
        if (!stateRegex.test(content) && !constRegex.test(content)) {
          if (stateVar.startsWith('set') && stateVar !== 'setLoading') {
            const baseVar = stateVar.substring(3);
            baseVar.charAt(0).toLowerCase() + baseVar.slice(1);
            missingStateVars.push({ setter: stateVar, base: baseVar.charAt(0).toLowerCase() + baseVar.slice(1) });
          } else if (!stateVar.startsWith('set')) {
            const setter = 'set' + stateVar.charAt(0).toUpperCase() + stateVar.slice(1);
            missingStateVars.push({ base: stateVar, setter });
          }
        }
      }
    }
    
    // Check for common variable initializations
    for (const varInfo of COMMON_VARIABLES) {
      const regex = new RegExp(`\\b${varInfo.name}\\b(?!\\s*:)(?!\\s*=)(?!\\s*\\()`, 'g');
      
      if (regex.test(content)) {
        // Check if it's already initialized
        const initRegex = new RegExp(`const\\s+${varInfo.name}\\s*=`, 'g');
        
        if (!initRegex.test(content)) {
          missingVars.push(varInfo);
        }
      }
    }
    
    // Check for supabase usage without import
    if (content.includes('supabase.') && !content.includes('import') && !content.includes('supabase') && filePath.includes('/services/')) {
      if (!missingImports['@/lib/supabaseClient']) {
        missingImports['@/lib/supabaseClient'] = { named: [], default: 'supabase' };
      }
    }
    
    // Skip if no changes needed
    if (Object.keys(missingImports).length === 0 && missingStateVars.length === 0 && missingVars.length === 0) {
      return false;
    }
    
    console.log(`Processing ${filePath}...`);
    
    // Prepare the import statements to add
    let importsToAdd = '';
    for (const [modulePath, imports] of Object.entries(missingImports)) {
      let importStatement = 'import ';
      
      if (imports.default) {
        importStatement += imports.default;
        if (imports.named.length > 0) {
          importStatement += ', ';
        }
      }
      
      if (imports.named.length > 0) {
        importStatement += `{ ${imports.named.join(', ')} }`;
      }
      
      importStatement += ` from '${modulePath}';\n`;
      importsToAdd += importStatement;
    }
    
    // Prepare state declarations to add
    let stateToAdd = '';
    const uniqueStatePairs = new Map();
    
    missingStateVars.forEach(({ base, setter }) => {
      if (!uniqueStatePairs.has(base)) {
        uniqueStatePairs.set(base, setter);
      }
    });
    
    uniqueStatePairs.forEach((setter, base) => {
      let initialValue = 'false';
      if (base === 'searchTerm' || base.includes('Filter')) {
        initialValue = "''";
      } else if (base === 'formData') {
        initialValue = '{}';
      } else if (base.includes('Inquiries') || base.includes('Properties')) {
        initialValue = '[]';
      }
      
      stateToAdd += `  const [${base}, ${setter}] = useState(${initialValue});\n`;
    });
    
    // Prepare variable initializations to add
    let varsToAdd = '';
    missingVars.forEach(varInfo => {
      varsToAdd += `  ${varInfo.initialization}\n\n`;
    });
    
    // Add the imports at the top
    let updatedContent = content;
    
    if (importsToAdd) {
      // Find the right spot to add imports
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfImports = content.indexOf(';', lastImportIndex) + 1;
        updatedContent = content.substring(0, endOfImports) + '\n' + importsToAdd + content.substring(endOfImports);
      } else {
        updatedContent = importsToAdd + updatedContent;
      }
    }
    
    // Add missing useState declarations after the component function declaration
    if (stateToAdd || varsToAdd) {
      // Look for component function declaration
      const componentRegex = /function\s+\w+\s*\([^)]*\)\s*{|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{/g;
      let match;
      while ((match = componentRegex.exec(updatedContent)) !== null) {
        const openBraceIndex = updatedContent.indexOf('{', match.index) + 1;
        if (openBraceIndex !== -1) {
          // Add state after opening brace
          let insertionPoint = openBraceIndex;
          
          // Find position after opening brace to insert state
          let nextNonWhitespace = openBraceIndex;
          while (nextNonWhitespace < updatedContent.length && /\s/.test(updatedContent[nextNonWhitespace])) {
            nextNonWhitespace++;
          }
          
          if (nextNonWhitespace < updatedContent.length) {
            insertionPoint = nextNonWhitespace;
          }
          
          const prefix = updatedContent.substring(0, insertionPoint);
          const suffix = updatedContent.substring(insertionPoint);
          
          updatedContent = prefix + '\n' + stateToAdd + varsToAdd + suffix;
          break;
        }
      }
    }
    
    // Fix pour useState qui n'est pas importé lorsqu'il est utilisé
    if (updatedContent.includes('useState(') && !updatedContent.includes('{ useState }') && !updatedContent.includes(', useState') && !updatedContent.includes('useState }')) {
      updatedContent = updatedContent.replace(/import React([^;]*);/, 'import React, { useState$1 };');
      if (!updatedContent.includes('useState')) {
        updatedContent = updatedContent.replace(/import React([^;]*);/, 'import React, { useState$1 };');
      }
    }
    
    // Write the updated file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Fixed ${filePath}`);
    
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Walk directory recursively
function walkDir(dir, basePath, callback) {
  const files = fs.readdirSync(dir);
  let count = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      count += walkDir(filePath, basePath, callback);
    } else {
      if (callback(filePath, basePath)) {
        count++;
      }
    }
  });
  
  return count;
}

// Main
const basePath = path.resolve(__dirname, 'src');
console.log('Analysing et correction automatique des fichiers...');
const fixedFilesCount = walkDir(basePath, basePath, processFile);
console.log(`Fixed ${fixedFilesCount} files.`);

// Second pass to fix potential issues introduced by the first pass
console.log('Deuxième passe pour vérifier les corrections...');
const secondPassFixedCount = walkDir(basePath, basePath, processFile);
console.log(`Fixed additional ${secondPassFixedCount} files in second pass.`);

console.log('Processus de correction terminé.');
