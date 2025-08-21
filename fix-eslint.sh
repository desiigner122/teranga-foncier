#!/bin/bash
# Script Shell pour exécuter la correction automatique des erreurs ESLint
# fix-eslint.sh

# Couleurs pour le terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Message de démarrage
echo -e "${CYAN}🛠️ Correction automatique des erreurs ESLint du projet teranga-foncier${NC}"

# Se déplacer dans le répertoire du script
cd "$(dirname "$0")"

# Exécuter le script de correction
echo -e "${YELLOW}⚙️ Exécution du script de correction...${NC}"
node fix-all-eslint-errors.mjs

# Vérifier si l'exécution a réussi
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Script exécuté avec succès!${NC}"
else
    echo -e "${RED}❌ Le script a rencontré des erreurs.${NC}"
    exit 1
fi

# Exécuter ESLint pour vérifier s'il reste des erreurs
echo -e "${YELLOW}🔍 Vérification des erreurs ESLint restantes...${NC}"
npx eslint "src/**/*.{js,jsx}" --max-warnings=0

# Vérifier le résultat d'ESLint
if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Aucune erreur ESLint restante! Le projet est prêt à être buildé.${NC}"
else
    echo -e "${YELLOW}⚠️ Il reste encore quelques erreurs ESLint à corriger manuellement.${NC}"
fi

# Message de fin
echo -e "${CYAN}Script terminé.${NC}"
