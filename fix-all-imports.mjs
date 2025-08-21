// Script pour corriger automatiquement les problèmes d'importation
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des corrections à appliquer
const fixConfigs = [
  // Problème 1: Correction des imports de supabaseClient
  {
    files: [
      'src/pages/dashboards/NotairesDashboard.jsx',
      'src/pages/dashboards/AgriculteurDashboard.jsx',
      'src/pages/dashboards/BanqueDashboard.jsx',
      'src/pages/dashboards/PromoteurDashboard.jsx',
      // Ajoutez d'autres fichiers ici si nécessaire
    ],
    replacements: [
      {
        from: /import supabase from ['"]\.\.\/lib\/supabaseClient['"];/g,
        to: 'import supabase from "../../lib/supabaseClient";'
      }
    ]
  },
  
  // Problème 2: Ajout des imports manquants pour NotairesDashboard.jsx
  {
    files: ['src/pages/dashboards/NotairesDashboard.jsx'],
    replacements: [
      {
        from: /import React, { useState, useEffect } from 'react';[\s\S]*?import { motion } from 'framer-motion';/,
        to: `import React, { useState, useEffect } from 'react';
import { User, Gavel, Eye, Search, CheckCircle, TrendingUp, Calendar, MapPin, FileText, Brain, Zap, FileDown, FileClock, History, Scale, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Textarea } from '../../components/ui/textarea';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import supabase from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { hybridAI } from '../../lib/aiService';
import { AIAssistantWidget } from '../../components/AIAssistantWidget';
import { AntiFraudDashboard } from '../../components/AntiFraudDashboard';`
      }
    ]
  },
  
  // Problème 3: Ajout des imports manquants pour AdminParcelsPage.jsx
  {
    files: ['src/pages/admin/AdminParcelsPage.jsx'],
    replacements: [
      {
        // Vérifier et ajouter l'import useToast s'il est manquant
        from: /import React,[\s\S]*?from 'react';/,
        to: (match) => {
          if (!match.includes('useToast')) {
            return match + '\nimport { useToast } from "../../hooks/useToast";';
          }
          return match;
        }
      }
    ]
  },
  
  // Problème 4: Ajout des imports manquants pour AgriculteurDashboard.jsx
  {
    files: ['src/pages/dashboards/AgriculteurDashboard.jsx'],
    replacements: [
      {
        // Ajouter imports pour useAuth et useNavigate s'ils sont manquants
        from: /import React,[\s\S]*?from 'react';/,
        to: (match) => {
          let newMatch = match;
          if (!match.includes('useAuth')) {
            newMatch += '\nimport { useAuth } from "../../contexts/AuthContext";';
          }
          if (!match.includes('useNavigate')) {
            newMatch += '\nimport { useNavigate } from "react-router-dom";';
          }
          return newMatch;
        }
      }
    ]
  },
  
  // Problème 5: Ajout des imports manquants pour BanqueDashboard.jsx
  {
    files: ['src/pages/dashboards/BanqueDashboard.jsx'],
    replacements: [
      {
        // Ajouter imports pour useToast et useAuth s'ils sont manquants
        from: /import React,[\s\S]*?from 'react';/,
        to: (match) => {
          let newMatch = match;
          if (!match.includes('useToast')) {
            newMatch += '\nimport { useToast } from "../../hooks/useToast";';
          }
          if (!match.includes('useAuth')) {
            newMatch += '\nimport { useAuth } from "../../contexts/AuthContext";';
          }
          return newMatch;
        }
      }
    ]
  }
];

// Fonction pour lire le contenu d'un fichier
function readFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    console.error(`Erreur lors de la lecture du fichier ${filePath}:`, error);
    return null;
  }
}

// Fonction pour écrire dans un fichier
function writeFile(filePath, content) {
  const fullPath = path.join(__dirname, filePath);
  try {
    fs.writeFileSync(fullPath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'écriture dans le fichier ${filePath}:`, error);
    return false;
  }
}

// Fonction pour appliquer les corrections
function applyFixes() {
  let totalFixed = 0;
  
  for (const config of fixConfigs) {
    for (const filePath of config.files) {
      const content = readFile(filePath);
      if (!content) continue;
      
      let newContent = content;
      let fileFixed = false;
      
      for (const replacement of config.replacements) {
        const { from, to } = replacement;
        
        if (typeof to === 'function') {
          const matches = newContent.match(from);
          if (matches) {
            newContent = newContent.replace(from, to(matches[0]));
            fileFixed = true;
          }
        } else {
          const oldContent = newContent;
          newContent = newContent.replace(from, to);
          fileFixed = fileFixed || oldContent !== newContent;
        }
      }
      
      if (fileFixed) {
        if (writeFile(filePath, newContent)) {
          console.log(`✅ Fixé: ${filePath}`);
          totalFixed++;
        }
      } else {
        console.log(`ℹ️ Pas de modification nécessaire: ${filePath}`);
      }
    }
  }
  
  return totalFixed;
}

// Exécuter les corrections
const fixedCount = applyFixes();
console.log(`\n🎉 Terminé! ${fixedCount} fichier(s) corrigé(s).`);
