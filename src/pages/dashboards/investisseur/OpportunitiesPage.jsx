import React from 'react';

// OpportunitiesPage
// Cette page liste les opportunités d'investissement détectées (placeholder initial)
// TODO: Brancher aux données réelles (API / Supabase) + filtres (rendement, risque, localisation)
const OpportunitiesPage = () => {
	return (
		<div className="p-6 space-y-4">
			<header>
				<h1 className="text-2xl font-bold">Opportunités d'Investissement</h1>
				<p className="text-sm text-muted-foreground max-w-prose">
					Aperçu préliminaire des opportunités. Cette section sera enrichie avec des
					analyses de marché, scores de risque, rendement estimé et suggestions générées par l'IA.
				</p>
			</header>
			<div className="rounded-md border p-4 bg-card/50">
				<h2 className="font-semibold mb-2">Aucune donnée active</h2>
				<p className="text-sm text-muted-foreground">
					Le module de sourcing d'opportunités n'est pas encore connecté. Ajoutez une intégration ou chargez des données tests.
				</p>
			</div>
		</div>
	);
};

export default OpportunitiesPage;
