
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { getRiasecAnalysis, getJobSuggestions, getRiasecTestPageContent, generateActionPlan } from '../services/geminiService';
import { RiasecInput, RiasecOutput, JobSearchOutput, RiasecTestPageContent, ActionPlanOutput } from '../types';
import { SparklesIcon, ArrowLongRightIcon, CompassIcon, ArrowPathIcon, MapPinIcon, CheckCircleIcon } from '../components/Icons';
import { useAutonomyJourney } from '../hooks/useAutonomyJourney';
import { useNavigate } from 'react-router-dom';

// Raw questions to be sent to the API for structuring
const RAW_QUESTIONS = [
    // Réaliste (R)
    { id: 'R1', type: 'R', text: "J'aime utiliser des outils et des machines pour réparer ou construire." },
    { id: 'R2', type: 'R', text: "Je préfère le travail physique et les activités de plein air." },
    { id: 'R3', type: 'R', text: "Je suis réaliste, pratique et j'aime voir des résultats concrets." },
    { id: 'R4', type: 'R', text: "J'aime travailler le bois, le métal ou manipuler des matériaux de construction." },
    { id: 'R5', type: 'R', text: "Je prends plaisir à démonter et réparer des objets électroniques ou mécaniques." },
    { id: 'R6', type: 'R', text: "Conduire un véhicule ou opérer de la machinerie m'intéresse." },
    
    // Investigateur (I)
    { id: 'I1', type: 'I', text: "J'aime comprendre comment les choses fonctionnent et résoudre des problèmes complexes." },
    { id: 'I2', type: 'I', text: "Je suis curieux et j'aime apprendre de nouvelles choses en sciences ou mathématiques." },
    { id: 'I3', type: 'I', text: "Je préfère analyser une situation avant d'agir." },
    { id: 'I4', type: 'I', text: "J'aime faire des recherches approfondies sur un sujet qui me passionne." },
    { id: 'I5', type: 'I', text: "Je suis stimulé par les jeux de stratégie, les énigmes ou la programmation." },
    { id: 'I6', type: 'I', text: "J'aime observer la nature ou faire des expériences scientifiques." },

    // Artistique (A)
    { id: 'A1', type: 'A', text: "J'ai beaucoup d'imagination et j'aime créer des choses originales." },
    { id: 'A2', type: 'A', text: "J'aime les activités artistiques (musique, écriture, dessin, théâtre)." },
    { id: 'A3', type: 'A', text: "Je suis expressif et j'aime sortir des sentiers battus." },
    { id: 'A4', type: 'A', text: "Je m'intéresse à la photographie, au montage vidéo ou au design graphique." },
    { id: 'A5', type: 'A', text: "J'ai un intérêt pour la mode, la décoration ou l'architecture." },
    { id: 'A6', type: 'A', text: "J'aime écrire des histoires, des poèmes ou des articles de blogue." },

    // Social (S)
    { id: 'S1', type: 'S', text: "J'aime aider les autres, enseigner ou soigner." },
    { id: 'S2', type: 'S', text: "Je préfère travailler en équipe et échanger avec des gens." },
    { id: 'S3', type: 'S', text: "Je suis à l'écoute et sensible aux besoins de mon entourage." },
    { id: 'S4', type: 'S', text: "Je m'implique volontiers dans des causes communautaires ou du bénévolat." },
    { id: 'S5', type: 'S', text: "Mes amis viennent souvent me voir pour obtenir des conseils ou du réconfort." },
    { id: 'S6', type: 'S', text: "J'aime animer des groupes ou expliquer des choses aux autres." },

    // Entreprenant (E)
    { id: 'E1', type: 'E', text: "J'aime diriger, influencer ou convaincre les autres." },
    { id: 'E2', type: 'E', text: "J'ai de l'ambition et j'aime lancer des projets." },
    { id: 'E3', type: 'E', text: "Je suis énergique et j'aime prendre des décisions." },
    { id: 'E4', type: 'E', text: "J'aime vendre des idées ou négocier pour obtenir ce que je veux." },
    { id: 'E5', type: 'E', text: "Parler en public ou faire des présentations ne me fait pas peur." },
    { id: 'E6', type: 'E', text: "J'aime les défis et la compétition me motive à me dépasser." },

    // Conventionnel (C)
    { id: 'C1', type: 'C', text: "J'aime quand les choses sont bien organisées et structurées." },
    { id: 'C2', type: 'C', text: "Je suis précis, méthodique et j'aime suivre des règles claires." },
    { id: 'C3', type: 'C', text: "J'aime travailler avec des chiffres, des données ou de la paperasse." },
    { id: 'C4', type: 'C', text: "J'aime tenir un agenda à jour et planifier mes journées." },
    { id: 'C5', type: 'C', text: "Je suis doué pour classer des fichiers, faire des listes ou ranger des choses." },
    { id: 'C6', type: 'C', text: "J'aime les tâches qui demandent beaucoup de rigueur et d'attention aux détails." },
];

