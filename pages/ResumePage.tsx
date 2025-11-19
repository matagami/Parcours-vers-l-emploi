
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAutonomyJourney } from '../hooks/useAutonomyJourney';
import { ResumeData, ResumeTemplate, Skill, ProfessionalExperience, Education, Project, Certification } from '../types';
import { parseResumeText, getResumeSuggestions, parseResumeFile } from '../services/geminiService';
import { detectSkillsFromText } from '../services/skillsService';
import { PREFILLED_RESUME_EXAMPLE, PREFILLED_RESUME_DATA } from '../constants';
import Button from '../components/Button';
import Card from '../components/Card';
import { ArrowPathIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, DragHandleIcon, PencilIcon, TrashIcon, ArrowLongRightIcon } from '../components/Icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


const SortableExperienceItem: React.FC<{
  exp: ProfessionalExperience;
  index: number;
  handleOpenEditModal: (index: number) => void;
  handleDeleteExperience: (index: number) => void;
  handleGetSuggestions: (description: string, index: number) => void;
  applySuggestion: (suggestion: string, index: number) => void;
  suggestions: { [key: number]: { isLoading: boolean, list: string[] } };
}> = ({ exp, index, handleOpenEditModal, handleDeleteExperience, handleGetSuggestions, applySuggestion, suggestions }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: exp.title + index }); 

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="p-3 border rounded-md dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3 touch-none">
        <div className="flex items-start gap-2">
            <div {...attributes} {...listeners} className="cursor-grab py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <DragHandleIcon className="h-5 w-5" />
            </div>
            <div className="flex-grow">
                <h3 className="font-semibold">{exp.title} <span className="font-normal text-slate-500 dark:text-slate-400">chez {exp.company}</span></h3>
                <p className="text-sm mt-1">{exp.description}</p>
            </div>
        </div>
        
        <div className="flex justify-between items-center border-t dark:border-slate-600 pt-3 ml-8">
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
            <div className="mt-2 space-y-2 text-sm ml-8">
                <h4 className="font-semibold">Suggestions :</h4>
                <ul className="list-disc list-inside">
                    {suggestions[index].list.map((s, i) => (
                        <li key={i} className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={() => applySuggestion(s, index)}>{s}</li>
                    ))}
                </ul>
            </div>
        )}
    </div>
  );
};


