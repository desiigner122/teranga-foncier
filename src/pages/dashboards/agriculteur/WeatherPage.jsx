import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

const weatherData = {
  'Champ Kagnout 1': { temp: '31°C', humidity: '65%', wind: '12 km/h NE', forecast: 'Ensoleillé avec passages nuageux.' },
  'Verger Anacardiers Bignona': { temp: '32°C', humidity: '70%', wind: '10 km/h E', forecast: 'Risque d\'averses en soirée.' },
  'Maraîchage Niayes': { temp: '28°C', humidity: '75%', wind: '20 km/h O', forecast: 'Ciel voilé, vent frais.' },
};

const WeatherPage = () => {
  
  const [loading, setLoading] = useState(false);
const [selectedParcel, setSelectedParcel] = useState('Champ Kagnout 1');
  // Loading géré par le hook temps réel

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const currentWeatherData = weatherData[selectedParcel];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold flex items-center"><CloudSun className="mr-3 h-8 w-8"/>Météo Agricole</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Prévisions par Parcelle</CardTitle>
          <Select value={selectedParcel} onValueChange={setSelectedParcel}>
            <SelectTrigger className="w-[280px] mt-2">
              <SelectValue placeholder="Sélectionner une parcelle" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(weatherData).map(parcelName => (
                <SelectItem key={parcelName} value={parcelName}>{parcelName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200">{selectedParcel}</h2>
            <p className="text-lg text-blue-600 dark:text-blue-300">{currentWeatherData.forecast}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-center">
              <div className="p-4 bg-white dark:bg-background rounded-lg">
                <Thermometer className="h-6 w-6 mx-auto text-red-500"/>
                <p className="font-bold text-xl">{currentWeatherData.temp}</p>
                <p className="text-sm text-muted-foreground">Température</p>
              </div>
              <div className="p-4 bg-white dark:bg-background rounded-lg">
                <Droplets className="h-6 w-6 mx-auto text-blue-500"/>
                <p className="font-bold text-xl">{currentWeatherData.humidity}</p>
                <p className="text-sm text-muted-foreground">Humidité</p>
              </div>
              <div className="p-4 bg-white dark:bg-background rounded-lg">
                <Wind className="h-6 w-6 mx-auto text-gray-500"/>
                <p className="font-bold text-xl">{currentWeatherData.wind}</p>
                <p className="text-sm text-muted-foreground">Vent</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WeatherPage;
