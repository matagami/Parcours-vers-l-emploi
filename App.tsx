
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AutonomyJourneyProvider, useAutonomyJourney } from './hooks/useAutonomyJourney';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ResumePage from './pages/ResumePage';
import BudgetPage from './pages/BudgetPage';
import RiasecPage from './pages/RiasecPage';
import MapPage from './pages/MapPage';
import ActionPlanPage from './pages/ActionPlanPage';
import { CheckCircleIcon } from './components/Icons';

const AppFooter = () => {
  const { autoSaveStatus, lastSaved } = useAutonomyJourney();

  const renderStatus = () => {
    if (autoSaveStatus === 'saving') {
      return (
        <span className="flex items-center text-amber-600 dark:text-amber-400 text-xs">
          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-amber-600 dark:text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sauvegarde en cours...
        </span>
      );
    }
    if (autoSaveStatus === 'saved' && lastSaved) {
      return (
        <span className="flex items-center text-green-600 dark:text-green-400 text-xs">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Enregistré à {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      );
    }
    if (autoSaveStatus === 'error') {
      return <span className="text-red-500 text-xs">Erreur de sauvegarde</span>;
    }
    return null;
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 mt-8 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-400">
        <div className="mb-2 md:mb-0">
          © 2025 Mon parcours vers l'autonomie. Développé pour Carrefour Jeunesse-Emploi.
        </div>
        <div>
          {renderStatus()}
        </div>
      </div>
    </footer>
  );
};

function App() {
  return (
    <AutonomyJourneyProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col font-sans">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cv" element={<ResumePage />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/orientation" element={<RiasecPage />} />
              <Route path="/plan-action" element={<ActionPlanPage />} />
              <Route path="/cje" element={<MapPage />} />
            </Routes>
          </main>
          <AppFooter />
        </div>
      </HashRouter>
    </AutonomyJourneyProvider>
  );
}

export default App;
