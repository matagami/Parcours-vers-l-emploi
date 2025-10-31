
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAutonomyJourney } from '../hooks/useAutonomyJourney';
import { ResumeData, ResumeTemplate, Skill, ProfessionalExperience } from '../types';
import { parseResumeText, getResumeSuggestions } from '../services/geminiService';
import { detectSkillsFromText } from '../services/skillsService';
import { PREFILLED_RESUME_EXAMPLE } from '../constants';
import Button from '../components/Button';
import Card from '../components/Card';
import { ArrowPathIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '../components/Icons';

// Sub-components for resume templates, defined outside the main component
const MinimalistTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
    <div className="p-8 bg-white text-gray-800 font-sans text-sm">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-wider">{data.personalInfo.name}</h1>
        <p className="text-xs mt-2 text-gray-600">{data.personalInfo.email} | {data.personalInfo.phone} | {data.personalInfo.address}</p>
      </header>
      <div className="space-y-6">
        {data.experiences.length > 0 && <div>
          <h2 className="text-lg font-semibold border-b pb-1 mb-2">Expérience Professionnelle</h2>
          {data.experiences.map((exp, i) => (
            <div key={i} className="mb-3">
              <h3 className="font-bold">{exp.title}</h3>
              <p className="text-sm italic text-gray-700">{exp.company} | {exp.startDate} - {exp.endDate}</p>
              <p className="mt-1 text-sm">{exp.description}</p>
            </div>
          ))}
        </div>}
        {data.education.length > 0 && <div>
          <h2 className="text-lg font-semibold border-b pb-1 mb-2">Éducation</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-3">
              <h3 className="font-bold">{edu.degree}</h3>
              <p className="text-sm italic text-gray-700">{edu.institution} | {edu.completionDate}</p>
            </div>
          ))}
        </div>}
        {data.skills.length > 0 && <div>
          <h2 className="text-lg font-semibold border-b pb-1 mb-2">Compétences</h2>
          <ul className="flex flex-wrap gap-2 mt-2">
            {data.skills.map((skill, i) => <li key={i} className="bg-gray-200 rounded-full px-3 py-1 text-xs">{skill.name}</li>)}
          </ul>
        </div>}
      </div>
    </div>
);

const CreativeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
    <div className="p-8 bg-white text-gray-800 font-serif flex gap-8">
        <div className="w-1/3 bg-blue-900 text-white p-6 rounded-l-lg">
            <h1 className="text-3xl font-bold mb-6">{data.personalInfo.name}</h1>
            <div className="space-y-4 text-sm">
                <p>{data.personalInfo.email}</p>
                <p>{data.personalInfo.phone}</p>
                <p>{data.personalInfo.address}</p>
            </div>
            {data.skills.length > 0 && <div className="mt-8">
                <h2 className="text-lg font-semibold border-b-2 border-blue-400 pb-1 mb-3">Compétences</h2>
                <ul className="space-y-1">
                    {data.skills.map((skill, i) => <li key={i}>{skill.name}</li>)}
                </ul>
            </div>}
        </div>
        <div className="w-2/3 py-6 pr-6">
            {data.experiences.length > 0 && <div className="mb-6">
                <h2 className="text-xl font-bold text-blue-900 border-b-2 border-blue-200 pb-1 mb-3">Expérience</h2>
                {data.experiences.map((exp, i) => (
                    <div key={i} className="mb-4">
                        <h3 className="font-semibold text-lg">{exp.title}</h3>
                        <p className="text-sm italic text-gray-600">{exp.company} | {exp.startDate} - {exp.endDate}</p>
                        <p className="mt-1 text-sm">{exp.description}</p>
                    </div>
                ))}
            </div>}
            {data.education.length > 0 && <div>
                <h2 className="text-xl font-bold text-blue-900 border-b-2 border-blue-200 pb-1 mb-3">Éducation</h2>
                {data.education.map((edu, i) => (
                    <div key={i} className="mb-4">
                        <h3 className="font-semibold text-lg">{edu.degree}</h3>
                        <p className="text-sm italic text-gray-600">{edu.institution} | {edu.completionDate}</p>
                    </div>
                ))}
            </div>}
        </div>
    </div>
);

const ClassicTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
    <div className="p-8 bg-white text-gray-900 font-['Times_New_Roman',_serif] text-base">
        <h1 className="text-4xl font-bold text-center mb-1">{data.personalInfo.name}</h1>
        <p className="text-center text-sm mb-6">{data.personalInfo.email} • {data.personalInfo.phone} • {data.personalInfo.address}</p>
        <hr className="my-4 border-gray-400" />
        {data.experiences.length > 0 && <section className="mb-4">
            <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Expérience Professionnelle</h2>
            {data.experiences.map((exp, i) => (
                <div key={i} className="mb-3">
                    <div className="flex justify-between">
                        <h3 className="font-bold">{exp.title}, <span className="italic">{exp.company}</span></h3>
                        <p className="font-bold">{exp.startDate} - {exp.endDate}</p>
                    </div>
                    <p className="ml-4 mt-1">{exp.description}</p>
                </div>
            ))}
        </section>}
         <hr className="my-4 border-gray-300" />
        {data.education.length > 0 && <section className="mb-4">
            <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Éducation</h2>
            {data.education.map((edu, i) => (
                <div key={i} className="mb-2">
                    <div className="flex justify-between">
                        <h3 className="font-bold">{edu.degree}, <span className="italic">{edu.institution}</span></h3>
                        <p className="font-bold">{edu.completionDate}</p>
                    </div>
                </div>
            ))}
        </section>}
         <hr className="my-4 border-gray-300" />
        {data.skills.length > 0 && <section>
            <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Compétences</h2>
            <p>{data.skills.map(s => s.name).join(', ')}</p>
        </section>}
    </div>
);

const ModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
    <div className="bg-white text-gray-800 font-sans text-sm flex min-h-[29.7cm]">
        <aside className="w-1/3 bg-slate-100 p-8 flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{data.personalInfo.name}</h1>
                {/* Optional: Add a professional title field in the future */}
                {/* <h2 className="text-primary-600 font-semibold mt-1">Développeur Web Junior</h2> */}
            </div>
            
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-300 pb-2">Contact</h3>
                <ul className="space-y-3 text-slate-700">
                    {data.personalInfo.email && <li className="flex items-center gap-3"><EnvelopeIcon className="w-4 h-4 text-primary-600 shrink-0" /><span>{data.personalInfo.email}</span></li>}
                    {data.personalInfo.phone && <li className="flex items-center gap-3"><PhoneIcon className="w-4 h-4 text-primary-600 shrink-0" /><span>{data.personalInfo.phone}</span></li>}
                    {data.personalInfo.address && <li className="flex items-center gap-3"><MapPinIcon className="w-4 h-4 text-primary-600 shrink-0" /><span>{data.personalInfo.address}</span></li>}
                </ul>
            </div>

            {data.skills.length > 0 && <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-300 pb-2">Compétences</h3>
                <ul className="flex flex-wrap gap-2">
                    {data.skills.map((skill, i) => <li key={i} className="bg-primary-100 text-primary-800 rounded-md px-3 py-1 text-xs font-medium">{skill.name}</li>)}
                </ul>
            </div>}
        </aside>

        <main className="w-2/3 p-8">
            {data.experiences.length > 0 && <section>
                <h2 className="text-xl font-bold text-primary-600 border-b-2 border-primary-200 pb-2 mb-4">Expérience Professionnelle</h2>
                <div className="space-y-6">
                    {data.experiences.map((exp, i) => (
                        <div key={i}>
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-lg text-slate-800">{exp.title}</h3>
                                <p className="text-xs font-medium text-slate-500">{exp.startDate} - {exp.endDate}</p>
                            </div>
                            <p className="text-md italic text-slate-600">{exp.company}</p>
                            <p className="mt-2 text-sm text-slate-700">{exp.description}</p>
                        </div>
                    ))}
                </div>
            </section>}

            {data.education.length > 0 && <section className="mt-8">
                <h2 className="text-xl font-bold text-primary-600 border-b-2 border-primary-200 pb-2 mb-4">Éducation</h2>
                <div className="space-y-4">
                    {data.education.map((edu, i) => (
                        <div key={i}>
                             <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-lg text-slate-800">{edu.degree}</h3>
                                <p className="text-xs font-medium text-slate-500">{edu.completionDate}</p>
                            </div>
                            <p className="text-md italic text-slate-600">{edu.institution}</p>
                        </div>
                    ))}
                </div>
            </section>}
        </main>
    </div>
);

