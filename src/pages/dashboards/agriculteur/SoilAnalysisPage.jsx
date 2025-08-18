import React from 'react';

// SoilAnalysisPage
// Placeholder pour l'analyse des sols (indices de fertilité, pH, humidité, recommandations cultures)
// TODO: Connecter à une source de données agronomiques + IA recommandations.
const SoilAnalysisPage = () => {
	return (
		<div className="p-6 space-y-4">
			<header>
				<h1 className="text-2xl font-bold">Analyse des Sols</h1>
				<p className="text-sm text-muted-foreground max-w-prose">
					Module en préparation. Vous pourrez bientôt consulter les indicateurs agronomiques
					de vos parcelles et obtenir des recommandations personnalisées.
				</p>
			</header>
			<div className="rounded-md border p-4 bg-card/50">
				<h2 className="font-semibold mb-2">Aucune analyse disponible</h2>
				<p className="text-sm text-muted-foreground">Importez ou sélectionnez une parcelle pour lancer une analyse.</p>
			</div>
		</div>
	);
};

export default SoilAnalysisPage;
