
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateActionPlan } from '../services/geminiService';
import { ActionPlanOutput } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import { ArrowLongRightIcon, CheckCircleIcon, MapPinIcon } from '../components/Icons';
import { useAutonomyJourney } from '../hooks/useAutonomyJourney';

const ActionPlanPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setHasActionPlan, setDashboardContent } = useAutonomyJourney();
  const [plan, setPlan] = useState<ActionPlanOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      const inputData = location.state?.inputData;
      
      if (!inputData) {
        // Check if we have a stored plan in context/storage in future iterations.
        // For now, if no data passed, redirect back.
        navigate('/orientation');
        return;
      }

      try {
        const generatedPlan = await generateActionPlan(inputData);
        setPlan(generatedPlan);
        setHasActionPlan(true);
        setDashboardContent(null); // Invalidate dashboard cache
      } catch (err) {
        console.error(err);
        setError("Impossible de générer le plan d'action pour le moment.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [location.state, navigate, setHasActionPlan, setDashboardContent]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="relative w-20 h-20 mb-6">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 dark:border-purple-900 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Construction de ton plan...</h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-md">
            L'IA analyse ton profil pour te proposer des étapes concrètes et adaptées.
        </p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Oups !</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">{error || "Une erreur est survenue."}</p>
        <Button onClick={() => navigate('/orientation')}>Retour aux résultats</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            {plan.ui.page_title}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {plan.ui.intro_text}
        </p>
      </div>

      <div className="grid gap-8">
        {/* 1. Résumé Profil */}
        <Card className="border-l-4 border-indigo-500">
            <div className="flex items-center gap-3 mb-3">
                <div className="flex gap-1">
                    {plan.resume_profil.lettres.map((l) => (
                        <span key={l} className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                            {l}
                        </span>
                    ))}
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Ton Profil en bref</h2>
            </div>
            <p className="text-slate-700 dark:text-slate-300 italic text-lg">
                "{plan.resume_profil.description}"
            </p>
        </Card>

        {/* 2. Objectif Principal */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg transform hover:scale-[1.01] transition-transform">
            <h2 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Ton Objectif Principal</h2>
            <h3 className="text-3xl font-bold mb-3">{plan.objectif_principal.titre}</h3>
            <p className="text-purple-50 text-lg leading-relaxed">{plan.objectif_principal.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            {/* 3. Actions Prioritaires */}
            <Card className="h-full bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
                <div className="flex items-center gap-2 mb-4 text-green-700 dark:text-green-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h2 className="text-xl font-bold">Tout de suite (1-2 semaines)</h2>
                </div>
                <ul className="space-y-4">
                    {plan.actions_prioritaires.map((action, i) => (
                        <li key={i} className="flex items-start bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs mr-3 mt-0.5">
                                {i + 1}
                            </span>
                            <span className="text-slate-700 dark:text-slate-200">{action}</span>
                        </li>
                    ))}
                </ul>
            </Card>

            {/* 4. Actions Moyen Terme */}
            <Card className="h-full bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h2 className="text-xl font-bold">Bientôt (1-3 mois)</h2>
                </div>
                <ul className="space-y-4">
                    {plan.actions_moyen_terme.map((action, i) => (
                        <li key={i} className="flex items-start bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mr-3 mt-0.5">
                                {i + 1}
                            </span>
                            <span className="text-slate-700 dark:text-slate-200">{action}</span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>

        {/* 5. Ressources */}
        {plan.ressources_region.length > 0 && (
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <MapPinIcon className="w-6 h-6 text-red-500" />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Ressources utiles</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    {plan.ressources_region.map((res, i) => (
                        <a 
                            key={i} 
                            href={res.lien || '#'} 
                            target={res.lien ? "_blank" : "_self"}
                            rel="noopener noreferrer"
                            className="block p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 transition-colors">
                                        {res.nom}
                                    </h3>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{res.type}</p>
                                </div>
                                {res.lien && <ArrowLongRightIcon className="w-5 h-5 text-slate-300 group-hover:text-primary-500" />}
                            </div>
                        </a>
                    ))}
                </div>
            </Card>
        )}

        {/* Footer CTA */}
        <div className="text-center pt-8">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 max-w-2xl mx-auto">
                <p className="text-xl font-medium text-slate-800 dark:text-white mb-6 italic">
                    "{plan.message_final}"
                </p>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {plan.cta_suite.description}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button onClick={() => navigate('/orientation')} variant="secondary">
                        Retour au profil
                    </Button>
                    <Button onClick={() => navigate('/cje')} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                        {plan.cta_suite.texte}
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPlanPage;
