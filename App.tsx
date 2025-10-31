
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AutonomyJourneyProvider } from './hooks/useAutonomyJourney';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ResumePage from './pages/ResumePage';
import BudgetPage from './pages/BudgetPage';

function App() {
  return (
    <AutonomyJourneyProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col font-sans">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cv" element={<ResumePage />} />
              <Route path="/budget" element={<BudgetPage />} />
            </Routes>
          </main>
          <footer className="bg-slate-100 dark:bg-slate-800 text-center p-4 text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Mon parcours vers l'autonomie. Développé pour Carrefour Jeunesse-Emploi.
          </footer>
        </div>
      </HashRouter>
    </AutonomyJourneyProvider>
  );
}

export default App;