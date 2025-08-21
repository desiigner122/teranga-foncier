#!/bin/bash
# Script pour corriger les problèmes d'importation
# Shell script pour Linux/macOS

# Se déplacer dans le répertoire du script
cd "$(dirname "$0")"

# Exécuter le script de correction
echo -e "\033[33m⚙️ Exécution des corrections automatiques...\033[0m"
node fix-all-imports.mjs

# Vérifier si les corrections ont été appliquées avec succès
if [ $? -eq 0 ]; then
    echo -e "\033[32m✅ Corrections appliquées avec succès!\033[0m"
    
    # Exécuter un nouveau build pour vérifier
    echo -e "\033[33m🔄 Exécution du build pour vérifier les corrections...\033[0m"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "\033[32m🎉 Build réussi! Toutes les erreurs d'importation ont été corrigées.\033[0m"
    else
        echo -e "\033[31m⚠️ Le build a échoué. D'autres problèmes pourraient nécessiter une correction manuelle.\033[0m"
    fi
else
    echo -e "\033[31m❌ Erreur lors de l'application des corrections.\033[0m"
fi
