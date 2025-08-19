import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Search, RefreshCw, AlertTriangle, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import SupabaseDataService from '@/services/supabaseDataService';
import LoadingSpinner from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';

// NOTE: Uses tables 'transactions' and 'notaire_dossiers'. Basic heuristic scoring.

const DueDiligencePage = () => {
	const { toast } = useToast();
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [transactions, setTransactions] = useState([]);
	const [dossiers, setDossiers] = useState([]);
	const [query, setQuery] = useState('');

	const loadData = async () => {
		setRefreshing(true);
		try {
			const { data: txData, error: txErr } = await SupabaseDataService.supabaseRaw('transactions');
			if (txErr) throw txErr;
			const { data: dossierData, error: dErr } = await SupabaseDataService.supabaseRaw('notaire_dossiers');
			if (dErr) throw dErr;
			setTransactions(txData || []);
			setDossiers(dossierData || []);
		} catch (e) {
			console.error('Erreur chargement diligence:', e);
			toast({ title: 'Erreur', description: 'Données diligence indisponibles.' });
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => { loadData(); }, []);

	const scoreTransaction = (t) => {
		let score = 80; // base
		if (t.status && t.status.toLowerCase().includes('annul')) score -= 40;
		if (!t.documents || t.documents?.length === 0) score -= 15;
		if (t.workflow_step && t.workflow_step.toLowerCase().includes('blocage')) score -= 25;
		return Math.max(0, Math.min(100, score));
	};

	const scoreDossier = (d) => {
		let score = 75;
		if (d.status && d.status.toLowerCase().includes('verif')) score += 5;
		if (d.notes && d.notes.toLowerCase().includes('litige')) score -= 35;
		if (!d.documents || d.documents?.length === 0) score -= 10;
		return Math.max(0, Math.min(100, score));
	};

	const filteredTx = transactions.filter(t => !query || (t.reference || '').toLowerCase().includes(query.toLowerCase()));
	const filteredDossiers = dossiers.filter(d => !query || (d.reference || '').toLowerCase().includes(query.toLowerCase()));

	return (
		<div className="p-6 space-y-6">
			<div className="flex flex-wrap justify-between gap-4 items-center">
				<div>
					<h1 className="text-2xl font-bold flex items-center"><ShieldCheck className="h-7 w-7 mr-2 text-primary"/>Diligence Raisonnable</h1>
					<p className="text-sm text-muted-foreground max-w-prose mt-1">Vue synthétique des transactions et dossiers notariaux avec un score indicatif de risque.</p>
				</div>
				<Button size="sm" variant="outline" onClick={loadData} disabled={refreshing}><RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}/>Rafraîchir</Button>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Recherche</CardTitle>
					<CardDescription>Filtrer par référence.</CardDescription>
				</CardHeader>
				<CardContent className="flex gap-3">
					<div className="relative flex-grow max-w-sm">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input placeholder="Référence..." className="pl-8" value={query} onChange={e => setQuery(e.target.value)} />
					</div>
				</CardContent>
			</Card>

			{loading ? (
				<div className="flex items-center justify-center py-12"><LoadingSpinner size="large" /></div>
			) : (
				<div className="grid md:grid-cols-2 gap-6">
					<Card className="overflow-hidden">
						<CardHeader className="pb-2">
							<CardTitle className="text-lg flex items-center gap-2">Transactions ({filteredTx.length})</CardTitle>
							<CardDescription className="text-xs">Score basé sur statut, documents & workflow.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3 max-h-[500px] overflow-auto pr-2">
							{filteredTx.length === 0 && <p className="text-xs text-muted-foreground">Aucune transaction.</p>}
							{filteredTx.map(t => {
								const score = scoreTransaction(t);
								return (
									<div key={t.id} className="p-3 border rounded-md bg-card/50 hover:bg-card/70 transition-colors">
										<div className="flex justify-between text-sm font-medium">
											<span>{t.reference}</span>
											<Badge variant={score >= 70 ? 'success' : score >= 40 ? 'warning' : 'destructive'} className="text-[10px]">Score {score}</Badge>
										</div>
										<p className="text-xs mt-1 text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3"/> Statut: {t.status || '—'}</p>
										<p className="text-[11px] mt-1 text-muted-foreground line-clamp-2">Workflow: {t.workflow_step || '—'}</p>
									</div>
								);
							})}
						</CardContent>
					</Card>

					<Card className="overflow-hidden">
						<CardHeader className="pb-2">
							<CardTitle className="text-lg flex items-center gap-2">Dossiers Notariaux ({filteredDossiers.length})</CardTitle>
							<CardDescription className="text-xs">Score basé sur statut, notes & documents.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3 max-h-[500px] overflow-auto pr-2">
							{filteredDossiers.length === 0 && <p className="text-xs text-muted-foreground">Aucun dossier.</p>}
							{filteredDossiers.map(d => {
								const score = scoreDossier(d);
								return (
									<div key={d.id} className="p-3 border rounded-md bg-card/50 hover:bg-card/70 transition-colors">
										<div className="flex justify-between text-sm font-medium">
											<span>{d.reference}</span>
											<Badge variant={score >= 70 ? 'success' : score >= 40 ? 'warning' : 'destructive'} className="text-[10px]">Score {score}</Badge>
										</div>
										<p className="text-xs mt-1 text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Statut: {d.status || '—'}</p>
										<p className="text-[11px] mt-1 text-muted-foreground line-clamp-2">Type: {d.type || '—'}</p>
									</div>
								);
							})}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
};

export default DueDiligencePage;
