#!/usr/bin/env node

/**
 * Ce script corrige spécifiquement les importations manquantes de supabase
 * dans les fichiers de services
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processServiceFile(filePath) {
  try {
    if (!filePath.includes('/services/') && !filePath.includes('\\services\\')) {
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file uses supabase but doesn't import it
    if (content.includes('supabase.') && !content.includes('import') && !content.includes('supabase')) {
      console.log(`Processing ${filePath}...`);
      
      // Add import at the top
      const importStatement = "import supabase from '../lib/supabaseClient';\n\n";
      const updatedContent = importStatement + content;
      
      // Write the updated file
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Fixed ${filePath}`);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Walk directory recursively
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  let count = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      count += walkDir(filePath, callback);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      if (callback(filePath)) {
        count++;
      }
    }
  });
  
  return count;
}

// Main
const basePath = path.resolve(__dirname, 'src');
console.log('Fixing supabase imports in service files...');
const fixedFilesCount = walkDir(basePath, processServiceFile);
console.log(`Fixed ${fixedFilesCount} service files.`);
