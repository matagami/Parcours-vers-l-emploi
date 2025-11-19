
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { getRiasecAnalysis, getJobSuggestions } from '../services/geminiService';
import { RiasecInput, RiasecOutput, JobSearchOutput } from '../types';
import { SparklesIcon, ArrowLongRightIcon, CompassIcon, ArrowPathIcon, MapPinIcon } from '../components/Icons';
import { useAutonomyJourney } from '../hooks/useAutonomyJourney';

const QUESTIONS = [
    { id: 'R1', type: 'R', text: "J'aime utiliser des outils et des machines pour réparer ou construire." },
    { id: 'R2', type: 'R', text: "Je préfère le travail physique et les activités de plein air." },
    { id: 'R3', type: 'R', text: "Je suis réaliste, pratique et j'aime voir des résultats concrets." },
    
    { id: 'I1', type: 'I', text: "J'aime comprendre comment les choses fonctionnent et résoudre des problèmes complexes." },
    { id: 'I2', type: 'I', text: "Je suis curieux et j'aime apprendre de nouvelles choses en sciences ou mathématiques." },
    { id: 'I3', type: 'I', text: "Je préfère analyser une situation avant d'agir." },

    { id: 'A1', type: 'A', text: "J'ai beaucoup d'imagination et j'aime créer des choses originales." },
    { id: 'A2', type: 'A', text: "J'aime les activités artistiques (musique, écriture, dessin, théâtre)." },
    { id: 'A3', type: 'A', text: "Je suis expressif et j'aime sortir des sentiers battus." },

    { id: 'S1', type: 'S', text: "J'aime aider les autres, enseigner ou soigner." },
    { id: 'S2', type: 'S', text: "Je préfère travailler en équipe et échanger avec des gens." },
    { id: 'S3', type: 'S', text: "Je suis à l'écoute et sensible aux besoins de mon entourage." },

    { id: 'E1', type: 'E', text: "J'aime diriger, influencer ou convaincre les autres." },
    { id: 'E2', type: 'E', text: "J'ai de l'ambition et j'aime lancer des projets." },
    { id: 'E3', type: 'E', text: "Je suis énergique et j'aime prendre des décisions." },

    { id: 'C1', type: 'C', text: "J'aime quand les choses sont bien organisées et structurées." },
    { id: 'C2', type: 'C', text: "Je suis précis, méthodique et j'aime suivre des règles claires." },
    { id: 'C3', type: 'C', text: "J'aime travailler avec des chiffres, des données ou de la paperasse." },
];

