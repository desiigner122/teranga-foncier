import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const AttributionForm = ({ onSubmit, users = [], loading = false }) => {
  const [zone, setZone] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [surface, setSurface] = useState('');
  const [description, setDescription] = useState('');
  const [beneficiaire, setBeneficiaire] = useState('');
  const [documents, setDocuments] = useState([]);
  const [coordinates, setCoordinates] = useState('');
  const { toast } = useToast();

  // Génération automatique de la référence (ex: mdZONE1234)
  const reference = zone ? `md${zone.toUpperCase().replace(/\s/g, '')}${Math.floor(1000 + Math.random() * 9000)}` : '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!zone || !localisation || !surface || !beneficiaire) {
      toast({ title: 'Champs obligatoires manquants', description: 'Veuillez remplir tous les champs requis.', variant: 'destructive' });
      return;
    }
    onSubmit && onSubmit({
      reference,
      zone,
      location_name: localisation,
      area_sqm: surface,
      description,
      beneficiary_id: beneficiaire,
      documents,
      coordinates,
      status: 'Attribuée',
      owner_type: 'Mairie',
      legal_status: 'municipal'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      <div>
        <label className="block font-medium mb-1">Zone *</label>
        <Input value={zone} onChange={e => setZone(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Localisation *</label>
        <Input value={localisation} onChange={e => setLocalisation(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Surface (m²) *</label>
        <Input type="number" value={surface} onChange={e => setSurface(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Bénéficiaire *</label>
        <select value={beneficiaire} onChange={e => setBeneficiaire(e.target.value)} required className="w-full border rounded px-2 py-1">
          <option value="">Sélectionner un bénéficiaire</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Description</label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="block font-medium mb-1">Coordonnées géographiques</label>
        <Input value={coordinates} onChange={e => setCoordinates(e.target.value)} placeholder="Latitude, Longitude" />
      </div>
      <div>
        <label className="block font-medium mb-1">Documents officiels</label>
        <Input type="file" multiple onChange={e => setDocuments([...e.target.files])} />
      </div>
      <div>
        <label className="block font-medium mb-1">Référence générée</label>
        <Input value={reference} readOnly className="bg-gray-100" />
      </div>
      <div className="pt-4">
        <Button type="submit" disabled={loading}>Attribuer</Button>
      </div>
    </form>
  );
};

export default AttributionForm;
