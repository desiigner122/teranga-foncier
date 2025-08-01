import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  React.useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng]);
    }
  }, [lat, lng, map]);
  return null;
};

const ParcelLocationCard = ({ coordinates, locationName }) => {
  const position = coordinates ? [coordinates.lat, coordinates.lng] : null;

  if (!position) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><MapPin className="mr-2 h-5 w-5"/>Localisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded flex items-center justify-center text-muted-foreground">
            Coordonnées de localisation non disponibles.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><MapPin className="mr-2 h-5 w-5"/>Localisation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <Marker position={position}>
              <Popup>
                {locationName || 'Emplacement de la parcelle'}
              </Popup>
            </Marker>
            <RecenterAutomatically lat={position[0]} lng={position[1]} />
          </MapContainer>
        </div>
        <p className="text-sm mt-2 text-muted-foreground">Zone: {locationName}</p>
      </CardContent>
    </Card>
  );
};

export default ParcelLocationCard;