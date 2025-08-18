import React from 'react';

// DueDiligencePage
// Placeholder pour les contrôles de diligence raisonnable sur des actifs / parcelles
// TODO: Intégrer vérifications juridiques, historiques de transactions, risques, conformité.
const DueDiligencePage = () => {
	return (
		<div className="p-6 space-y-4">
			<header>
				<h1 className="text-2xl font-bold">Diligence Raisonnable</h1>
				<p className="text-sm text-muted-foreground max-w-prose">
					Module en préparation. Ici s'afficheront les indicateurs de risques, anomalies
					détectées, historiques, vérifications contractuelles et signaux IA.
				</p>
			</header>
			<section className="rounded-md border p-4 bg-card/50">
				<h2 className="font-semibold mb-2">Aucune analyse disponible</h2>
				<p className="text-sm text-muted-foreground">Chargez une parcelle ou une opportunité pour lancer une évaluation.</p>
			</section>
		</div>
	);
};

export default DueDiligencePage;