const RiasecPage: React.FC = () => {
    const { setRiasecResult, riasecResult } = useAutonomyJourney();
    const [step, setStep] = useState<'intro' | 'test' | 'context' | 'loading' | 'result'>('intro');
    const [answers, setAnswers] = useState<Set<string>>(new Set());
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

    useEffect(() => {
        if (riasecResult) {
            setResult(riasecResult);
        }
    }, [riasecResult]);

    const handleToggleAnswer = (id: string) => {
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
            const q = QUESTIONS.find(q => q.id === id);
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
        setStep('loading');
        const scores = calculateScores();
        
        try {
            const analysis = await getRiasecAnalysis({
                nom: contextData.nom || '',
                age: contextData.age || '',
                groupe_age: contextData.groupe_age || '18-24',
                region: contextData.region || 'Non spécifié',
                objectif: contextData.objectif || 'exploration',
                scores_riasec: scores
            });
            setResult(analysis);
            setRiasecResult(analysis);
            setStep('result');
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue lors de l'analyse.");
            setStep('context');
        }
    };
    
    const handleRetake = () => {
        if(window.confirm("Veux-tu vraiment recommencer le test ? Ton résultat actuel sera remplacé.")) {
            setStep('intro');
            setAnswers(new Set());
            setResult(null);
            setRiasecResult(null);
            setJobResults(null); // Clear previous job search results
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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {step === 'intro' && (
                <Card className="text-center py-10 px-6">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                            <CompassIcon className="w-12 h-12" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Test d'Orientation RIASEC</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                        Découvre tes intérêts professionnels dominants en quelques minutes. Ce test t'aidera à mieux comprendre
                        ce qui te motive et quels types de métiers ou d'études pourraient te correspondre.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={() => setStep('test')} className="px-8 py-3 text-lg">
                            {result ? "Refaire le test" : "Commencer le test"}
                        </Button>
                        {result && (
                             <Button onClick={() => setStep('result')} variant="secondary" className="px-8 py-3 text-lg">
                                Voir mon dernier résultat
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            {step === 'test' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Coche ce qui te correspond</h2>
                        <span className="text-sm font-medium text-slate-500">
                            {answers.size} sélectionné(s)
                        </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        {QUESTIONS.map((q) => (
                            <div 
                                key={q.id} 
                                onClick={() => handleToggleAnswer(q.id)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    answers.has(q.id) 
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                                    : 'border-transparent bg-white dark:bg-slate-800 shadow hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                                        answers.has(q.id) ? 'bg-primary-600 border-primary-600' : 'border-slate-400'
                                    }`}>
                                        {answers.has(q.id) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <span className="text-slate-800 dark:text-slate-200">{q.text}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={() => setStep('context')} disabled={answers.size === 0}>
                            Suivant <ArrowLongRightIcon className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {step === 'context' && (
                <Card>
                    <h2 className="text-2xl font-bold mb-6">Presque fini ! Parle-nous un peu de toi</h2>
                    <div className="space-y-4 max-w-md mx-auto">
                        <div>
                            <label className="block text-sm font-medium mb-1">Ton Prénom (Optionnel)</label>
                            <input 
                                type="text" 
                                name="nom" 
                                value={contextData.nom} 
                                onChange={handleContextChange}
                                className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Groupe d'âge</label>
                            <select 
                                name="groupe_age" 
                                value={contextData.groupe_age} 
                                onChange={handleContextChange}
                                className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
                            >
                                <option value="15-17">15-17 ans</option>
                                <option value="18-24">18-24 ans</option>
                                <option value="25-35">25-35 ans</option>
                                <option value="35+">35 ans et plus</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Région</label>
                            <select 
                                name="region" 
                                value={contextData.region} 
                                onChange={handleContextChange}
                                className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
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
                        <div>
                            <label className="block text-sm font-medium mb-1">Ton objectif principal</label>
                            <select 
                                name="objectif" 
                                value={contextData.objectif} 
                                onChange={handleContextChange}
                                className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
                            >
                                <option value="exploration">Explorer mes intérêts</option>
                                <option value="choix_programme_scolaire">Choisir un programme d'études</option>
                                <option value="recherche_emploi">Trouver un emploi</option>
                                <option value="reorientation">Me réorienter</option>
                            </select>
                        </div>

                        <div className="pt-6">
                            <Button onClick={handleSubmit} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white">
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                Analyser mon profil
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {step === 'loading' && (
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
                    <h2 className="text-xl font-semibold">Analyse de ton profil en cours...</h2>
                    <p className="text-slate-500">L'IA rédige ton portrait personnalisé.</p>
                </div>
            )}

            {step === 'result' && result && (
                <div className="space-y-8 animate-fade-in">
                    {/* Header Result */}
                    <div className="bg-indigo-600 text-white rounded-lg p-8 shadow-lg">
                        <h1 className="text-3xl font-bold mb-2">{result.titre_profil}</h1>
                        <div className="flex gap-2 mt-4">
                            {result.profil_riasec_principal.lettres_dominantes.map(letter => (
                                <span key={letter} className="w-10 h-10 rounded-full bg-white text-indigo-600 font-bold text-xl flex items-center justify-center shadow">
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
                                        <span className="text-green-500 mr-2">✓</span>
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
                                <div key={idx} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-700/50 dark:border-slate-600">
                                    <h3 className="font-bold text-lg">{metier.intitule}</h3>
                                    <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded mt-1 inline-block mb-2">
                                        {metier.secteur}
                                    </span>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{metier.commentaire}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* JOB SEARCH SECTION */}
                    <div className="border-t-2 border-dashed border-slate-300 dark:border-slate-700 my-8"></div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-xl border border-blue-100 dark:border-slate-700">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                                    <SparklesIcon className="w-6 h-6 mr-2 text-yellow-500" />
                                    Trouver des emplois selon ton profil
                                </h2>
                                <p className="text-slate-600 dark:text-slate-300 mt-1">
                                    L'IA analyse ton profil RIASEC ({result.profil_riasec_principal.lettres_dominantes.join('-')}) pour trouver des offres compatibles dans ta région ({contextData.region || 'ta région'}).
                                </p>
                            </div>
                            <Button 
                                onClick={handleSearchJobs} 
                                isLoading={isSearchingJobs}
                                className="whitespace-nowrap"
                            >
                                Lancer la recherche
                            </Button>
                        </div>

                        {jobResults && (
                            <div className="space-y-6 animate-fade-in">
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
                        )}
                    </div>

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
                            <Button onClick={() => setStep('intro')} variant="secondary">
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
