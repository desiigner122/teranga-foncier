# Script PowerShell pour exécuter la correction automatique des erreurs ESLint
# fix-eslint.ps1

# Message de démarrage
Write-Host "🛠️ Correction automatique des erreurs ESLint du projet teranga-foncier" -ForegroundColor Cyan

# Se déplacer dans le répertoire du projet
cd $PSScriptRoot

# Exécuter le script de correction
Write-Host "⚙️ Exécution du script de correction..." -ForegroundColor Yellow
node fix-all-eslint-errors.mjs

# Vérifier si l'exécution a réussi
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Script exécuté avec succès!" -ForegroundColor Green
} else {
    Write-Host "❌ Le script a rencontré des erreurs." -ForegroundColor Red
    exit 1
}

# Exécuter ESLint pour vérifier s'il reste des erreurs
Write-Host "🔍 Vérification des erreurs ESLint restantes..." -ForegroundColor Yellow
npx eslint "src/**/*.{js,jsx}" --max-warnings=0

# Vérifier le résultat d'ESLint
if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Aucune erreur ESLint restante! Le projet est prêt à être buildé." -ForegroundColor Green
} else {
    Write-Host "⚠️ Il reste encore quelques erreurs ESLint à corriger manuellement." -ForegroundColor Yellow
}

# Message de fin
Write-Host "Script terminé." -ForegroundColor Cyan
