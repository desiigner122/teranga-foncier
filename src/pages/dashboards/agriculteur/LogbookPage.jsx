import React from 'react';

// LogbookPage
// Journal d'exploitation agricole : interventions, traitements, observations.
// TODO: Ajouter formulaire d'ajout d'entrée, filtres par parcelle/date, export PDF.
const LogbookPage = () => {
	return (
		<div className="p-6 space-y-4">
			<header>
				<h1 className="text-2xl font-bold">Journal d'Exploitation</h1>
				<p className="text-sm text-muted-foreground max-w-prose">
					Historique des activités agricoles. Cette zone affichera bientôt les opérations
					(semis, irrigation, traitements, récoltes) avec suivi des coûts et impacts.
				</p>
			</header>
			<div className="rounded-md border p-4 bg-card/50">
				<h2 className="font-semibold mb-2">Aucune entrée pour le moment</h2>
				<p className="text-sm text-muted-foreground">Ajoutez vos premières interventions pour construire un historique fiable.</p>
			</div>
		</div>
	);
};

export default LogbookPage;
