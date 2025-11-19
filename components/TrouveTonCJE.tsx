
import React, { useState } from 'react';
import { MapPinIcon, ArrowPathIcon, GlobeAltIcon, XCircleIcon, SparklesIcon } from './Icons';
import Button from './Button';
import Card from './Card';
import { CJE } from '../types';
import { CJES_DATA } from '../constants';
import { findBestCJE } from '../services/geminiService';

const TrouveTonCJE: React.FC<{className?: string}> = ({ className = '' }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [nearestCJE, setNearestCJE] = useState<CJE | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  
  // Input state for text search
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Formule de Haversine pour calculer la distance en km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleGeoSearch = () => {
    setStatus('loading');
    setErrorMsg('');
    setReason('');

    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg("La géolocalisation n'est pas supportée par ton navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        let minDistance = Infinity;
        let closest: CJE | null = null;

        CJES_DATA.forEach((cje) => {
          const dist = calculateDistance(userLat, userLon, cje.latitude, cje.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            closest = cje;
          }
        });

        if (closest) {
          setNearestCJE(closest);
          setDistance(minDistance);
          setStatus('success');
          setReason("Ce CJE est le plus proche de ta position actuelle.");
        } else {
          setStatus('error');
          setErrorMsg("Impossible de trouver un CJE proche.");
        }
      },
      (error) => {
        setStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg("Tu as refusé l'accès à ta localisation.");
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg("Les informations de localisation sont indisponibles.");
            break;
          case error.TIMEOUT:
            setErrorMsg("La demande de localisation a expiré.");
            break;
          default:
            setErrorMsg("Une erreur inconnue est survenue.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleTextSearch = async () => {
    if (!city.trim() && !postalCode.trim()) {
        setStatus('error');
        setErrorMsg("Merci d'entrer au moins une ville ou un code postal.");
        return;
    }

    setStatus('loading');
    setErrorMsg('');
    setDistance(null); // No precise distance with text search

    try {
        const result = await findBestCJE(city, postalCode);
        
        if (result.cje_plus_proche && result.cje_plus_proche.id) {
            // Hydrate with full data from constants to get lat/long if needed for map
            const fullCJEData = CJES_DATA.find(c => c.id === result.cje_plus_proche.id) || null;
            
            if (fullCJEData) {
                setNearestCJE(fullCJEData);
                setReason(result.cje_plus_proche.raison_selection || "Ce CJE correspond le mieux à ta recherche.");
                setStatus('success');
            } else {
                 setStatus('error');
                 setErrorMsg("Erreur: CJE introuvable dans la base de données.");
            }
        } else {
            setStatus('error');
            setErrorMsg(result.ui.messages.aucun_resultat || "Aucun CJE trouvé pour cette recherche.");
        }

    } catch (error) {
        setStatus('error');
        setErrorMsg("Une erreur est survenue lors de la recherche intelligente.");
    }
  };

  const resetSearch = () => {
      setStatus('idle');
      setCity('');
      setPostalCode('');
  };

  return (
    <div className={`h-full ${className}`}>
      {status === 'idle' && (
        <Card className="h-full flex flex-col justify-center p-6 border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 transition-all hover:shadow-md">
          <div className="text-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-800 p-4 rounded-full mb-4 text-primary-600 dark:text-primary-400 inline-block">
                <MapPinIcon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                Trouve ton CJE
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
                Entre ta ville ou ton code postal pour savoir quel CJE peut t’aider.
            </p>
          </div>
          
          <div className="space-y-4 w-full max-w-xs mx-auto">
            <div>
                <input 
                    type="text" 
                    placeholder="Ta ville" 
                    className="w-full p-2 text-sm border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:border-slate-700"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
            </div>
            <div>
                <input 
                    type="text" 
                    placeholder="Ton code postal" 
                    className="w-full p-2 text-sm border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:border-slate-700"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                />
            </div>
            
            <Button onClick={handleTextSearch} className="w-full rounded-full shadow-lg shadow-blue-500/20">
               Rechercher
            </Button>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-blue-50 dark:bg-slate-900 text-slate-500">OU</span>
                </div>
            </div>
            
            <Button onClick={handleGeoSearch} variant="secondary" className="w-full rounded-full text-xs">
              <MapPinIcon className="w-3 h-3 mr-2" />
              Utiliser ma position
            </Button>
          </div>
        </Card>
      )}

      {status === 'loading' && (
        <Card className="h-full flex flex-col items-center justify-center p-8">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 animate-pulse">
              Recherche du meilleur CJE...
            </p>
        </Card>
      )}

      {status === 'error' && (
        <Card className="h-full flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-6 text-center">
            <div className="bg-red-100 dark:bg-red-800 p-3 rounded-full mb-3">
                <MapPinIcon className="w-6 h-6 text-red-600 dark:text-red-200" />
            </div>
            <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">Oups !</h3>
            
            <div className="flex items-center justify-center gap-2 mb-5 text-red-700 dark:text-red-300">
                <XCircleIcon className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-medium">{errorMsg}</p>
            </div>

            <Button onClick={resetSearch} variant="secondary" className="w-full mb-3">
              Réessayer
            </Button>
            <a 
                href="https://www.trouvetoncje.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-red-600 dark:text-red-300 underline hover:text-red-800 dark:hover:text-red-200"
            >
                Chercher dans le répertoire officiel
            </a>
        </Card>
      )}

      {status === 'success' && nearestCJE && (
        <Card className="h-full flex flex-col !p-0 overflow-hidden border-primary-200 dark:border-primary-800 relative ring-2 ring-primary-50 dark:ring-primary-900/20 shadow-lg">
             {/* Header Section */}
             <div className="flex-none flex items-center px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 z-10 backdrop-blur-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-700 rounded-full mr-4 shadow-sm border border-slate-200 dark:border-slate-600 text-primary-600 dark:text-primary-400">
                    <MapPinIcon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-none">Trouve ton CJE</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Résultat de recherche</span>
                </div>
             </div>

             {/* Embedded Map */}
             <div className="flex-grow w-full bg-slate-100 relative z-0 min-h-[200px]">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://maps.google.com/maps?q=${nearestCJE.latitude},${nearestCJE.longitude}&z=14&output=embed`}
                  title="Localisation CJE"
                  className="absolute inset-0 border-0"
                  loading="lazy"
                  allowFullScreen
                ></iframe>
             </div>
             
             {/* Details Section */}
             <div className="flex-none p-5 relative z-10 bg-white dark:bg-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                            {nearestCJE.nom}
                        </h4>
                        {distance !== null && (
                            <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 text-xs font-bold px-2 py-1 rounded whitespace-nowrap ml-2">
                                {distance.toFixed(1)} km
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {nearestCJE.ville}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                        {nearestCJE.adresse}
                    </p>
                    {reason && (
                        <div className="mt-3 flex items-start text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">
                            <SparklesIcon className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                            <span>{reason}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto space-y-2">
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${nearestCJE.latitude},${nearestCJE.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                    >
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        Ouvrir dans Google Maps
                    </a>
                    <a 
                        href={nearestCJE.siteWeb} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-md transition-colors"
                    >
                        <GlobeAltIcon className="w-4 h-4 mr-2" />
                        Visiter le site web
                    </a>
                </div>
             </div>
             
             <div className="flex-none px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                 <button 
                    onClick={resetSearch}
                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline flex items-center ml-auto font-medium"
                 >
                     <ArrowPathIcon className="w-3 h-3 mr-1" />
                     Nouvelle recherche
                 </button>
            </div>
        </Card>
      )}
    </div>
  );
};

export default TrouveTonCJE;
