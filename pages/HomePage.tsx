
import React, { useEffect } from 'react';
import { useAutonomyJourney } from '../hooks/useAutonomyJourney';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { 
    CheckCircleIcon, 
    MapPinIcon, 
    BriefcaseIcon, 
    ClipboardDocumentListIcon, 
    SparklesIcon, 
    FlagIcon,
    DocumentTextIcon,
    CompassIcon,
    ArrowLongRightIcon
} from '../components/Icons';
import { getDashboardContent, getMockDashboardContent } from '../services/geminiService';
import { DashboardCard } from '../types';

const HomePage: React.FC = () => {
  const { 
    isResumeComplete, 
    isBudgetComplete, 
    isRiasecComplete, 
    resumeData, 
    riasecResult, 
    hasActionPlan,
    dashboardContent,
    setDashboardContent
  } = useAutonomyJourney();
  
  const navigate = useNavigate();

  useEffect(() => {
    // If we already have content in context, don't re-fetch immediately.
    if (dashboardContent) return;

    let isMounted = true;
    
    const fetchDashboard = async () => {
      const context = {
        utilisateur: {
          nom: resumeData.personalInfo.name || null,
          region: null, 
          objectif: null
        },
        etat: {
          test_riasec_passe: isRiasecComplete,
          profil_riasec: riasecResult?.profil_riasec_principal.lettres_dominantes || null,
          plan_action_genere: hasActionPlan
        }
      };

      try {
        const content = await getDashboardContent(context);
        if (isMounted) {
          setDashboardContent(content);
        }
      } catch (error) {
        console.error("Failed to load dashboard content", error);
        if (isMounted) {
          setDashboardContent(getMockDashboardContent(context));
        }
      }
    };

    fetchDashboard();

    return () => { isMounted = false; };
  }, [dashboardContent, isRiasecComplete, resumeData.personalInfo.name, riasecResult, hasActionPlan, setDashboardContent]);

  const handleCardClick = (id: string) => {
      switch(id) {
          case 'test_riasec':
              navigate('/orientation');
              break;
          case 'resultats_riasec':
              navigate('/orientation');
              break;
          case 'trouve_cje':
              navigate('/cje');
              break;
          case 'emplois':
              navigate('/orientation');
              break;
          case 'cv_intelligent':
              navigate('/cv');
              break;
          case 'budget_sim':
              navigate('/budget');
              break;
          case 'plan_action':
              navigate('/plan-action', { state: { 
                  inputData: {
                      nom: resumeData.personalInfo.name,
                      lettres_dominantes: riasecResult?.profil_riasec_principal.lettres_dominantes,
                      objectif: 'exploration',
                      region: 'Montréal', 
                      pistes_metiers: riasecResult?.pistes_metiers,
                      pistes_activites: riasecResult?.pistes_activites
                  }
               } });
              break;
          default:
              break;
      }
  };

  const getCardIcon = (id: string) => {
      switch(id) {
          case 'test_riasec': return <CompassIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
          case 'resultats_riasec': return <ClipboardDocumentListIcon className="w-6 h-6 text-green-600 dark:text-green-400" />;
          case 'trouve_cje': return <MapPinIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
          case 'emplois': return <BriefcaseIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
          case 'plan_action': return <FlagIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
          case 'cv_intelligent': return <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
          case 'budget_sim': return <SparklesIcon className="w-6 h-6 text-green-600 dark:text-green-400" />;
          default: return <SparklesIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />;
      }
  };

  const getCardStatus = (id: string) => {
      switch(id) {
        case 'test_riasec':
            return isRiasecComplete 
                ? { label: "Complété", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" }
                : { label: "À faire", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" };
        case 'resultats_riasec':
             return { label: "Disponible", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" };
        case 'trouve_cje':
             return { label: "Ressource", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" };
        case 'cv_intelligent':
             return isResumeComplete
                ? { label: "Complété", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" }
                : { label: "À faire", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" };
        case 'budget_sim':
             return isBudgetComplete
                ? { label: "Complété", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" }
                : { label: "À faire", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" };
        case 'plan_action':
             return hasActionPlan
                ? { label: "Généré", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" }
                : { label: "Recommandé", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" };
        default:
            return null;
      }
  };

  // Show spinner only if we truly have no content
  if (!dashboardContent) {
      return (
        <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      );
  }

  // 1. Valeurs par défaut pour éviter les plantages
  const title = dashboardContent?.ui?.welcome_title ?? "Bienvenue sur ton tableau de bord";
  const text = dashboardContent?.ui?.welcome_text ?? "Voici ton tableau de bord. Choisis par où tu veux commencer.";

  const cards: DashboardCard[] = dashboardContent?.dashboard_cards ?? [];

  // 2. On filtre proprement les cartes visibles
  // IMPORTANT: On filtre les cartes "génériques" (test_riasec, etc.) car elles sont déjà présentes dans les "Outils Rapides" en bas.
  const redundantIds = [
      'test_riasec', 
      'cv_intelligent', 
      'budget_sim', 
      'trouve_cje', 
      'invitation_riasec', 
      'decouverte_riasec', 
      'commencer_riasec', 
      'intro_riasec',
      'start_riasec'
  ];
  
  const visibleCards = cards.filter((card) => {
      if (card.visible === false) return false;
      if (redundantIds.includes(card.id)) return false;
      
      // Fallback filtering based on content keywords if ID is not in the list
      const titleLower = card.titre.toLowerCase();
      if (
          (titleLower.includes('découvre') || titleLower.includes('commence')) && 
          (titleLower.includes('riasec') || titleLower.includes('test')) &&
          card.id !== 'resultats_riasec'
      ) {
          return false;
      }
      
      return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-500 rounded-2xl p-8 text-white shadow-lg transform transition-all hover:scale-[1.01] relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            {title}
            </h1>
            <p className="text-lg text-blue-50 max-w-2xl opacity-90">
            {text}
            </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 transform translate-x-10 -translate-y-10 pointer-events-none">
            <SparklesIcon className="w-full h-full" />
        </div>
      </div>
      
      {/* AI Generated Personalized Dashboard Grid (Notifications & Insights) */}
      {visibleCards.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {visibleCards.map((card) => {
                const status = getCardStatus(card.id);
                return (
                    <div 
                        key={card.id} 
                        className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col"
                        onClick={() => handleCardClick(card.id)}
                    >
                        {/* Gradient border accent on hover */}
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-700 transition-colors group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20`}>
                                {getCardIcon(card.id)}
                            </div>
                            {status && (
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>
                                    {status.label}
                                </span>
                            )}
                        </div>

                        <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {card.titre}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-grow leading-relaxed">
                            {card.description}
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                            <span className="flex items-center text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                                {card.cta_label}
                                <ArrowLongRightIcon className="w-4 h-4 ml-2" />
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
      )}

      {/* Static Tools Section (Always visible) */}
      <div>
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100 pt-4 flex items-center">
              <BriefcaseIcon className="w-6 h-6 mr-2 text-slate-400" />
              Outils Rapides
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Resume Card */}
            <Link to="/cv" className="group block">
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary-200 dark:hover:border-primary-800 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        {isResumeComplete ? (
                             <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                <CheckCircleIcon className="w-3 h-3 mr-1" /> Complété
                             </span>
                        ) : (
                             <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                À faire
                             </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-primary-600 transition-colors">Mon CV Intelligent</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex-grow">
                        Génère ou mets à jour ton CV professionnel en quelques clics grâce à l'IA.
                    </p>
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center">
                        Gérer mon CV <ArrowLongRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </span>
                </Card>
            </Link>

            {/* Budget Card */}
            <Link to="/budget" className="group block">
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-green-200 dark:hover:border-green-800 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <SparklesIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                         {isBudgetComplete ? (
                             <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                <CheckCircleIcon className="w-3 h-3 mr-1" /> Complété
                             </span>
                        ) : (
                             <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                À faire
                             </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-green-600 transition-colors">Mon Budget</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex-grow">
                         Planifie tes finances pour ton appartement et assure ton autonomie.
                    </p>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
                        Gérer mon budget <ArrowLongRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </span>
                </Card>
            </Link>

            {/* Riasec Card */}
            <Link to="/orientation" className="group block">
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-indigo-200 dark:hover:border-indigo-800 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <CompassIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        {isRiasecComplete ? (
                             <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                <CheckCircleIcon className="w-3 h-3 mr-1" /> Complété
                             </span>
                        ) : (
                             <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                À faire
                             </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-indigo-600 transition-colors">Orientation (RIASEC)</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex-grow">
                        Découvre ton profil et tes intérêts professionnels pour mieux t'orienter.
                    </p>
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center">
                        Passer le test <ArrowLongRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </span>
                </Card>
            </Link>

            {/* CJE Card */}
            <Link to="/cje" className="group block">
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <MapPinIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                            Ressource
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-blue-600 transition-colors">Trouve ton CJE</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex-grow">
                        Localise le Carrefour Jeunesse-Emploi le plus proche pour obtenir de l'aide.
                    </p>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center">
                        Trouver un CJE <ArrowLongRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </span>
                </Card>
            </Link>
          </div>
      </div>
      
      <div className="text-center pt-8 pb-4 text-slate-500 dark:text-slate-400 italic text-sm">
          "{dashboardContent?.message_global || "Continue à avancer à ton rythme."}"
      </div>
    </div>
  );
};

export default HomePage;
