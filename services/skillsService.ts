import { skillsDatabase } from './skillsDatabase';
import { Skill } from '../types';

export const detectSkillsFromText = (text: string): Skill[] => {
    const detectedSkills = new Map<string, Skill>();
    const lowerCaseText = text.toLowerCase();

    if (!text.trim()) {
        return [];
    }

    for (const jobKeywords in skillsDatabase) {
        const keywords = jobKeywords.split('|');
        // Crée une regex pour trouver les mots-clés comme des mots entiers, avec une gestion optionnelle du pluriel 's'
        const regex = new RegExp(`\\b(${keywords.join('|')})s?\\b`, 'i');

        if (regex.test(lowerCaseText)) {
            const skills = skillsDatabase[jobKeywords];
            skills.forEach(skill => {
                // Utilise le nom de la compétence comme clé pour éviter les doublons
                if (!detectedSkills.has(skill.name)) {
                    detectedSkills.set(skill.name, skill);
                }
            });
        }
    }

    return Array.from(detectedSkills.values());
};
