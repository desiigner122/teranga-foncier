import React, { useEffect, useState } from 'react';
// NOTE: Requires table market_predictions (ai_real_data_schema.sql) and investments table (investments)

const OpportunitiesPage = () => {
	const { toast } = useToast();
	const { data: predictions, loading: predictionsLoading, error: predictionsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  // Chargement géré par les hooks temps réel

	const filtered = predictions.filter(p => {
		if (locationFilter !== 'all' && p.location !== locationFilter) return false;
		if (typeFilter !== 'all' && p.property_type !== typeFilter) return false;
		if (minROI && p.predicted_price_per_sqm && Number(minROI) > p.predicted_price_per_sqm) return false; // simplistic filter placeholder
		return true;
	});

	const uniqueLocations = Array.from(new Set(predictions.map(p => p.location))).slice(0,25);
	const uniqueTypes = Array.from(new Set(predictions.map(p => p.property_type).filter(Boolean))).slice(0,25);

	return (
		<div className="p-6 space-y-6">
			<div className="flex flex-wrap justify-between gap-4 items-center">
				<div>
					<h1 className="text-2xl font-bold flex items-center"><TrendingUp className="h-7 w-7 mr-2 text-primary"/>Opportunités d'Investissement</h1>
					<p className="text-sm text-muted-foreground max-w-prose mt-1">Suggestions basées sur les prédictions de marché et signaux agrégés. Filtrez pour affiner.</p>
				</div>
				<Button variant="outline" size="sm" onClick={loadData} disabled={refreshing} className="flex items-center"><RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}/>Rafraîchir</Button>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Filtres</CardTitle>
					<CardDescription>Affinez la liste des opportunités.</CardDescription>
				</CardHeader>
				<CardContent className="grid md:grid-cols-5 gap-3">
					<div className="col-span-2">
						<label className="text-xs font-medium mb-1 block">Localisation</label>
						<Select value={locationFilter} onValueChange={setLocationFilter}>
							<SelectTrigger className="h-9"><SelectValue placeholder="Localisation" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Toutes</SelectItem>
								{uniqueLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
							</SelectContent>
						</Select>
					</div>
					<div className="col-span-2">
						<label className="text-xs font-medium mb-1 block">Type</label>
						<Select value={typeFilter} onValueChange={setTypeFilter}>
							<SelectTrigger className="h-9"><SelectValue placeholder="Type" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tous</SelectItem>
								{uniqueTypes.map(t => <SelectItem key={t} value={t}>{t || 'N/A'}</SelectItem>)}
							</SelectContent>
						</Select>
					</div>
					<div>
						<label className="text-xs font-medium mb-1 block">Prix min/m² (prévision)</label>
						<Input value={minROI} onChange={e => setMinROI(e.target.value)} placeholder="Ex: 150000" className="h-9" />
					</div>
				</CardContent>
			</Card>

			{loading ? (
				<div className="flex items-center justify-center py-12"><LoadingSpinner size="large"/></div>
			) : filtered.length === 0 ? (
				<Card className="border-dashed"><CardContent className="py-10 text-center text-sm text-muted-foreground">Aucune opportunité ne correspond aux filtres.</CardContent></Card>
			) : (
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
					{filtered.map(pred => (
						<Card key={pred.id} className="hover:shadow-md transition-shadow">
							<CardHeader className="pb-2">
								<CardTitle className="text-lg flex items-center justify-between">
									<span>{pred.location}</span>
									<Badge variant="secondary" className="text-xs">{pred.property_type || 'Type'}</Badge>
								</CardTitle>
								<CardDescription className="text-xs">Créé le {new Date(pred.created_at).toLocaleDateString('fr-FR')}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								<div className="flex justify-between"><span>Prix prévisionnel m²</span><strong>{pred.predicted_price_per_sqm ? new Intl.NumberFormat('fr-FR').format(pred.predicted_price_per_sqm) + ' XOF' : '—'}</strong></div>
								<div className="flex justify-between"><span>Confiance</span><strong>{pred.confidence_score ? (pred.confidence_score * 100).toFixed(0) + '%' : '—'}</strong></div>
								<div className="flex justify-between"><span>Facteurs</span><span className="truncate max-w-[140px] text-xs text-muted-foreground">{pred.factors ? Object.keys(pred.factors).slice(0,3).join(', ') : '—'}</span></div>
								<Button size="sm" variant="outline" className="w-full mt-3">Analyser</Button>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
};

export default OpportunitiesPage;
