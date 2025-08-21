# Script PowerShell pour résoudre tous les problèmes de syntaxe dans le projet Teranga Foncier
# Créé par GitHub Copilot - 20 Août 2025

Write-Host "🔧 Début de la réparation automatique du projet Teranga Foncier..." -ForegroundColor Green

# Fonction pour nettoyer les imports dupliqués
function Fix-DuplicateImports {
    param([string]$filePath)
    
    $content = Get-Content $filePath -Raw
    if ($content -match "import React, \{ useState, \{ useState") {
        Write-Host "  🔨 Correction des imports dupliqués dans: $filePath" -ForegroundColor Yellow
        $newContent = $content -replace "import React, \{ useState, \{ useState, ([^}]+) \} from 'react' \};", "import React, { useState, `$1 } from 'react';"
        Set-Content $filePath $newContent
        return $true
    }
    return $false
}

# Fonction pour nettoyer les variables d'état dupliquées
function Fix-DuplicateStates {
    param([string]$filePath)
    
    $content = Get-Content $filePath -Raw
    $lines = $content -split "`r?`n"
    $newLines = @()
    $stateVariables = @{}
    $modified = $false
    
    foreach ($line in $lines) {
        # Détecter les déclarations useState
        if ($line -match '^\s*const\s+\[(\w+),\s*set\w+\]\s*=\s*useState\(') {
            $varName = $Matches[1]
            if ($stateVariables.ContainsKey($varName)) {
                Write-Host "  🔨 Suppression de la déclaration dupliquée de '$varName' dans: $filePath" -ForegroundColor Yellow
                $modified = $true
                continue
            } else {
                $stateVariables[$varName] = $true
            }
        }
        
        # Ignorer les lignes de commentaires de suppression
        if ($line -match '/\* REMOVED DUPLICATE \*/') {
            $modified = $true
            continue
        }
        
        $newLines += $line
    }
    
    if ($modified) {
        $newContent = $newLines -join "`r`n"
        Set-Content $filePath $newContent
        return $true
    }
    return $false
}

# Fonction pour ajouter les imports manquants
function Fix-MissingImports {
    param([string]$filePath)
    
    $content = Get-Content $filePath -Raw
    $modified = $false
    
    # Vérifier les hooks utilisés
    $hooks = @()
    if ($content -match 'useParams\(') { $hooks += "useParams" }
    if ($content -match 'useNavigate\(') { $hooks += "useNavigate" }
    if ($content -match 'useLocation\(') { $hooks += "useLocation" }
    
    # Ajouter les imports React Router si nécessaire
    if ($hooks.Count -gt 0 -and $content -notmatch "import.*from 'react-router-dom'") {
        $hookImports = $hooks -join ", "
        $importLine = "import { $hookImports } from 'react-router-dom';"
        $content = $content -replace "(import React[^;]+;)", "`$1`n$importLine"
        $modified = $true
        Write-Host "  🔨 Ajout des imports React Router dans: $filePath" -ForegroundColor Yellow
    }
    
    # Ajouter useToast si nécessaire
    if ($content -match 'useToast\(' -and $content -notmatch "useToast.*from") {
        $importLine = "import { useToast } from '../components/ui/use-toast';"
        $content = $content -replace "(import React[^;]+;)", "`$1`n$importLine"
        $modified = $true
        Write-Host "  🔨 Ajout de l'import useToast dans: $filePath" -ForegroundColor Yellow
    }
    
    # Ajouter useAuth si nécessaire
    if ($content -match 'useAuth\(' -and $content -notmatch "useAuth.*from") {
        $importLine = "import { useAuth } from '../context/AuthContext';"
        $content = $content -replace "(import React[^;]+;)", "`$1`n$importLine"
        $modified = $true
        Write-Host "  🔨 Ajout de l'import useAuth dans: $filePath" -ForegroundColor Yellow
    }
    
    if ($modified) {
        Set-Content $filePath $content
        return $true
    }
    return $false
}

# Fonction pour corriger les structures de fonctions malformées
function Fix-MalformedFunctions {
    param([string]$filePath)
    
    $content = Get-Content $filePath -Raw
    $modified = $false
    
    # Corriger les paramètres de fonction malformés avec useState à l'intérieur
    if ($content -match 'const \w+ = \(\{\s*const \[') {
        $content = $content -replace 'const (\w+) = \(\{\s*const \[([^\]]+)\][^}]*\}\) => \{', 'const $1 = ({ children }) => {'
        $modified = $true
        Write-Host "  🔨 Correction de la structure de fonction malformée dans: $filePath" -ForegroundColor Yellow
    }
    
    if ($modified) {
        Set-Content $filePath $content
        return $true
    }
    return $false
}

# Obtenir tous les fichiers JSX
Write-Host "📁 Recherche des fichiers JSX..." -ForegroundColor Blue
$jsxFiles = Get-ChildItem -Path "src" -Recurse -Filter "*.jsx" | Where-Object { $_.FullName -notmatch 'node_modules' }

Write-Host "📊 Trouvé $($jsxFiles.Count) fichiers JSX à analyser" -ForegroundColor Blue

$totalFixed = 0

# Traiter chaque fichier
foreach ($file in $jsxFiles) {
    $fileFixed = $false
    
    Write-Host "`n🔍 Analyse de: $($file.FullName)" -ForegroundColor Cyan
    
    # Appliquer toutes les corrections
    if (Fix-DuplicateImports $file.FullName) { $fileFixed = $true }
    if (Fix-DuplicateStates $file.FullName) { $fileFixed = $true }
    if (Fix-MissingImports $file.FullName) { $fileFixed = $true }
    if (Fix-MalformedFunctions $file.FullName) { $fileFixed = $true }
    
    if ($fileFixed) {
        $totalFixed++
        Write-Host "  ✅ Fichier corrigé: $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "  ⚪ Aucune correction nécessaire: $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host "`n🎉 Réparation terminée!" -ForegroundColor Green
Write-Host "📈 Statistiques:" -ForegroundColor Blue
Write-Host "  - Fichiers analysés: $($jsxFiles.Count)" -ForegroundColor White
Write-Host "  - Fichiers corrigés: $totalFixed" -ForegroundColor White

# Test du build
Write-Host "`n🏗️  Test du build..." -ForegroundColor Blue
try {
    $buildOutput = & npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build réussi!" -ForegroundColor Green
    } else {
        Write-Host "❌ Le build échoue encore." -ForegroundColor Red
        Write-Host "Sortie du build:" -ForegroundColor Yellow
        Write-Host $buildOutput
    }
} catch {
    Write-Host "❌ Erreur lors de l'exécution du build: $_" -ForegroundColor Red
}

Write-Host "`n🎯 Script terminé." -ForegroundColor Magenta
