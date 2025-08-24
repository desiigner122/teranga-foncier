import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

// Utilitaire pour générer la référence
function generateReference(type, zone, vendeur, uniqueId) {
  if (type === 'mairie') {
    return `md${zone ? zone.toUpperCase().replace(/\s/g, '') : ''}${uniqueId}`;
  }
  if (type === 'vendeur') {
    return `${vendeur ? vendeur.toUpperCase().replace(/\s/g, '') : 'VENDEUR'}${uniqueId}`;
  }
  return `REF${uniqueId}`;
}

const ParcelForm = ({ initialData = {}, onSubmit, userRole }) => {
  const [type, setType] = useState(initialData.type || 'mairie');
  const [zone, setZone] = useState(initialData.zone || '');
  const [vendeur, setVendeur] = useState(initialData.vendeur || '');
  const [nom, setNom] = useState(initialData.name || '');
  const [localisation, setLocalisation] = useState(initialData.location_name || '');
  const [coordinates, setCoordinates] = useState(initialData.coordinates || '');
  const [surface, setSurface] = useState(initialData.area || '');
  const [prix, setPrix] = useState(initialData.price || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [statut, setStatut] = useState(initialData.status || 'disponible');
  const [images, setImages] = useState(initialData.images || []);
  const [documents, setDocuments] = useState(initialData.documents || []);
  const [statutVerif, setStatutVerif] = useState(initialData.documentStatus || 'En attente');
  const [proprietaireType, setProprietaireType] = useState(initialData.ownerType || 'Propriétaire');
  const [uniqueId] = useState(initialData.id || Math.floor(1000 + Math.random() * 9000));
  const { toast } = useToast();

  // Génération automatique de la référence
  const reference = generateReference(type, zone, vendeur, uniqueId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nom || !zone || !localisation || !surface || !prix) {
      toast({ title: 'Champs obligatoires manquants', description: 'Veuillez remplir tous les champs requis.', variant: 'destructive' });
      return;
    }
    onSubmit && onSubmit({
      type, zone, vendeur, name: nom, location_name: localisation, coordinates, area: surface, price: prix, description, status: statut, images, documents, documentStatus: statutVerif, ownerType: proprietaireType, reference, id: uniqueId
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      <div>
        <label className="block font-medium mb-1">Type de parcelle *</label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mairie">Mairie</SelectItem>
            <SelectItem value="vendeur">Vendeur</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {type === 'vendeur' && (
        <div>
          <label className="block font-medium mb-1">Nom du vendeur *</label>
          <Input value={vendeur} onChange={e => setVendeur(e.target.value)} required={type==='vendeur'} />
        </div>
      )}
      <div>
        <label className="block font-medium mb-1">Nom *</label>
        <Input value={nom} onChange={e => setNom(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Référence (titre foncier)</label>
        <Input value={reference} readOnly className="bg-gray-100" />
      </div>
      <div>
        <label className="block font-medium mb-1">Zone *</label>
        <Input value={zone} onChange={e => setZone(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Localisation *</label>
        <Input value={localisation} onChange={e => setLocalisation(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Coordonnées géographiques</label>
        <Input value={coordinates} onChange={e => setCoordinates(e.target.value)} placeholder="Latitude, Longitude" />
      </div>
      <div>
        <label className="block font-medium mb-1">Surface (m²) *</label>
        <Input type="number" value={surface} onChange={e => setSurface(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Prix *</label>
        <Input type="number" value={prix} onChange={e => setPrix(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Description</label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="block font-medium mb-1">Statut</label>
        <Select value={statut} onValueChange={setStatut}>
          <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="disponible">Disponible</SelectItem>
            <SelectItem value="vendu">Vendu</SelectItem>
            <SelectItem value="réservé">Réservé</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block font-medium mb-1">Images</label>
        <Input type="file" multiple onChange={e => setImages([...e.target.files])} />
      </div>
      <div>
        <label className="block font-medium mb-1">Documents</label>
        <Input type="file" multiple onChange={e => setDocuments([...e.target.files])} />
      </div>
      <div>
        <label className="block font-medium mb-1">Statut de vérification</label>
        <Select value={statutVerif} onValueChange={setStatutVerif}>
          <SelectTrigger><SelectValue placeholder="Statut de vérification" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Vérifié">Vérifié</SelectItem>
            <SelectItem value="En attente">En attente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block font-medium mb-1">Type de propriétaire</label>
        <Input value={proprietaireType} onChange={e => setProprietaireType(e.target.value)} />
      </div>
      <div className="pt-4">
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
  );
};

export default ParcelForm;