const DIMENSION_COLORS: {[key: string]: {bg: string, text: string, border: string, badge: string}} = {
    R: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-600' },
    I: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-600' },
    A: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-600' },
    S: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-600' },
    E: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-600' },
    C: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', badge: 'bg-slate-600' },
};

const RiasecPage: React.FC = () => {
    const { setRiasecResult, riasecResult, setDashboardContent } = useAutonomyJourney();
    const [step, setStep] = useState<'loading_ui' | 'test' | 'context' | 'loading_analysis' | 'result'>('loading_ui');
    const [answers, setAnswers] = useState<Set<string>>(new Set());
    const [uiContent, setUiContent] = useState<RiasecTestPageContent['test_page_ui'] | null>(null);
    const navigate = useNavigate();
    
    const [contextData, setContextData] = useState<Partial<RiasecInput>>({
        nom: '',
        age: '',
        groupe_age: '18-24',
        region: 'Montréal',
        objectif: 'exploration',
    });
    const [result, setResult] = useState<RiasecOutput | null>(null);
    
    // Job Search State
    const [isSearchingJobs, setIsSearchingJobs] = useState(false);
    const [jobResults, setJobResults] = useState<JobSearchOutput | null>(null);

    // Action Plan State
    const [isGeneratingActionPlan, setIsGeneratingActionPlan] = useState(false);

    const getFallbackContent = (groupedQuestions: any): RiasecTestPageContent['test_page_ui'] => ({
        page_title: "Ton test RIASEC",
        intro_text: "Ce test t’aide à mieux comprendre ce que tu aimes faire. Réponds spontanément !",
        explication_riasec: {
            texte_court: "Le modèle RIASEC t’aide à explorer ce que tu aimes faire. Chaque lettre représente un style d’intérêts.",
            definitions: {
                R: "Réaliste : Tu aimes le concret, le manuel, le plein air.",
                I: "Investigateur : Tu es curieux, tu aimes comprendre et analyser.",
                A: "Artistique : Tu es créatif, original et expressif.",
                S: "Social : Tu aimes aider, écouter et être avec les gens.",
                E: "Entreprenant : Tu as du leadership et tu aimes convaincre.",
                C: "Conventionnel : Tu aimes l'ordre, la structure et l'organisation."
            }
        },
        progression: {
            type: "barre",
            description: "Ta progression s’ajuste au fur et à mesure."
        },
        instructions: "1. Lis chaque question.\n2. Répond instinctivement.\n3. Sois honnête avec toi-même.",
        form_structure: {
            dimensions: [
                { code: "R", titre: "Réaliste", questions: groupedQuestions.R || [] },
                { code: "I", titre: "Investigateur", questions: groupedQuestions.I || [] },
                { code: "A", titre: "Artistique", questions: groupedQuestions.A || [] },
                { code: "S", titre: "Social", questions: groupedQuestions.S || [] },
                { code: "E", titre: "Entreprenant", questions: groupedQuestions.E || [] },
                { code: "C", titre: "Conventionnel", questions: groupedQuestions.C || [] }
            ],
            bouton_soumettre: "Voir mon profil RIASEC"
        }
    });

    // Fetch UI content on mount
    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            // Group questions for the API
            const groupedQuestions: {[key: string]: string[]} = { R:[], I:[], A:[], S:[], E:[], C:[] };
            RAW_QUESTIONS.forEach(q => {
                if(groupedQuestions[q.type]) groupedQuestions[q.type].push(q.text);
            });

            try {
                // Attempt to get content from AI with a timeout
                const aiPromise = getRiasecTestPageContent(groupedQuestions);
                // 3 second timeout
                const timeoutPromise = new Promise<RiasecTestPageContent>((_, reject) => 
                    setTimeout(() => reject(new Error("Timeout")), 3000)
                );
                
                const content = await Promise.race([aiPromise, timeoutPromise]);
                if (isMounted) setUiContent(content.test_page_ui);
            } catch (e) {
                console.warn("Using fallback UI for RIASEC test", e);
                if (isMounted) setUiContent(getFallbackContent(groupedQuestions));
            } finally {
                if (isMounted) {
                    if (riasecResult) {
                        setResult(riasecResult);
                        setStep('result');
                    } else {
                        setStep('test');
                    }
                }
            }
        };
        init();

        return () => { isMounted = false; };
    }, [riasecResult]);

    const handleToggleAnswer = (text: string, type: string) => {
        // We use text as ID since questions come from API and might not have stable IDs in the new structure
        // Alternatively, map back to RAW_QUESTIONS
        const originalQ = RAW_QUESTIONS.find(q => q.text === text && q.type === type);
        const id = originalQ ? originalQ.id : `${type}-${text.substring(0, 5)}`;

        const newAnswers = new Set(answers);
        if (newAnswers.has(id)) {
            newAnswers.delete(id);
        } else {
            newAnswers.add(id);
        }
        setAnswers(newAnswers);
    };

    const calculateScores = () => {
        const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
        answers.forEach(id => {
            const q = RAW_QUESTIONS.find(q => q.id === id) || { type: id.charAt(0) }; // Fallback for ID parsing
            if (q && q.type in scores) {
                scores[q.type as keyof typeof scores]++;
            }
        });
        return scores;
    };

    const handleContextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setContextData({ ...contextData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setStep('loading_analysis');
        const scores = calculateScores();
        
        try {
            const analysis = await getRiasecAnalysis({
                nom: contextData.nom || '',
                age: contextData.age || '',
                groupe_age: contextData.groupe_age || '18-24',
                region: contextData.region || 'Montréal',
                objectif: contextData.objectif || 'exploration',
                scores_riasec: scores
            });
            setResult(analysis);
            setRiasecResult(analysis);
            setDashboardContent(null); // Invalidate dashboard cache
            setStep('result');
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue lors de l'analyse.");
            setStep('context');
        }
    };
    
    const handleRetake = () => {
        if(window.confirm("Veux-tu vraiment recommencer le test ? Ton résultat actuel sera remplacé.")) {
            setStep('test');
            setAnswers(new Set());
            setResult(null);
            setRiasecResult(null);
            setJobResults(null);
            setDashboardContent(null); // Invalidate dashboard cache
        }
    };

    const handleSearchJobs = async () => {
        if (!result) return;
        setIsSearchingJobs(true);
        try {
            const riasecProfile = result.profil_riasec_principal.lettres_dominantes;
            const region = contextData.region || 'Montréal';
            const jobs = await getJobSuggestions(riasecProfile, region);
            setJobResults(jobs);
        } catch (error) {
            console.error(error);
            alert("Impossible de récupérer les offres d'emploi pour le moment.");
        } finally {
            setIsSearchingJobs(false);
        }
    };

    const handleGenerateActionPlan = async () => {
        if (!result) return;
        setIsGeneratingActionPlan(true);
        try {
            const input = {
                nom: contextData.nom,
                lettres_dominantes: result.profil_riasec_principal.lettres_dominantes,
                objectif: contextData.objectif,
                region: contextData.region,
                pistes_metiers: result.pistes_metiers,
                pistes_activites: result.pistes_activites
            };

            // Navigate to Action Plan page with data
            navigate('/plan-action', { state: { inputData: input } });

        } catch (error) {
            console.error(error);
            alert("Impossible de générer le plan d'action.");
        } finally {
            setIsGeneratingActionPlan(false);
        }
    };

    // Progress calculation
    const progressPercentage = useMemo(() => {
        if (answers.size === 0) return 0;
        return Math.min(100, Math.round((answers.size / RAW_QUESTIONS.length) * 100)); 
    }, [answers]);

    if (step === 'loading_ui') {
        return (
            <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
                <h2 className="text-xl font-semibold">Chargement du test...</h2>
                <p className="text-slate-500 mt-2">Cela ne devrait pas être long.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {step === 'test' && uiContent && (
                <div className="space-y-8 animate-fade-in">
                     {/* Header */}
                     <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm text-center border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-center mb-4">
                            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
                                <CompassIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">{uiContent.page_title}</h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            {uiContent.intro_text}
                        </p>
                     </div>

                     {/* Definitions Grid */}
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(uiContent.explication_riasec.definitions).map(([letter, def]) => {
                            const colors = DIMENSION_COLORS[letter] || DIMENSION_COLORS['R'];
                            return (
                                <div key={letter} className={`${colors.bg} dark:bg-slate-800/50 p-4 rounded-lg border ${colors.border} dark:border-slate-700`}>
                                    <span className={`font-bold ${colors.text} text-xl mb-1 block`}>{letter}</span>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">{def}</p>
                                </div>
                            );
                        })}
                     </div>

                     {/* Instructions & Progress */}
                     <div className="sticky top-20 z-30 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 backdrop-blur-md bg-opacity-95 dark:bg-opacity-95">
                        <div className="text-sm text-slate-700 dark:text-slate-300 font-medium flex items-center">
                            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs mr-2">Info</span>
                            Sélectionne ce qui te correspond.
                        </div>
                        <div className="w-full md:w-1/3 flex items-center gap-3">
                            <div className="flex-grow">
                                <div className="flex justify-between text-xs mb-1 font-bold text-slate-600 dark:text-slate-400">
                                    <span>Progression</span>
                                    <span>{Math.round(progressPercentage)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                    <div 
                                        className="bg-gradient-to-r from-primary-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                                        style={{ width: `${Math.max(5, progressPercentage)}%` }}
                                    ></div>
                                </div>
                            </div>
                             <Button 
                                onClick={() => setStep('context')} 
                                disabled={answers.size === 0}
                                className="!py-1 !px-3 text-xs whitespace-nowrap"
                            >
                                Terminer <ArrowLongRightIcon className="w-3 h-3 ml-1" />
                            </Button>
                        </div>
                     </div>
                    
                    {/* Questions Sections */}
                    <div className="space-y-8 pb-20">
                        {uiContent.form_structure.dimensions.map((dim) => {
                            const colors = DIMENSION_COLORS[dim.code] || DIMENSION_COLORS['R'];
                            return (
                                <div key={dim.code} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <div className={`${colors.bg} dark:bg-slate-700/30 px-6 py-3 border-b ${colors.border} dark:border-slate-700 flex items-center gap-3`}>
                                        <span className={`${colors.badge} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm`}>{dim.code}</span>
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{dim.titre}</h3>
                                    </div>
                                    <div className="p-4 grid md:grid-cols-2 gap-4">
                                        {dim.questions.map((qText, idx) => {
                                            // Re-find ID for logic
                                            const originalQ = RAW_QUESTIONS.find(rq => rq.text === qText && rq.type === dim.code);
                                            const qId = originalQ ? originalQ.id : `${dim.code}-${idx}`;
                                            const isSelected = answers.has(qId);

                                            return (
                                                <div 
                                                    key={idx}
                                                    onClick={() => handleToggleAnswer(qText, dim.code)}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-3 h-full ${
                                                        isSelected
                                                        ? `border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-inner transform scale-[0.98]` 
                                                        : 'border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 hover:border-primary-200 dark:hover:border-primary-700 hover:bg-white dark:hover:bg-slate-700'
                                                    }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                                        isSelected ? 'bg-primary-600 border-primary-600' : 'border-slate-300 bg-white dark:bg-slate-600'
                                                    }`}>
                                                        {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                    <span className={`text-sm font-medium leading-snug ${isSelected ? 'text-primary-900 dark:text-primary-100' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {qText}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Bottom Action Bar */}
                     <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
                        <div className="max-w-4xl mx-auto flex justify-between items-center">
                             <div className="text-sm text-slate-500 hidden md:block">
                                 {answers.size} réponses enregistrées
                             </div>
                             <Button 
                                onClick={() => setStep('context')} 
                                disabled={answers.size === 0}
                                className="w-full md:w-auto px-8 py-3 text-lg shadow-xl shadow-indigo-500/30 bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105 transition-all rounded-full"
                            >
                                {uiContent.form_structure.bouton_soumettre} <ArrowLongRightIcon className="w-6 h-6 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {step === 'context' && (
                <Card className="max-w-2xl mx-auto animate-fade-in">
                    <div className="text-center mb-8">
                         <div className="bg-indigo-100 dark:bg-indigo-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                             <SparklesIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                         </div>
                         <h2 className="text-2xl font-bold mb-2">Dernière étape !</h2>
                         <p className="text-slate-600 dark:text-slate-400">Ces infos nous aideront à personnaliser ton résultat.</p>
                    </div>
                   
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-200">Ton Prénom (Optionnel)</label>
                            <input 
                                type="text" 
                                name="nom" 
                                value={contextData.nom} 
                                onChange={handleContextChange}
                                placeholder="Comment t'appelles-tu ?"
                                className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:border-slate-700"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-200">Groupe d'âge</label>
                                <select 
                                    name="groupe_age" 
                                    value={contextData.groupe_age} 
                                    onChange={handleContextChange}
                                    className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:border-slate-700"
                                >
                                    <option value="15-17">15-17 ans</option>
                                    <option value="18-24">18-24 ans</option>
                                    <option value="25-35">25-35 ans</option>
                                    <option value="35+">35 ans et plus</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-200">Région</label>
                                <select 
                                    name="region" 
                                    value={contextData.region} 
                                    onChange={handleContextChange}
                                    className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:border-slate-700"
                                >
                                    <option value="Montréal">Montréal</option>
                                    <option value="Québec">Québec</option>
                                    <option value="Laval">Laval</option>
                                    <option value="Gatineau">Gatineau</option>
                                    <option value="Sherbrooke">Sherbrooke</option>
                                    <option value="Saguenay">Saguenay</option>
                                    <option value="Mauricie">Mauricie</option>
                                    <option value="Estrie">Estrie</option>
                                    <option value="Laurentides">Laurentides</option>
                                    <option value="Lanaudière">Lanaudière</option>
                                    <option value="Montérégie">Montérégie</option>
                                    <option value="Bas-Saint-Laurent">Bas-Saint-Laurent</option>
                                    <option value="Gaspésie">Gaspésie</option>
                                    <option value="Côte-Nord">Côte-Nord</option>
                                    <option value="Abitibi-Témiscamingue">Abitibi-Témiscamingue</option>
                                    <option value="Nord-du-Québec">Nord-du-Québec</option>
                                    <option value="Outaouais">Outaouais</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-200">Ton objectif principal</label>
                            <select 
                                name="objectif" 
                                value={contextData.objectif} 
                                onChange={handleContextChange}
                                className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:border-slate-700"
                            >
                                <option value="exploration">Explorer mes intérêts</option>
                                <option value="choix_programme_scolaire">Choisir un programme d'études</option>
                                <option value="recherche_emploi">Trouver un emploi</option>
                                <option value="reorientation">Me réorienter</option>
                            </select>
                        </div>

                        <div className="pt-6 flex gap-3">
                            <Button onClick={() => setStep('test')} variant="secondary" className="flex-1">
                                Retour
                            </Button>
                            <Button onClick={handleSubmit} className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                Voir mon profil RIASEC
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {step === 'loading_analysis' && (
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
                    <h2 className="text-xl font-semibold">Analyse de ton profil en cours...</h2>
                    <p className="text-slate-500">L'IA rédige ton portrait personnalisé.</p>
                </div>
            )}

            {step === 'result' && result && (
                <div className="space-y-8 animate-fade-in pb-20">
                    {/* Header Result */}
                    <div className="bg-indigo-600 text-white rounded-lg p-8 shadow-lg">
                        <h1 className="text-3xl font-bold mb-2">{result.titre_profil}</h1>
                        <div className="flex gap-2 mt-4">
                            {result.profil_riasec_principal.lettres_dominantes.map(letter => (
                                <span key={letter} className="w-12 h-12 rounded-full bg-white text-indigo-600 font-bold text-2xl flex items-center justify-center shadow-lg">
                                    {letter}
                                </span>
                            ))}
                        </div>
                        <p className="mt-4 text-indigo-100 text-lg italic">"{result.profil_riasec_principal.description_courte}"</p>
                    </div>

                    {/* Detail Description */}
                    <Card>
                        <h2 className="text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">Qui es-tu ?</h2>
                        <p className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300">
                            {result.description_detaillee}
                        </p>
                    </Card>

                    {/* Forces */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <h2 className="text-xl font-bold mb-4 flex items-center text-green-600 dark:text-green-400">
                                <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Tes Forces
                            </h2>
                            <ul className="space-y-2">
                                {result.forces.map((force, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                                        <span>{force}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                        
                        <Card>
                            <h2 className="text-xl font-bold mb-4 flex items-center text-blue-600 dark:text-blue-400">
                                <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                Actions concrètes
                            </h2>
                             <ul className="space-y-3">
                                {result.pistes_activites.map((act, idx) => (
                                    <li key={idx} className="text-sm">
                                        <strong className="uppercase text-xs tracking-wider text-slate-500 block mb-1">{act.type}</strong>
                                        {act.description}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>

                    {/* Jobs */}
                    <Card>
                        <h2 className="text-xl font-bold mb-6">Pistes de métiers et domaines</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {result.pistes_metiers.map((metier, idx) => (
                                <div key={idx} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-700/50 dark:border-slate-600 hover:bg-slate-100 transition-colors">
                                    <h3 className="font-bold text-lg">{metier.intitule}</h3>
                                    <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded mt-1 inline-block mb-2">
                                        {metier.secteur}
                                    </span>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{metier.commentaire}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* ACTION PLAN & JOB SEARCH SECTION */}
                    <div className="border-t-2 border-dashed border-slate-300 dark:border-slate-700 my-8"></div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Action Plan CTA */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800 transition-transform hover:-translate-y-1">
                             <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 flex items-center">
                                <div className="bg-purple-200 dark:bg-purple-800 p-1.5 rounded-lg mr-3">
                                    <CompassIcon className="w-5 h-5 text-purple-700 dark:text-purple-300" />
                                </div>
                                Ton Plan d'action
                             </h2>
                             <p className="text-slate-600 dark:text-slate-300 mb-4">
                                 Génère un plan étape par étape pour atteindre ton objectif ({contextData.objectif}).
                             </p>
                             <Button 
                                onClick={handleGenerateActionPlan}
                                isLoading={isGeneratingActionPlan}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                             >
                                Créer mon plan d'action
                             </Button>
                        </div>

                        {/* Job Search CTA */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 transition-transform hover:-translate-y-1">
                             <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 flex items-center">
                                <div className="bg-blue-200 dark:bg-blue-800 p-1.5 rounded-lg mr-3">
                                    <SparklesIcon className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                                </div>
                                Offres d'emploi
                             </h2>
                             <p className="text-slate-600 dark:text-slate-300 mb-4">
                                 Trouve des offres concrètes adaptées à ton profil RIASEC.
                             </p>
                             <Button 
                                onClick={handleSearchJobs} 
                                isLoading={isSearchingJobs}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                             >
                                Voir les offres d'emploi
                             </Button>
                        </div>
                    </div>

                    {jobResults && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-xl border border-blue-100 dark:border-slate-700 animate-fade-in mb-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                    Offres suggérées
                                </h2>
                                <p className="text-slate-600 dark:text-slate-300 mt-1">
                                    Basées sur ton profil RIASEC ({result.profil_riasec_principal.lettres_dominantes.join('-')})
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    {jobResults.resultats_filtrés.map((job) => (
                                        <div key={job.id} className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow relative overflow-hidden">
                                            {/* Score Badge */}
                                            <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg ${
                                                job.score_pertinence >= 90 ? 'bg-green-100 text-green-800' :
                                                job.score_pertinence >= 75 ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {job.score_pertinence}% Compatible
                                            </div>

                                            <h3 className="font-bold text-lg text-slate-800 dark:text-white pr-20">{job.titre}</h3>
                                            <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-2">{job.employeur}</p>
                                            
                                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-3">
                                                <MapPinIcon className="w-3 h-3 mr-1" />
                                                {job.lieu}
                                                <span className="mx-2">•</span>
                                                {job.type_emploi}
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {job.tags_riasec.map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded text-sm text-slate-600 dark:text-slate-300 italic mb-4 border-l-2 border-primary-300">
                                                "{job.raison_match}"
                                            </div>

                                            <p className="text-sm text-slate-700 dark:text-slate-200 mb-4 line-clamp-2">
                                                {job.resume}
                                            </p>

                                            <a href={job.url} className="block text-center w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded font-medium text-sm transition-colors">
                                                Voir l'offre (Simulation)
                                            </a>
                                        </div>
                                    ))}
                                </div>
                                {jobResults.message_global && (
                                    <p className="text-center text-sm text-slate-500 italic">
                                        {jobResults.message_global}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Motivation & Footer */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-r-lg mt-8">
                        <p className="text-lg font-medium text-slate-800 dark:text-slate-200 italic">
                            "{result.message_motivation}"
                        </p>
                    </div>

                    <div className="text-center pt-8 pb-4">
                        <p className="text-xs text-slate-400 max-w-2xl mx-auto">
                            {result.avertissement}
                        </p>
                        <div className="mt-6 flex justify-center gap-4">
                            <Button onClick={() => setStep('test')} variant="secondary">
                                Retour à l'accueil du test
                            </Button>
                            <button onClick={handleRetake} className="text-sm text-red-500 hover:text-red-700 hover:underline flex items-center">
                                <ArrowPathIcon className="w-4 h-4 mr-1" /> Recommencer à zéro
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiasecPage;
