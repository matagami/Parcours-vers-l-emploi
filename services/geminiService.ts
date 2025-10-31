import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, Skill } from '../types';
import { INITIAL_RESUME_DATA } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. Using mock data.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    personalInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        address: { type: Type.STRING },
      },
    },
    experiences: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          company: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          description: { type: Type.STRING },
        },
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          institution: { type: Type.STRING },
          completionDate: { type: Type.STRING },
        },
      },
    },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
};

export const parseResumeText = async (text: string): Promise<ResumeData> => {
  if (!ai) {
    // Mock response for development without API key
    return Promise.resolve({
      personalInfo: { name: 'Alex Tremblay (Exemple)', email: 'alex.t@email.com', phone: '514-123-4567', address: '123 Rue Principale, Montréal' },
      experiences: [{ title: 'Barista', company: 'Café Central', startDate: '2020', endDate: 'Présent', description: 'Préparation de cafés spécialisés, service à la clientèle, gestion de la caisse.' }],
      education: [{ degree: 'DEC en Techniques de l\'informatique', institution: 'Cégep du Vieux Montréal', completionDate: '2018' }],
      skills: [
        { name: 'Service à la clientèle', description: '' },
        { name: 'Gestion du temps', description: '' },
        { name: 'Microsoft Office', description: '' },
        { name: 'Français', description: '' },
        { name: 'Anglais', description: '' }
      ],
    });
  }

  const prompt = `
    Tu es un expert en création de CV pour les jeunes adultes au Québec. Analyse le texte conversationnel suivant et extrais les informations pour créer un CV structuré. Retourne le résultat en format JSON en respectant le schéma fourni.
    - Pour les dates, essaie de les standardiser (ex: "2020-Présent").
    - Pour les descriptions, résume les tâches en une seule phrase concise.
    - Pour les compétences, extrais uniquement les compétences mentionnées explicitement par l'utilisateur. N'en invente pas.
    - Si une information n'est pas présente, laisse le champ vide.
    
    Texte de l'utilisateur:
    "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: resumeSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedData = JSON.parse(jsonString);
    
    // Sanitize the output and format skills
    const skillsArray: Skill[] = (Array.isArray(parsedData.skills) ? parsedData.skills : [])
      .map((skillName: string) => ({ name: skillName, description: '' }));

    const finalData: ResumeData = {
        personalInfo: parsedData.personalInfo || INITIAL_RESUME_DATA.personalInfo,
        experiences: Array.isArray(parsedData.experiences) ? parsedData.experiences : [],
        education: Array.isArray(parsedData.education) ? parsedData.education : [],
        skills: skillsArray,
    };
    return finalData;

  } catch (error) {
    console.error("Error parsing resume text with Gemini:", error);
    throw new Error("Impossible de transformer le texte en CV. Essaie de nouveau.");
  }
};

export const getResumeSuggestions = async (description: string): Promise<string[]> => {
  if (!ai) {
    return Promise.resolve([
      'Optimisé le flux de travail en servant plus de [nombre] clients par heure durant les périodes de pointe.',
      'Accru la satisfaction client de [pourcentage]% en personnalisant les commandes et en offrant un service rapide et amical.',
      'Géré avec précision les transactions financières et la caisse, assurant un balancement parfait à la fin de chaque quart de travail.',
    ]);
  }

  const prompt = `
    Tu es un coach de carrière chevronné, spécialisé dans l'aide aux jeunes adultes pour leur entrée sur le marché du travail québécois.
    Ton objectif est de transformer une description de tâche simple en 3 alternatives professionnelles, percutantes et axées sur les résultats pour un CV.

    Description originale de l'utilisateur : "${description}"

    Voici tes instructions :
    1.  **Verbes d'action forts :** Commence chaque suggestion par un verbe d'action percutant (ex: Optimisé, Coordonné, Géré, Développé, Accru).
    2.  **Quantification :** Incorpore des résultats mesurables autant que possible. Si l'utilisateur n'a pas fourni de chiffres, suggère des endroits où il pourrait en ajouter en utilisant des placeholders comme [nombre] ou [pourcentage]%. (ex: "en servant plus de [nombre] clients par jour" ou "réduisant le temps d'attente de [pourcentage]%", "augmentant la satisfaction client").
    3.  **Variété :** Propose trois options distinctes. Chaque option doit mettre en lumière un angle différent de la tâche (ex: une sur l'efficacité, une sur le service client, une sur la responsabilité).
    4.  **Clarté et concision :** Les phrases doivent être claires, concises et professionnelles.

    Retourne le résultat sous la forme d'un tableau JSON contenant exactement 3 chaînes de caractères. N'ajoute aucun texte avant ou après le tableau JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
      },
    });
    
    const jsonString = response.text.trim();
    const suggestions = JSON.parse(jsonString);

    // Ensure the response is a valid array of strings
    if (Array.isArray(suggestions) && suggestions.every(s => typeof s === 'string')) {
      return suggestions;
    }

    console.warn("Gemini returned a non-array for suggestions:", suggestions);
    return []; // Return an empty array on failure to prevent crashing the app.

  } catch (error) {
    console.error("Error getting suggestions:", error);
    throw new Error("Impossible d'obtenir des suggestions. Essaie de nouveau.");
  }
};