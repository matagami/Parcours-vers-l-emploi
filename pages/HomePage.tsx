
import React from 'react';
import { useAutonomyJourney } from '../hooks/useAutonomyJourney';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { CheckCircleIcon, XCircleIcon } from '../components/Icons';
import Button from '../components/Button';
import TrouveTonCJE from '../components/TrouveTonCJE';

const HomePage: React.FC = () => {
  const { isResumeComplete, isBudgetComplete, isRiasecComplete, resumeData, riasecResult } = useAutonomyJourney();

  const skillsCount = resumeData.skills.length;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Bienvenue dans ton <span className="text-primary-600 dark:text-primary-400">Parcours vers l'Autonomie</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Ces outils sont conçus pour t'aider à préparer ton avenir professionnel et financier avec l'aide de ton Carrefour Jeunesse-Emploi.
        </p>
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        
        {/* Column 1: Progression */}
        <Card className="h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4">Ta Progression</h2>
          <ul className="space-y-4 flex-grow">
            <li className="flex items-center p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              {isResumeComplete ? (
                <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 shrink-0" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-500 mr-3 shrink-0" />
              )}
              <span className="font-medium">CV créé</span>
            </li>
             <li className="flex items-center p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              {skillsCount > 0 ? (
                <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 shrink-0" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-500 mr-3 shrink-0" />
              )}
              <span className="font-medium">{skillsCount} compétences identifiées</span>
            </li>
            <li className="flex items-center p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              {isBudgetComplete ? (
                <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 shrink-0" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-500 mr-3 shrink-0" />
              )}
              <span className="font-medium">Budget planifié</span>
            </li>
            <li className="flex items-center p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              {isRiasecComplete ? (
                <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 shrink-0" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-500 mr-3 shrink-0" />
              )}
              <span className="font-medium">
                {isRiasecComplete && riasecResult 
                  ? `Profil RIASEC (${riasecResult.profil_riasec_principal.lettres_dominantes.join('-')})`
                  : "Profil RIASEC établi"}
              </span>
            </li>
          </ul>
        </Card>

        {/* Column 2: Trouve Ton CJE */}
        <div className="h-full min-h-[300px]">
           <TrouveTonCJE className="h-full" />
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Orientation Card with Result Display */}
        <Card className="hover:shadow-md transition-shadow flex flex-col">
          <h2 className="text-2xl font-bold mb-3 text-indigo-600 dark:text-indigo-400">Test RIASEC</h2>
          {isRiasecComplete && riasecResult ? (
             <div className="flex-grow flex flex-col">
                 <div className="flex items-center gap-2 mb-3">
                    {riasecResult.profil_riasec_principal.lettres_dominantes.map(l => (
                        <span key={l} className="font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-1 rounded text-sm shadow-sm">{l}</span>
                    ))}
                 </div>
                 <h3 className="font-bold text-lg mb-1 leading-tight">{riasecResult.titre_profil}</h3>
                 <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">
                    {riasecResult.profil_riasec_principal.description_courte}
                 </p>
                 <Link to="/orientation" className="mt-auto">
                    <Button variant="primary" className="w-full bg-indigo-600 hover:bg-indigo-700">
                      Voir mon profil complet
                    </Button>
                 </Link>
             </div>
          ) : (
             <>
                <p className="text-slate-600 dark:text-slate-300 mb-6 flex-grow">
                    Tu ne sais pas quoi faire plus tard ? Découvre tes intérêts dominants et obtiens des pistes de métiers.
                </p>
                <Link to="/orientation" className="mt-auto">
                    <Button variant="primary" className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Faire le test
                    </Button>
                </Link>
             </>
          )}
        </Card>

        <Card className="hover:shadow-md transition-shadow flex flex-col">
          <h2 className="text-2xl font-bold mb-3 text-primary-600 dark:text-primary-400">Générateur de CV</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 flex-grow">
            Raconte ton parcours, et notre IA détectera tes compétences pour créer un CV professionnel.
          </p>
          <Link to="/cv" className="mt-auto">
            <Button variant="primary" className="w-full">Créer mon CV</Button>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow flex flex-col">
          <h2 className="text-2xl font-bold mb-3 text-green-600 dark:text-green-400">Simulateur de Budget</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 flex-grow">
            Planifie les dépenses de ton premier appartement pour t'assurer d'avoir un budget équilibré.
          </p>
          <Link to="/budget" className="mt-auto">
            <Button variant="primary" className="w-full">Planifier mon Budget</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
