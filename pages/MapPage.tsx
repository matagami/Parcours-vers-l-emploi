
import React from 'react';
import TrouveTonCJE from '../components/TrouveTonCJE';

const MapPage: React.FC = () => {
  return (
    <div className="space-y-6 flex-grow flex flex-col">
      <div className="text-center flex-none">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Trouve ton <span className="text-primary-600 dark:text-primary-400">CJE</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Localise le Carrefour Jeunesse-Emploi le plus près de toi pour obtenir de l'aide dans tes démarches.
        </p>
      </div>
      
      <div className="flex-grow w-full max-w-5xl mx-auto h-full">
        <TrouveTonCJE className="h-full shadow-lg" />
      </div>
    </div>
  );
};

export default MapPage;
