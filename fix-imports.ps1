# Script pour corriger les problèmes d'importation
# PowerShell script

# Se déplacer dans le répertoire du projet
cd $PSScriptRoot

# Exécuter le script de correction
Write-Host "⚙️ Exécution des corrections automatiques..." -ForegroundColor Yellow
node fix-all-imports.mjs

# Vérifier si les corrections ont été appliquées avec succès
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Corrections appliquées avec succès!" -ForegroundColor Green
    
    # Exécuter un nouveau build pour vérifier
    Write-Host "🔄 Exécution du build pour vérifier les corrections..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 Build réussi! Toutes les erreurs d'importation ont été corrigées." -ForegroundColor Green
    } else {
        Write-Host "⚠️ Le build a échoué. D'autres problèmes pourraient nécessiter une correction manuelle." -ForegroundColor Red
    }
} else {
    Write-Host "❌ Erreur lors de l'application des corrections." -ForegroundColor Red
}
