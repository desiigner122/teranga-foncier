import React from 'react';

// ProjectsPage
// Placeholder pour la liste des projets de développement (promoteur)
// TODO: Ajouter intégration données (Supabase), filtres (stade, localisation, budget), actions CRUD.
const ProjectsPage = () => {
	return (
		<div className="p-6 space-y-4">
			<header>
				<h1 className="text-2xl font-bold">Projets de Développement</h1>
				<p className="text-sm text-muted-foreground max-w-prose">
					Cette section présentera vos projets actifs, leur stade, jalons, budget et performances.
					Pour l'instant, il s'agit d'un simple placeholder en attente de connexion aux données réelles.
				</p>
			</header>
			<div className="rounded-md border p-4 bg-card/50">
				<h2 className="font-semibold mb-2">Aucun projet listé</h2>
				<p className="text-sm text-muted-foreground">Créez votre premier projet pour commencer le suivi de développement.</p>
			</div>
		</div>
	);
};

export default ProjectsPage;
