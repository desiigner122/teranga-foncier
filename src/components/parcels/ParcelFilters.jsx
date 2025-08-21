import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

const ParcelFilters = ({ filters: initialFiltersFromProps, onFilterChange, onResetFilters, parcelCount }) => {
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const [internalFilters, setInternalFilters] = useState({
    search: initialFiltersFromProps.search || '',
    zone: initialFiltersFromProps.zone || 'all',
    status: initialFiltersFromProps.status || 'all',
    minPrice: initialFiltersFromProps.minPrice || '',
    maxPrice: initialFiltersFromProps.maxPrice || '',
    minArea: initialFiltersFromProps.minArea || '',
    maxArea: initialFiltersFromProps.maxArea || '',
    sortBy: initialFiltersFromProps.sortBy || 'date_desc',
    legalStatus: initialFiltersFromProps.legalStatus || 'all',
    serviced: initialFiltersFromProps.serviced || false,
    zoneType: initialFiltersFromProps.zoneType || 'all',
    ownerType: initialFiltersFromProps.ownerType || 'all',
  });

  useEffect(() => {
    setInternalFilters({
      search: initialFiltersFromProps.search || '',
      zone: initialFiltersFromProps.zone || 'all',
      status: initialFiltersFromProps.status || 'all',
      minPrice: initialFiltersFromProps.minPrice || '',
      maxPrice: initialFiltersFromProps.maxPrice || '',
      minArea: initialFiltersFromProps.minArea || '',
      maxArea: initialFiltersFromProps.maxArea || '',
      sortBy: initialFiltersFromProps.sortBy || 'date_desc',
      legalStatus: initialFiltersFromProps.legalStatus || 'all',
      serviced: initialFiltersFromProps.serviced || false,
      zoneType: initialFiltersFromProps.zoneType || 'all',
      ownerType: initialFiltersFromProps.ownerType || 'all',
    });
  }, [initialFiltersFromProps]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInternalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setInternalFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (name, checked) => {
    setInternalFilters(prev => ({ ...prev, [name]: checked }));
  };

  const handleApplyFilters = () => {
    onFilterChange(internalFilters);
  };
  
  const handleClear = () => {
    const clearedFilters = {
      search: '',
      zone: 'all',
      status: 'all',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      sortBy: 'date_desc',
      legalStatus: 'all',
      serviced: false,
      zoneType: 'all',
      ownerType: 'all',
    };
    setInternalFilters(clearedFilters);
    if (onResetFilters) {
      onResetFilters(); 
    } else {
      onFilterChange(clearedFilters);
    }
  };

  const zones = ['Dakar', 'Thiès', 'Mbour', 'Saly', 'Diamniadio', 'Ziguinchor', 'Saint-Louis', 'Kaolack', 'Touba'];
  const legalStatuses = ['Titre Foncier', 'Bail', 'Délibération'];
  const zoneTypes = ['Résidentiel', 'Commercial', 'Agricole', 'Industriel', 'Mixte', 'Touristique'];
  const ownerTypes = ['Particulier', 'Mairie', 'Promoteur', 'Investisseur', 'Bailleur'];
  const sortOptions = [
    { value: 'date_desc', label: 'Plus récents' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
    { value: 'area_asc', label: 'Surface croissante' },
    { value: 'area_desc', label: 'Surface décroissante' },
  ];

  return (
    <aside className="bg-card p-4 rounded-xl border shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary flex items-center">
          <ListFilter className="h-5 w-5 mr-2" /> Filtres & Tri
        </h3>
        <Button variant="ghost" size="icon" onClick={() => setShowFiltersPanel(!showFiltersPanel)} className="md:hidden">
          {showFiltersPanel ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
        </Button>
      </div>

      <div className={`${showFiltersPanel ? 'block' : 'hidden'} md:block space-y-4`}>
        <div>
          <label htmlFor="search" className="text-sm font-medium text-muted-foreground">Recherche</label>
          <div className="relative mt-1">
            <Input
              id="search"
              name="search"
              type="search"
              placeholder="Nom, réf, description..."
              value={internalFilters.search}
              onChange={handleInputChange}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div>
          <label htmlFor="zone" className="text-sm font-medium text-muted-foreground">Zone</label>
          <Select name="zone" value={internalFilters.zone} onValueChange={(value) => handleSelectChange('zone', value)}>
            <SelectTrigger id="zone" className="mt-1">
              <SelectValue placeholder="Toutes les zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les zones</SelectItem>
              {zones.map(zone => <SelectItem key={zone} value={zone}>{zone}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="ownerType" className="text-sm font-medium text-muted-foreground">Type de Vendeur</label>
          <Select name="ownerType" value={internalFilters.ownerType} onValueChange={(value) => handleSelectChange('ownerType', value)}>
            <SelectTrigger id="ownerType" className="mt-1">
              <SelectValue placeholder="Tous types de vendeurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              {ownerTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="minPrice" className="text-sm font-medium text-muted-foreground">Prix Min (FCFA)</label>
            <Input id="minPrice" name="minPrice" type="number" placeholder="Ex: 5M" value={internalFilters.minPrice} onChange={handleInputChange} className="mt-1"/>
          </div>
          <div>
            <label htmlFor="maxPrice" className="text-sm font-medium text-muted-foreground">Prix Max (FCFA)</label>
            <Input id="maxPrice" name="maxPrice" type="number" placeholder="Ex: 50M" value={internalFilters.maxPrice} onChange={handleInputChange} className="mt-1"/>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="minArea" className="text-sm font-medium text-muted-foreground">Surface Min (m²)</label>
            <Input id="minArea" name="minArea" type="number" placeholder="Ex: 150" value={internalFilters.minArea} onChange={handleInputChange} className="mt-1"/>
          </div>
          <div>
            <label htmlFor="maxArea" className="text-sm font-medium text-muted-foreground">Surface Max (m²)</label>
            <Input id="maxArea" name="maxArea" type="number" placeholder="Ex: 1000" value={internalFilters.maxArea} onChange={handleInputChange} className="mt-1"/>
          </div>
        </div>

        <div>
          <label htmlFor="legalStatus" className="text-sm font-medium text-muted-foreground">Statut Juridique</label>
          <Select name="legalStatus" value={internalFilters.legalStatus} onValueChange={(value) => handleSelectChange('legalStatus', value)}>
            <SelectTrigger id="legalStatus" className="mt-1">
              <SelectValue placeholder="Tous statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              {legalStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="zoneType" className="text-sm font-medium text-muted-foreground">Type de Zone</label>
          <Select name="zoneType" value={internalFilters.zoneType} onValueChange={(value) => handleSelectChange('zoneType', value)}>
            <SelectTrigger id="zoneType" className="mt-1">
              <SelectValue placeholder="Tous types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              {zoneTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox id="serviced" checked={internalFilters.serviced} onCheckedChange={(checked) => handleCheckboxChange('serviced', checked)} />
          <Label htmlFor="serviced" className="text-sm font-medium">Terrain Viabilisé</Label>
        </div>

        <div>
          <label htmlFor="sortBy" className="text-sm font-medium text-muted-foreground">Trier par</label>
          <Select name="sortBy" value={internalFilters.sortBy} onValueChange={(value) => handleSelectChange('sortBy', value)}>
            <SelectTrigger id="sortBy" className="mt-1">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button onClick={handleApplyFilters} className="w-full flex-1">Appliquer Filtres</Button>
          <Button onClick={handleClear} variant="outline" className="w-full flex-1">
            <X className="h-4 w-4 mr-1.5"/> Réinitialiser
          </Button>
        </div>
         {parcelCount !== undefined && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            {parcelCount} parcelle(s) correspondante(s)
          </p>
        )}
      </div>
    </aside>
  );
};

export default ParcelFilters;
