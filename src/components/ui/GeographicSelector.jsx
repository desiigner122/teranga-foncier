import React, { useState, useEffect } from 'react';
import { Building, Home, MapPin } from 'lucide-react';
import { Label } from '../../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useRealtimeTable } from "../../hooks/useRealtimeTable";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "../../components/ui/table";

const GeographicSelector = ({ 
  value = { region: '', department: '', commune: '' },
  onChange,
  required = false,
  showIcons = true,
  disabled = false
}) => {
  const { data: regions, loading: regionsLoading, error: regionsError, refetch } = useRealtimeTable();
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    if (regions) {
      setFilteredData(regions);
    }
  }, [regions]);
  
  useEffect(() => {
    setRegions(geoUtils.getAllRegions());
  }, []);

  // Charger les départements quand la région change
  useEffect(() => {
    if (value.region) {
      const depts = geoUtils.getDepartmentsByRegion(value.region);
      setDepartments(depts);
      
      // Réinitialiser département et commune si la région change
      if (depts.length > 0 && !depts.find(d => d.code === value.department)) {
        onChange({
          region: value.region,
          department: '',
          commune: ''
        });
      }
    } else {
      setDepartments([]);
      setCommunes([]);
    }
  }, [value.region]);

  // Charger les communes quand le département change
  useEffect(() => {
    if (value.region && value.department) {
      const comms = geoUtils.getCommunesByDepartment(value.region, value.department);
      setCommunes(comms);
      
      // Réinitialiser commune si le département change
      if (comms.length > 0 && !comms.find(c => c.name === value.commune)) {
        onChange({
          region: value.region,
          department: value.department,
          commune: ''
        });
      }
    } else {
      setCommunes([]);
    }
  }, [value.department]);

  const handleRegionChange = (regionCode) => {
    onChange({
      region: regionCode,
      department: '',
      commune: ''
    });
  };

  const handleDepartmentChange = (departmentCode) => {
    onChange({
      region: value.region,
      department: departmentCode,
      commune: ''
    });
  };

  const handleCommuneChange = (communeName) => {
    onChange({
      region: value.region,
      department: value.department,
      commune: communeName
    });
  };

  return (
    <div className="space-y-4">
      {/* Région */}
      <div>
        <Label htmlFor="region" className="flex items-center gap-2">
          {showIcons && <MapPin className="h-4 w-4" />}
          Région {required && <span className="text-red-500">*</span>}
        </Label>
        <Select 
          value={value.region} 
          onValueChange={handleRegionChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une région" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.code} value={region.code}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Département */}
      <div>
        <Label htmlFor="department" className="flex items-center gap-2">
          {showIcons && <Building className="h-4 w-4" />}
          Département {required && <span className="text-red-500">*</span>}
        </Label>
        <Select 
          value={value.department} 
          onValueChange={handleDepartmentChange}
          disabled={disabled || !value.region}
        >
          <SelectTrigger>
            <SelectValue placeholder={value.region ? "Sélectionnez un département" : "Sélectionnez d'abord une région"} />
          </SelectTrigger>
          <SelectContent>
            {departments.map((department) => (
              <SelectItem key={department.code} value={department.code}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Commune */}
      <div>
        <Label htmlFor="commune" className="flex items-center gap-2">
          {showIcons && <Home className="h-4 w-4" />}
          Commune {required && <span className="text-red-500">*</span>}
        </Label>
        <Select 
          value={value.commune} 
          onValueChange={handleCommuneChange}
          disabled={disabled || !value.department}
        >
          <SelectTrigger>
            <SelectValue placeholder={value.department ? "Sélectionnez une commune" : "Sélectionnez d'abord un département"} />
          </SelectTrigger>
          <SelectContent>
            {communes.map((commune) => (
              <SelectItem key={commune.name} value={commune.name}>
                {commune.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Aperçu de la sélection */}
      {value.region && value.department && value.commune && (
        <div className="mt-2 p-3 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground">
            <strong>Localisation :</strong> {value.commune}, {departments.find(d => d.code === value.department)?.name}, {regions.find(r => r.code === value.region)?.name}
          </p>
        </div>
      )}
    </div>
  );
};

export default GeographicSelector;