// Sub-components for resume templates
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
        {(data.projects || []).length > 0 && <div>
          <h2 className="text-lg font-semibold border-b pb-1 mb-2">Projets</h2>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-3">
              <h3 className="font-bold">{proj.title}</h3>
              <p className="mt-1 text-sm">{proj.description}</p>
            </div>
          ))}
        </div>}
        {(data.certifications || []).length > 0 && <div>
          <h2 className="text-lg font-semibold border-b pb-1 mb-2">Certifications</h2>
          {data.certifications.map((cert, i) => (
            <div key={i} className="mb-3">
              <h3 className="font-bold">{cert.name}</h3>
              <p className="text-sm italic text-gray-700">{cert.issuer} | {cert.date}</p>
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
             {(data.certifications || []).length > 0 && <div className="mt-8">
                <h2 className="text-lg font-semibold border-b-2 border-blue-400 pb-1 mb-3">Certifications</h2>
                <ul className="space-y-3">
                    {data.certifications.map((cert, i) => (
                        <li key={i}>
                            <p className="font-bold text-sm">{cert.name}</p>
                            <p className="text-xs opacity-80">{cert.issuer}, {cert.date}</p>
                        </li>
                    ))}
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
            {(data.projects || []).length > 0 && <div className="mt-6">
                <h2 className="text-xl font-bold text-blue-900 border-b-2 border-blue-200 pb-1 mb-3">Projets</h2>
                {data.projects.map((proj, i) => (
                    <div key={i} className="mb-4">
                        <h3 className="font-semibold text-lg">{proj.title}</h3>
                        <p className="mt-1 text-sm">{proj.description}</p>
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
        {(data.projects || []).length > 0 && <section className="mb-4">
            <hr className="my-4 border-gray-300" />
            <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Projets</h2>
            {data.projects.map((proj, i) => (
                <div key={i} className="mb-3">
                    <h3 className="font-bold">{proj.title}</h3>
                    <p className="ml-4 mt-1">{proj.description}</p>
                </div>
            ))}
        </section>}
        {(data.certifications || []).length > 0 && <section className="mb-4">
             <hr className="my-4 border-gray-300" />
            <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Certifications</h2>
            {data.certifications.map((cert, i) => (
                <div key={i} className="mb-2">
                    <div className="flex justify-between">
                        <h3 className="font-bold">{cert.name}, <span className="italic">{cert.issuer}</span></h3>
                        <p className="font-bold">{cert.date}</p>
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

             {(data.certifications || []).length > 0 && <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-300 pb-2">Certifications</h3>
                <ul className="space-y-3">
                    {data.certifications.map((cert, i) => (
                        <li key={i}>
                            <p className="font-bold text-slate-800">{cert.name}</p>
                            <p className="text-xs text-slate-600">{cert.issuer} | {cert.date}</p>
                        </li>
                    ))}
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

             {(data.projects || []).length > 0 && <section className="mt-8">
                <h2 className="text-xl font-bold text-primary-600 border-b-2 border-primary-200 pb-2 mb-4">Projets</h2>
                <div className="space-y-4">
                    {data.projects.map((proj, i) => (
                        <div key={i}>
                            <h3 className="font-bold text-lg text-slate-800">{proj.title}</h3>
                            <p className="mt-1 text-sm text-slate-700">{proj.description}</p>
                        </div>
                    ))}
                </div>
            </section>}
        </main>
    </div>
);

const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ResumePage: React.FC = () => {
  const { resumeData, setResumeData } = useAutonomyJourney();
  const [conversationalText, setConversationalText] = useState('');
  const [isTransforming, setIsTransforming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [transformError, setTransformError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [template, setTemplate] = useState<ResumeTemplate>(ResumeTemplate.Minimalist);
  const [suggestions, setSuggestions] = useState<{ [key: number]: {isLoading: boolean, list: string[]} }>({});
  const [detectedSkills, setDetectedSkills] = useState<Skill[]>([]);
  const [manualSkill, setManualSkill] = useState('');
  const [contextualTips, setContextualTips] = useState<string[]>([]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingExperience, setEditingExperience] = useState<{index: number, data: ProfessionalExperience} | null>(null);
  const [editingSkill, setEditingSkill] = useState<{index: number, data: Skill} | null>(null);
  const [editingProject, setEditingProject] = useState<{index: number, data: Project} | null>(null);
  const [editingCertification, setEditingCertification] = useState<{index: number, data: Certification} | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    setIsTransforming(true);
    setTransformError('');
    try {
      const parsed = await parseResumeText(conversationalText);

      // Fusionne les informations
      const finalPersonalInfo = {
        name: resumeData.personalInfo.name || parsed.personalInfo.name,
        email: resumeData.personalInfo.email || parsed.personalInfo.email,
        phone: resumeData.personalInfo.phone || parsed.personalInfo.phone,
        address: resumeData.personalInfo.address || parsed.personalInfo.address,
      };

      const finalSkills = [...resumeData.skills];
      parsed.skills.forEach(parsedSkill => {
        if (!finalSkills.find(s => s.name.toLowerCase() === parsedSkill.name.toLowerCase())) {
          finalSkills.push(parsedSkill);
        }
      });

      const existingExperiences = new Set(resumeData.experiences.map(e => `${(e.title || '').trim().toLowerCase()}|${(e.company || '').trim().toLowerCase()}`));
      const newExperiences = parsed.experiences.filter(
          (exp: ProfessionalExperience) => !existingExperiences.has(`${(exp.title || '').trim().toLowerCase()}|${(exp.company || '').trim().toLowerCase()}`)
      );

      const existingEducation = new Set(resumeData.education.map(e => `${(e.degree || '').trim().toLowerCase()}|${(e.institution || '').trim().toLowerCase()}`));
      const newEducation = parsed.education.filter(
          (edu: Education) => !existingEducation.has(`${(edu.degree || '').trim().toLowerCase()}|${(edu.institution || '').trim().toLowerCase()}`)
      );

      const newProjects = (parsed.projects || []).filter(p => !resumeData.projects?.some(rp => rp.title === p.title));
      const newCertifications = (parsed.certifications || []).filter(c => !resumeData.certifications?.some(rc => rc.name === c.name));

      setResumeData({
        personalInfo: finalPersonalInfo,
        experiences: [...resumeData.experiences, ...newExperiences],
        education: [...resumeData.education, ...newEducation],
        skills: finalSkills,
        projects: [...(resumeData.projects || []), ...newProjects],
        certifications: [...(resumeData.certifications || []), ...newCertifications],
      });

    } catch (e: any) {
      setTransformError(e.message);
    } finally {
      setIsTransforming(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          if (typeof reader.result !== 'string') {
              return reject('Le fichier n\'a pas pu être lu.');
          }
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUploadButtonClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');

    const isSupported = SUPPORTED_FILE_TYPES.includes(file.type) || file.type.startsWith('image/');
    
    if (!isSupported) {
      setUploadError("Type de fichier non supporté. Veuillez sélectionner une image (JPG, PNG), un PDF, ou un document Word (.doc, .docx).");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    
    if (!window.confirm("Ceci remplacera toutes les données actuelles de votre CV par les informations extraites du fichier. Voulez-vous continuer ?")) {
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        return;
    }

    setIsUploading(true);
    try {
      const base64File = await fileToBase64(file);
      const parsed = await parseResumeFile(base64File, file.type);
      setResumeData(parsed);
      setConversationalText('');
    } catch (e: any) {
      setUploadError(e.message);
    } finally {
      setIsUploading(false);
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSkillToggle = (skill: Skill, isSelected: boolean) => {
    if (isSelected) {
      if (!resumeData.skills.find(s => s.name.toLowerCase() === skill.name.toLowerCase())) {
        setResumeData({ ...resumeData, skills: [...resumeData.skills, skill] });
      }
    } else {
      setResumeData({ ...resumeData, skills: resumeData.skills.filter(s => s.name.toLowerCase() !== skill.name.toLowerCase()) });
    }
  };
  
  const handleAddManualSkill = () => {
      if(manualSkill.trim() && !resumeData.skills.find(s => s.name.toLowerCase() === manualSkill.trim().toLowerCase())) {
          const newSkill: Skill = { name: manualSkill.trim(), description: "" };
          setResumeData({ ...resumeData, skills: [...resumeData.skills, newSkill] });
          setManualSkill('');
      }
  }

  const handleDeleteSkill = (indexToDelete: number) => {
    if (window.confirm("Es-tu sûr de vouloir supprimer cette compétence ?")) {
      const newSkills = resumeData.skills.filter((_, index) => index !== indexToDelete);
      setResumeData({ ...resumeData, skills: newSkills });
    }
  };
  
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleAddNewExperience = () => {
    setEditingExperience({
      index: -1,
      data: { title: '', company: '', startDate: '', endDate: '', description: '' }
    });
  };

  const handleCloseEditModal = () => {
    setEditingExperience(null);
  };

  const handleSaveExperience = () => {
    if (!editingExperience) return;

    if (editingExperience.index === -1) {
      setResumeData({
        ...resumeData,
        experiences: [...resumeData.experiences, editingExperience.data]
      });
    } else {
      const newExperiences = [...resumeData.experiences];
      newExperiences[editingExperience.index] = editingExperience.data;
      setResumeData({ ...resumeData, experiences: newExperiences });
    }
    
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

  const handleOpenEditSkillModal = (index: number) => {
    setEditingSkill({ index, data: { ...resumeData.skills[index] } });
  };

  const handleCloseEditSkillModal = () => {
    setEditingSkill(null);
  };

  const handleSaveSkill = () => {
    if (!editingSkill) return;
    const newSkills = [...resumeData.skills];
    newSkills[editingSkill.index] = editingSkill.data;
    setResumeData({ ...resumeData, skills: newSkills });
    setEditingSkill(null);
  };

  const handleEditingSkillChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingSkill) return;
    const { name, value } = e.target;
    setEditingSkill({
      ...editingSkill,
      data: {
        ...editingSkill.data,
        [name]: value,
      },
    });
  };
  
  // Project Handlers
  const handleAddProject = () => setEditingProject({ index: -1, data: { title: '', description: '' } });
  const handleEditProject = (index: number) => setEditingProject({ index, data: { ...resumeData.projects[index] } });
  const handleDeleteProject = (index: number) => {
    if(window.confirm("Supprimer ce projet ?")) {
        setResumeData({...resumeData, projects: resumeData.projects.filter((_, i) => i !== index)});
    }
  };
  const handleSaveProject = () => {
      if (!editingProject) return;
      const projects = [...(resumeData.projects || [])];
      if (editingProject.index === -1) projects.push(editingProject.data);
      else projects[editingProject.index] = editingProject.data;
      setResumeData({...resumeData, projects});
      setEditingProject(null);
  }

  // Certification Handlers
  const handleAddCertification = () => setEditingCertification({ index: -1, data: { name: '', issuer: '', date: '' } });
  const handleEditCertification = (index: number) => setEditingCertification({ index, data: { ...resumeData.certifications[index] } });
  const handleDeleteCertification = (index: number) => {
      if(window.confirm("Supprimer cette certification ?")) {
          setResumeData({...resumeData, certifications: resumeData.certifications.filter((_, i) => i !== index)});
      }
  };
  const handleSaveCertification = () => {
      if (!editingCertification) return;
      const certifications = [...(resumeData.certifications || [])];
      if (editingCertification.index === -1) certifications.push(editingCertification.data);
      else certifications[editingCertification.index] = editingCertification.data;
      setResumeData({...resumeData, certifications});
      setEditingCertification(null);
  }


  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = resumeData.experiences.findIndex((exp, i) => (exp.title + i) === active.id);
      const newIndex = resumeData.experiences.findIndex((exp, i) => (exp.title + i) === over.id);

      if (oldIndex > -1 && newIndex > -1) {
        setResumeData({
          ...resumeData,
          experiences: arrayMove(resumeData.experiences, oldIndex, newIndex),
        });
      }
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nom complet</label>
                <input type="text" name="name" value={resumeData.personalInfo.name} onChange={handlePersonalInfoChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Courriel</label>
                <input type="email" name="email" value={resumeData.personalInfo.email} onChange={handlePersonalInfoChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Téléphone</label>
                <input type="tel" name="phone" value={resumeData.personalInfo.phone} onChange={handlePersonalInfoChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Adresse</label>
                <input type="text" name="address" value={resumeData.personalInfo.address} onChange={handlePersonalInfoChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
              </div>
            </div>
        </Card>

        <Card>
          <label className="block text-lg font-medium mb-2">2. Raconte ton parcours (Optionnel)</label>
          <textarea
            rows={10}
            className="w-full p-3 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            placeholder="Ex: J'ai travaillé comme caissier chez IGA..."
            value={conversationalText}
            onChange={(e) => setConversationalText(e.target.value)}
            disabled={isUploading}
          ></textarea>
           <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,.doc,.docx" />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => setConversationalText(PREFILLED_RESUME_EXAMPLE)} variant="secondary" disabled={isUploading}>Remplir avec un exemple</Button>
            <Button onClick={handleUploadButtonClick} variant="secondary" disabled={isUploading}>{isUploading ? "Téléchargement..." : "Télécharger un CV"}</Button>
            <Button onClick={handleTransform} isLoading={isTransforming} disabled={!conversationalText.trim() || isUploading}>
              <span>Transformer le texte</span>
              <ArrowLongRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </div>
          {transformError && <p className="text-red-500 mt-2">{transformError}</p>}
          {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
        </Card>
        
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">3. Expériences</h2>
                <Button onClick={handleAddNewExperience} variant="secondary" className="!py-1">Ajouter</Button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={resumeData.experiences.map((exp, i) => exp.title + i)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {resumeData.experiences.map((exp, index) => (
                            <SortableExperienceItem
                                key={exp.title + index}
                                exp={exp}
                                index={index}
                                handleOpenEditModal={handleOpenEditModal}
                                handleDeleteExperience={handleDeleteExperience}
                                handleGetSuggestions={handleGetSuggestions}
                                applySuggestion={applySuggestion}
                                suggestions={suggestions}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </Card>

        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">4. Projets</h2>
                <Button onClick={handleAddProject} variant="secondary" className="!py-1">Ajouter</Button>
            </div>
            <div className="space-y-3">
                {(resumeData.projects || []).map((proj, index) => (
                    <div key={index} className="p-3 border rounded-md dark:border-slate-700 bg-white dark:bg-slate-800">
                         <div className="flex justify-between items-start">
                             <div>
                                 <h3 className="font-semibold">{proj.title}</h3>
                                 <p className="text-sm text-slate-600 dark:text-slate-400">{proj.description}</p>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => handleEditProject(index)} className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteProject(index)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                         </div>
                    </div>
                ))}
                {(!resumeData.projects || resumeData.projects.length === 0) && <p className="text-sm text-slate-500">Aucun projet ajouté.</p>}
            </div>
        </Card>

        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">5. Certifications</h2>
                <Button onClick={handleAddCertification} variant="secondary" className="!py-1">Ajouter</Button>
            </div>
             <div className="space-y-3">
                {(resumeData.certifications || []).map((cert, index) => (
                    <div key={index} className="p-3 border rounded-md dark:border-slate-700 bg-white dark:bg-slate-800">
                         <div className="flex justify-between items-start">
                             <div>
                                 <h3 className="font-semibold">{cert.name}</h3>
                                 <p className="text-sm text-slate-600 dark:text-slate-400">{cert.issuer} • {cert.date}</p>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => handleEditCertification(index)} className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteCertification(index)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                         </div>
                    </div>
                ))}
                {(!resumeData.certifications || resumeData.certifications.length === 0) && <p className="text-sm text-slate-500">Aucune certification ajoutée.</p>}
            </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-2">6. Compétences</h2>
            {detectedSkills.length > 0 && (
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Suggestions de l'IA</h3>
                <div className="flex flex-wrap gap-2">
                {detectedSkills.map(skill => (
                    <label key={skill.name} className="flex items-center space-x-2 cursor-pointer bg-slate-100 dark:bg-slate-700 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    <input type="checkbox" checked={selectedSkillNames.has(skill.name)} onChange={(e) => handleSkillToggle(skill, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm font-medium">{skill.name}</span>
                    </label>
                ))}
                </div>
            </div>
            )}

            <div>
                <div className="space-y-2">
                    {resumeData.skills.map((skill, index) => (
                        <div key={`${skill.name}-${index}`} className="flex items-center justify-between p-2 rounded-md bg-slate-100 dark:bg-slate-700">
                           <div><p className="font-medium">{skill.name}</p></div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenEditSkillModal(index)} className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteSkill(index)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t dark:border-slate-700">
                <h3 className="text-lg font-semibold mb-2">Ajouter manuellement</h3>
                <div className="flex gap-2">
                <input type="text" value={manualSkill} onChange={e => setManualSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddManualSkill()} className="flex-grow p-2 border border-slate-300 rounded-md bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" placeholder="Ex: Photoshop" />
                <Button onClick={handleAddManualSkill} variant="secondary">Ajouter</Button>
                </div>
            </div>
        </Card>
        
        {contextualTips.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold mb-4">💡 Conseils Intelligents</h2>
            <ul className="space-y-3 list-disc list-inside text-sm">
              {contextualTips.map((tip, index) => (<li key={index} className="text-slate-600 dark:text-slate-300">{tip}</li>))}
            </ul>
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
      
      {/* Experience Modal */}
      {editingExperience && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{editingExperience.index === -1 ? "Ajouter une expérience" : "Modifier l'expérience"}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Titre du poste</label>
                        <input type="text" name="title" value={editingExperience.data.title} onChange={handleEditingExperienceChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Entreprise</label>
                        <input type="text" name="company" value={editingExperience.data.company} onChange={handleEditingExperienceChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Date de début</label>
                            <input type="text" name="startDate" value={editingExperience.data.startDate} onChange={handleEditingExperienceChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Date de fin</label>
                            <input type="text" name="endDate" value={editingExperience.data.endDate} onChange={handleEditingExperienceChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
                        <textarea name="description" rows={4} value={editingExperience.data.description} onChange={handleEditingExperienceChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <Button onClick={handleCloseEditModal} variant="secondary">Annuler</Button>
                    <Button onClick={handleSaveExperience}>Sauvegarder</Button>
                </div>
            </div>
        </div>
      )}

      {/* Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">{editingProject.index === -1 ? "Ajouter un projet" : "Modifier le projet"}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Titre du projet</label>
                        <input type="text" value={editingProject.data.title} onChange={e => setEditingProject({...editingProject, data: {...editingProject.data, title: e.target.value}})} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
                        <textarea rows={4} value={editingProject.data.description} onChange={e => setEditingProject({...editingProject, data: {...editingProject.data, description: e.target.value}})} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <Button onClick={() => setEditingProject(null)} variant="secondary">Annuler</Button>
                    <Button onClick={handleSaveProject}>Sauvegarder</Button>
                </div>
            </div>
        </div>
      )}

      {/* Certification Modal */}
      {editingCertification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">{editingCertification.index === -1 ? "Ajouter une certification" : "Modifier la certification"}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nom</label>
                        <input type="text" value={editingCertification.data.name} onChange={e => setEditingCertification({...editingCertification, data: {...editingCertification.data, name: e.target.value}})} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Organisme émetteur</label>
                        <input type="text" value={editingCertification.data.issuer} onChange={e => setEditingCertification({...editingCertification, data: {...editingCertification.data, issuer: e.target.value}})} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Date</label>
                        <input type="text" value={editingCertification.data.date} onChange={e => setEditingCertification({...editingCertification, data: {...editingCertification.data, date: e.target.value}})} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <Button onClick={() => setEditingCertification(null)} variant="secondary">Annuler</Button>
                    <Button onClick={handleSaveCertification}>Sauvegarder</Button>
                </div>
            </div>
        </div>
      )}

      {/* Skill Modal */}
      {editingSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Modifier la compétence</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nom</label>
                        <input type="text" name="name" value={editingSkill.data.name} onChange={handleEditingSkillChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <Button onClick={handleCloseEditSkillModal} variant="secondary">Annuler</Button>
                    <Button onClick={handleSaveSkill}>Sauvegarder</Button>
                </div>
            </div>
        </div>
      )}

      {isExportingPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 flex items-center gap-6">
                <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 2000/svg">
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