const ResumePage: React.FC = () => {
  const { resumeData, setResumeData } = useAutonomyJourney();
  const [conversationalText, setConversationalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [template, setTemplate] = useState<ResumeTemplate>(ResumeTemplate.Minimalist);
  const [suggestions, setSuggestions] = useState<{ [key: number]: {isLoading: boolean, list: string[]} }>({});
  const [detectedSkills, setDetectedSkills] = useState<Skill[]>([]);
  const [manualSkill, setManualSkill] = useState('');
  const [contextualTips, setContextualTips] = useState<string[]>([]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const [editingExperience, setEditingExperience] = useState<{index: number, data: ProfessionalExperience} | null>(null);

  // Debounce effect for skills detection
  useEffect(() => {
    const handler = setTimeout(() => {
      const skills = detectSkillsFromText(conversationalText);
      setDetectedSkills(skills);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [conversationalText]);

  // Effect for contextual tips
  useEffect(() => {
    if (resumeData.experiences.length === 0) {
      setContextualTips([]);
      return;
    }

    const tips: string[] = [];
    const userSkillNames = new Set(resumeData.skills.map(s => s.name.toLowerCase()));

    // Tip 1: Digital Skills
    const essentialDigitalSkills = ['microsoft office', 'google suite', 'excel', 'word', 'courriel'];
    const hasDigitalSkill = essentialDigitalSkills.some(skill => userSkillNames.has(skill) || essentialDigitalSkills.some(s => userSkillNames.has(s.split(' ')[0])));
    if (!hasDigitalSkill) {
        tips.push("Pense à ajouter des compétences numériques comme 'Microsoft Office' ou 'Google Suite'. Elles sont utiles dans presque tous les domaines !");
    }

    // Tip 2: Soft Skills
    const essentialSoftSkills = ['travail d\'équipe', 'communication', 'résolution de problèmes', 'adaptabilité', 'gestion du temps'];
    const softSkillsCount = essentialSoftSkills.filter(skill => userSkillNames.has(skill)).length;
    if (softSkillsCount < 2) {
         tips.push("Les employeurs adorent les 'soft skills' ! Assure-toi d'inclure des compétences comme 'Communication', 'Travail d'équipe' ou 'Résolution de problèmes'.");
    }
    
    // Tip 3: Languages
    const languageSkills = ['français', 'anglais', 'bilingue'];
    const hasLanguageSkill = languageSkills.some(skill => userSkillNames.has(skill));
    if(!hasLanguageSkill) {
        tips.push("N'oublie pas de mentionner les langues que tu parles, comme 'Français' ou 'Anglais'. C'est une information très importante.");
    }

    setContextualTips(tips);
  }, [resumeData.skills, resumeData.experiences]);

  const handleTransform = async () => {
    setIsLoading(true);
    setError('');
    try {
      const parsed = await parseResumeText(conversationalText);

      // Fusionne les informations personnelles : le résultat de l'IA ne doit pas écraser la saisie manuelle de l'utilisateur.
      const finalPersonalInfo = {
        name: resumeData.personalInfo.name || parsed.personalInfo.name,
        email: resumeData.personalInfo.email || parsed.personalInfo.email,
        phone: resumeData.personalInfo.phone || parsed.personalInfo.phone,
        address: resumeData.personalInfo.address || parsed.personalInfo.address,
      };

      // Fusionne les compétences : ajoute les compétences analysées par l'IA si elles ne sont pas déjà présentes.
      const finalSkills = [...resumeData.skills];
      parsed.skills.forEach(parsedSkill => {
        if (!finalSkills.find(s => s.name.toLowerCase() === parsedSkill.name.toLowerCase())) {
          finalSkills.push(parsedSkill);
        }
      });

      setResumeData({
        personalInfo: finalPersonalInfo,
        experiences: parsed.experiences, // Toujours prendre les expériences de l'analyse IA
        education: parsed.education,     // Toujours prendre la formation de l'analyse IA
        skills: finalSkills,
      });

    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSkillToggle = (skill: Skill, isSelected: boolean) => {
    if (isSelected) {
      if (!resumeData.skills.find(s => s.name === skill.name)) {
        setResumeData({ ...resumeData, skills: [...resumeData.skills, skill] });
      }
    } else {
      setResumeData({ ...resumeData, skills: resumeData.skills.filter(s => s.name !== skill.name) });
    }
  };
  
  const handleAddManualSkill = () => {
      if(manualSkill.trim() && !resumeData.skills.find(s => s.name.toLowerCase() === manualSkill.trim().toLowerCase())) {
          const newSkill: Skill = { name: manualSkill.trim(), description: "Compétence ajoutée manuellement" };
          setResumeData({ ...resumeData, skills: [...resumeData.skills, newSkill] });
          setManualSkill('');
      }
  }
  
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [name]: value,
      },
    });
  };
  
  const handleGetSuggestions = async (description: string, index: number) => {
    setSuggestions(prev => ({ ...prev, [index]: { isLoading: true, list: [] } }));
    try {
      const result = await getResumeSuggestions(description);
      setSuggestions(prev => ({ ...prev, [index]: { isLoading: false, list: result } }));
    } catch (e) {
      console.error(e);
      setSuggestions(prev => ({...prev, [index]: { isLoading: false, list: ["Erreur lors de la récupération des suggestions."] }}));
    }
  }
  
  const applySuggestion = (suggestion: string, index: number) => {
    const newExperiences = [...resumeData.experiences];
    newExperiences[index].description = suggestion;
    setResumeData({...resumeData, experiences: newExperiences});
    setSuggestions(prev => ({ ...prev, [index]: { isLoading: false, list: [] } }));
  }

  const exportToPdf = async () => {
    if (!window.jspdf || !window.html2canvas) {
      alert("La librairie de génération PDF n'est pas encore chargée. Veuillez réessayer dans un instant.");
      console.error("PDF generation libraries not loaded.");
      return;
    }

    const element = resumePreviewRef.current;
    if (!element) return;
    
    setIsExportingPdf(true);
    try {
      const canvas = await window.html2canvas(element, { 
          scale: 2,
          useCORS: true 
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new window.jspdf.jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('cv.pdf');
    } catch (error) {
      console.error("Erreur lors de la génération du PDF du CV:", error);
      alert("Une erreur est survenue lors de la création du PDF. Veuillez réessayer.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleOpenEditModal = (index: number) => {
    setEditingExperience({ index, data: { ...resumeData.experiences[index] } });
  };

  const handleCloseEditModal = () => {
    setEditingExperience(null);
  };

  const handleSaveExperience = () => {
    if (!editingExperience) return;
    const newExperiences = [...resumeData.experiences];
    newExperiences[editingExperience.index] = editingExperience.data;
    setResumeData({ ...resumeData, experiences: newExperiences });
    setEditingExperience(null);
  };

  const handleEditingExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingExperience) return;
    const { name, value } = e.target;
    setEditingExperience({
      ...editingExperience,
      data: {
        ...editingExperience.data,
        [name]: value,
      },
    });
  };

  const handleDeleteExperience = (indexToDelete: number) => {
    if (window.confirm("Es-tu sûr de vouloir supprimer cette expérience ?")) {
      const newExperiences = resumeData.experiences.filter((_, index) => index !== indexToDelete);
      setResumeData({ ...resumeData, experiences: newExperiences });
    }
  };

  const renderTemplate = () => {
    switch (template) {
      case ResumeTemplate.Modern: return <ModernTemplate data={resumeData} />;
      case ResumeTemplate.Creative: return <CreativeTemplate data={resumeData} />;
      case ResumeTemplate.Classic: return <ClassicTemplate data={resumeData} />;
      case ResumeTemplate.Minimalist:
      default:
        return <MinimalistTemplate data={resumeData} />;
    }
  };
  
  const selectedSkillNames = useMemo(() => new Set(resumeData.skills.map(s => s.name)), [resumeData.skills]);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Column */}
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Générateur de CV Intelligent</h1>
        
        <Card>
            <h2 className="text-xl font-bold mb-4">1. Tes Coordonnées</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Commence par remplir tes informations personnelles. Celles-ci apparaîtront en en-tête de ton CV.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nom complet</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={resumeData.personalInfo.name}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Courriel</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={resumeData.personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={resumeData.personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Adresse</label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={resumeData.personalInfo.address}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
            </div>
        </Card>

        <Card>
          <label htmlFor="conversational-text" className="block text-lg font-medium mb-2">2. Raconte ton parcours (Optionnel)</label>
           <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Pour un remplissage rapide, décris tes expériences ici. Notre IA extraira les informations pour compléter ton CV.
          </p>
          <textarea
            id="conversational-text"
            rows={10}
            className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600"
            placeholder="Ex: J'ai travaillé comme caissier chez IGA de 2019 à 2021, j'étais aussi plongeur avant ça..."
            value={conversationalText}
            onChange={(e) => setConversationalText(e.target.value)}
          ></textarea>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => setConversationalText(PREFILLED_RESUME_EXAMPLE)} variant="secondary">Remplir avec un exemple</Button>
          </div>
        </Card>
        
        {detectedSkills.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold mb-2">3. Valide les Compétences Détectées</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Excellent ! Nous avons trouvé {detectedSkills.length} compétences potentielles dans ton texte. Coche celles que tu veux ajouter.
            </p>
            <div className="flex flex-wrap gap-2">
              {detectedSkills.map(skill => (
                <label key={skill.name} title={skill.description} className="flex items-center space-x-2 cursor-pointer bg-slate-100 dark:bg-slate-700 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedSkillNames.has(skill.name)}
                    onChange={(e) => handleSkillToggle(skill, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium">{skill.name}</span>
                </label>
              ))}
            </div>
             <div className="mt-6">
                 <h3 className="text-lg font-semibold mb-2">Ajouter une autre compétence</h3>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={manualSkill}
                      onChange={e => setManualSkill(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddManualSkill()}
                      className="flex-grow p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600"
                      placeholder="Ex: Photoshop"
                    />
                    <Button onClick={handleAddManualSkill} variant="secondary">Ajouter</Button>
                 </div>
             </div>
          </Card>
        )}
        
        <Card>
            <h2 className="text-xl font-bold mb-2">4. Création du CV par l'IA</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Si tu as utilisé la section "Raconte ton parcours", clique ici pour que l'IA structure automatiquement tes expériences et formations.
            </p>
            <Button onClick={handleTransform} isLoading={isLoading} className="w-full" disabled={!conversationalText.trim()}>Transformer le texte en CV</Button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </Card>
        
        {contextualTips.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold mb-4">💡 Conseils Intelligents</h2>
            <ul className="space-y-3 list-disc list-inside text-sm">
              {contextualTips.map((tip, index) => (
                <li key={index} className="text-slate-600 dark:text-slate-300">{tip}</li>
              ))}
            </ul>
          </Card>
        )}
        
        {resumeData.experiences.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold mb-4">5. Gère tes expériences</h2>
             <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">Modifie, supprime ou améliore tes descriptions avec l'IA.</p>
            {resumeData.experiences.map((exp, index) => (
                <div key={index} className="mb-4 p-3 border rounded-md dark:border-slate-700 space-y-3">
                    <div>
                        <h3 className="font-semibold">{exp.title} <span className="font-normal text-slate-500 dark:text-slate-400">chez {exp.company}</span></h3>
                        <p className="text-sm mt-1">{exp.description}</p>
                    </div>

                    <div className="flex justify-between items-center border-t dark:border-slate-600 pt-3">
                        <div className="flex gap-2">
                            <Button onClick={() => handleOpenEditModal(index)} variant="secondary" className="!py-1 !px-2 text-xs">Modifier</Button>
                            <Button onClick={() => handleDeleteExperience(index)} variant="danger" className="!py-1 !px-2 text-xs">Supprimer</Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">Suggestions IA</span>
                             <Button onClick={() => handleGetSuggestions(exp.description, index)} isLoading={suggestions[index]?.isLoading} className="!p-2" aria-label="Get suggestions">
                               <ArrowPathIcon className="h-4 w-4" />
                             </Button>
                        </div>
                    </div>
                    
                    {suggestions[index]?.list && suggestions[index].list.length > 0 && (
                        <div className="mt-2 space-y-2 text-sm">
                            <h4 className="font-semibold">Suggestions :</h4>
                            <ul className="list-disc list-inside">
                                {suggestions[index].list.map((s, i) => (
                                    <li key={i} className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={() => applySuggestion(s, index)}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
          </Card>
        )}
      </div>

      {/* Preview Column */}
      <div className="sticky top-24">
        <h2 className="text-2xl font-bold mb-4">Aperçu en temps réel</h2>
        <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={() => setTemplate(ResumeTemplate.Minimalist)} variant={template === 'minimalist' ? 'primary' : 'secondary'}>Minimaliste</Button>
            <Button onClick={() => setTemplate(ResumeTemplate.Modern)} variant={template === 'modern' ? 'primary' : 'secondary'}>Moderne</Button>
            <Button onClick={() => setTemplate(ResumeTemplate.Creative)} variant={template === 'creative' ? 'primary' : 'secondary'}>Créatif</Button>
            <Button onClick={() => setTemplate(ResumeTemplate.Classic)} variant={template === 'classic' ? 'primary' : 'secondary'}>Classique</Button>
            <Button onClick={exportToPdf} disabled={!resumeData.personalInfo.name || isExportingPdf} isLoading={isExportingPdf}>Exporter en PDF</Button>
        </div>
        <div ref={resumePreviewRef} className="rounded-lg shadow-lg overflow-hidden bg-white dark:bg-slate-700">
          {renderTemplate()}
        </div>
      </div>
      
      {editingExperience && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Modifier l'expérience</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Titre du poste</label>
                        <input type="text" name="title" id="title" value={editingExperience.data.title} onChange={handleEditingExperienceChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Entreprise</label>
                        <input type="text" name="company" id="company" value={editingExperience.data.company} onChange={handleEditingExperienceChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Date de début</label>
                            <input type="text" name="startDate" id="startDate" value={editingExperience.data.startDate} onChange={handleEditingExperienceChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Date de fin</label>
                            <input type="text" name="endDate" id="endDate" value={editingExperience.data.endDate} onChange={handleEditingExperienceChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
                        <textarea name="description" id="description" rows={4} value={editingExperience.data.description} onChange={handleEditingExperienceChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <Button onClick={handleCloseEditModal} variant="secondary">Annuler</Button>
                    <Button onClick={handleSaveExperience}>Sauvegarder</Button>
                </div>
            </div>
        </div>
    )}
    {isExportingPdf && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4" aria-modal="true" role="status">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 flex items-center gap-6">
              <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xl font-semibold">Génération du PDF...</span>
          </div>
      </div>
    )}
    </div>
  );
};

export default ResumePage;