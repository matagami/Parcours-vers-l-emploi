import React, { useMemo } from 'react';
import { useAutonomyJourney } from '../hooks/useAutonomyJourney';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { CheckCircleIcon, XCircleIcon } from '../components/Icons';
import Button from '../components/Button';

const HomePage: React.FC = () => {
  const { isResumeComplete, isBudgetComplete, resumeData, budgetData, resetData } = useAutonomyJourney();

  const totalExpenses = useMemo(() => {
    // FIX: The original reduce function had type inference issues.
    // Replaced with a standard loop for robust type safety.
    let currentTotal = 0;
    for (const category of Object.values(budgetData.expenses)) {
      if (typeof category === 'number') {
        currentTotal += category;
      } else if (category && typeof category === 'object') {
        for (const value of Object.values(category)) {
          currentTotal += Number(value);
        }
      }
    }
    return currentTotal;
  }, [budgetData.expenses]);

  const gap = budgetData.income - totalExpenses;
  const skillsCount = resumeData.skills.length;

  const getGapMessage = () => {
    if (!isBudgetComplete) return 'Planifie ton budget pour voir le résultat.';
    if (gap >= 0) {
      return (
        <span className="text-green-500">
          Excellent ! Tu as un surplus de {gap.toFixed(2)} $ par mois.
        </span>
      );
    }
    return (
      <span className="text-red-500">
        Attention, il te manque {Math.abs(gap).toFixed(2)} $ par mois.
      </span>
    );
  };
  
  const handleReset = () => {
    if (window.confirm("Es-tu sûr de vouloir recommencer à zéro ? Toutes tes données seront effacées.")) {
      resetData();
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Bienvenue dans ton <span className="text-primary-600 dark:text-primary-400">Parcours vers l'Autonomie</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Ces outils sont conçus pour t'aider à préparer ton avenir professionnel et financier. Commençons !
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-4">Ta Progression</h2>
          <ul className="space-y-3">
            <li className="flex items-center">
              {isResumeComplete ? (
                <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-500 mr-3" />
              )}
              <span>CV créé</span>
            </li>
             <li className="flex items-center">
              {skillsCount > 0 ? (
                <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-500 mr-3" />
              )}
              <span>{skillsCount} compétences identifiées</span>
            </li>
            <li className="flex items-center">
              {isBudgetComplete ? (
                <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-500 mr-3" />
              )}
              <span>Budget planifié</span>
            </li>
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Analyse du Budget</h2>
          <p className="text-slate-600 dark:text-slate-300">{getGapMessage()}</p>
          {isBudgetComplete && gap < 0 && (
            <div className="mt-4 p-4 bg-amber-100 dark:bg-amber-900/50 rounded-lg border border-amber-300 dark:border-amber-700">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Conseil intelligent</h3>
              <p className="text-amber-700 dark:text-amber-300">
                Ton budget est serré. Améliorer ton CV en y ajoutant plus de compétences pourrait t'aider à trouver un emploi mieux rémunéré.
              </p>
              <Link to="/cv">
                <Button variant="primary" className="mt-2">
                  Améliorer mon CV
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-2xl font-bold mb-3">Générateur de CV Intelligent</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Raconte ton parcours, et notre IA détectera tes compétences pour créer un CV professionnel.
          </p>
          <Link to="/cv">
            <Button variant="primary">Commencer mon CV</Button>
          </Link>
        </Card>
        <Card>
          <h2 className="text-2xl font-bold mb-3">Simulateur de Budget</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Planifie les dépenses de ton premier appartement pour t'assurer d'avoir un budget équilibré et réaliste.
          </p>
          <Link to="/budget">
            <Button variant="primary">Planifier mon Budget</Button>
          </Link>
        </Card>
      </div>
      
      <Card className="text-center">
        <h2 className="text-xl font-bold mb-4">Recommencer?</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">Si tu veux repartir à zéro, tu peux effacer toutes tes données ici.</p>
        <Button variant="danger" onClick={handleReset}>Réinitialiser mon parcours</Button>
      </Card>
    </div>
  );
};

export default HomePage;