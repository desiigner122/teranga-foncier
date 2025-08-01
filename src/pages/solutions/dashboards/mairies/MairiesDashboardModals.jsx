import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle, Banknote, Clock, MessageSquare } from 'lucide-react';

const checklistItems = [
    { id: 'check-dossier', label: 'Dossier complet vérifié' },
    { id: 'check-technique', label: 'Avis technique favorable' },
    { id: 'check-commission', label: 'Passage en commission' },
    { id: 'check-signature', label: 'En attente de signature Maire' },
];

const formatPrice = (price) => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(price);

export const InstructionModal = ({ content, onDecision, onAction, onClose, onContact }) => {
  const { request, user } = content.data;
  const [updateNote, setUpdateNote] = useState("");
  const [checkedItems, setCheckedItems] = useState({});

  const requiredPayments = request.payments || [];
  const allPaymentsDone = requiredPayments.every(p => p.status === 'Payé');

  const handleDecisionClick = (decision) => {
    if (decision === 'Approuvé' && !allPaymentsDone) {
      onAction("Paiement Requis", "L'approbation est impossible car tous les frais n'ont pas été réglés par l'acheteur.");
      return;
    }

    const noteWithChecklist = `
      ${updateNote}
      ---
      Checklist:
      ${checklistItems.map(item => `- [${checkedItems[item.id] ? 'x' : ' '}] ${item.label}`).join('\n')}
    `;
    onDecision(decision, noteWithChecklist.trim());
  }

  const handleCheckboxChange = (id, checked) => {
    setCheckedItems(prev => ({ ...prev, [id]: checked }));
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{content.title}</DialogTitle>
        <DialogDescription>{content.description}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4 text-sm max-h-[60vh] overflow-y-auto pr-2">
        <p><span className="font-semibold">Demandeur:</span> {user?.name} (<span className="text-muted-foreground">{user?.email}</span>)</p>
        {request.parcel_id && <p><span className="font-semibold">Parcelle:</span> <Link to={`/parcelles/${request.parcel_id}`} className="text-primary underline">{request.parcel_id}</Link></p>}
        <p><span className="font-semibold">Message du demandeur:</span></p>
        <blockquote className="border-l-2 pl-4 italic text-muted-foreground">{request.message || "Aucun message."}</blockquote>
        
        <div className="space-y-2 pt-2">
            <h4 className="font-semibold">Paiements Associés</h4>
            {requiredPayments.length > 0 ? (
                <div className="space-y-2 rounded-md border p-3">
                    {requiredPayments.map(p => (
                        <div key={p.id} className="flex justify-between items-center">
                            <span className="flex items-center">
                                {p.status === 'Payé' 
                                  ? <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                  : <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                                }
                                {p.description} ({formatPrice(p.amount)})
                            </span>
                             <Badge variant={p.status === 'Payé' ? 'success' : 'warning'}>{p.status}</Badge>
                        </div>
                    ))}
                </div>
            ) : <p className="text-xs text-muted-foreground">Aucun paiement requis pour ce type de demande.</p>}
        </div>

        <div className="space-y-2 pt-2">
          <h4 className="font-semibold">Checklist d'Instruction</h4>
          <div className="space-y-2 rounded-md border p-3">
            {checklistItems.map(item => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={item.id} 
                  onCheckedChange={(checked) => handleCheckboxChange(item.id, checked)}
                />
                <Label htmlFor={item.id} className="text-sm font-normal">{item.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Label htmlFor="update-note">Note pour l'acheteur (Optionnel)</Label>
          <Textarea id="update-note" value={updateNote} onChange={(e) => setUpdateNote(e.target.value)} placeholder="Ex: Dossier complet, en attente de validation finale." />
        </div>

        {!allPaymentsDone && (
            <div className="flex items-center gap-2 p-3 text-yellow-800 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-5 w-5"/>
                <p className="text-xs font-medium">L'approbation finale n'est possible qu'après le règlement de tous les frais par l'acheteur.</p>
            </div>
        )}
      </div>
      <DialogFooter className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-4 border-t">
          <Button type="button" variant="outline" className="w-full sm:col-span-1" onClick={onContact}>
             <MessageSquare className="h-4 w-4 mr-2"/> Contacter
          </Button>
          <Button type="button" variant="destructive" className="w-full sm:col-span-1" onClick={() => handleDecisionClick('Rejeté')}>Rejeter</Button>
          <Button type="button" className="w-full sm:col-span-1" onClick={() => handleDecisionClick('En instruction')}>Mettre à jour</Button>
          <Button type="button" className="w-full sm:col-span-1" onClick={() => handleDecisionClick('Approuvé')} disabled={!allPaymentsDone}>Approuver</Button>
      </DialogFooter>
    </>
  );
};

export const AttributionModal = ({ content, municipalParcels, attributionParcel, setAttributionParcel, onAttribution, onDecision, onClose, onContact }) => {
  const { request } = content.data;
  return (
    <>
      <DialogHeader>
        <DialogTitle>{content.title}</DialogTitle>
        <DialogDescription>{content.description}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4 text-sm">
        <p><span className="font-semibold">Motivation:</span> {request.message}</p>
        <div className="space-y-2 pt-2">
          <Label htmlFor="parcel-attribution">Sélectionner une parcelle communale disponible</Label>
          <Select name="parcel-attribution" value={attributionParcel} onValueChange={setAttributionParcel}>
            <SelectTrigger id="parcel-attribution">
              <SelectValue placeholder="Choisir une parcelle à attribuer" />
            </SelectTrigger>
            <SelectContent>
              {municipalParcels.filter(p => p.status === 'Disponible').map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name} ({p.area_sqm} m²)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button type="button" variant="outline" className="w-full" onClick={onContact}>
          <MessageSquare className="h-4 w-4 mr-2"/> Contacter
        </Button>
        <Button type="button" variant="destructive" className="w-full" onClick={() => onDecision('Rejetée')}>Rejeter</Button>
        <Button type="button" className="w-full" onClick={onAttribution}>Attribuer</Button>
      </DialogFooter>
    </>
  );
};


export const GenericActionModal = ({ content, onClose }) => {
    if (!content) return null;
    return (
      <>
        <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
            {content.data?.isError ? <AlertCircle className="text-destructive"/> : <CheckCircle className="text-primary"/>}
            {content.title}
        </DialogTitle>
        {content.description && <DialogDescription>{content.description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
        <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </>
    )
};