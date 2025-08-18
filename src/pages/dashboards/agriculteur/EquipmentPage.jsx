import React from 'react';

// EquipmentPage
// Gestion du matériel agricole (inventaire, maintenance, disponibilité)
// TODO: Ajouter liste dynamique, plan de maintenance, alertes d'usure.
const EquipmentPage = () => {
	return (
		<div className="p-6 space-y-4">
			<header>
				<h1 className="text-2xl font-bold">Matériel & Équipement</h1>
				<p className="text-sm text-muted-foreground max-w-prose">
					Suivi de votre inventaire matériel prochainement disponible : état, dernière maintenance,
					prochaine intervention et affectation aux parcelles.
				</p>
			</header>
			<div className="rounded-md border p-4 bg-card/50">
				<h2 className="font-semibold mb-2">Inventaire vide</h2>
				<p className="text-sm text-muted-foreground">Ajoutez un premier équipement pour démarrer le suivi.</p>
			</div>
		</div>
	);
};

export default EquipmentPage;
