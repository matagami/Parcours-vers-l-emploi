
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, BudgetData, Skill, RiasecInput, RiasecOutput, JobOffer, JobSearchOutput, CjeSearchResponse, JobSearchPreparationResponse, RiasecTestPageContent, ActionPlanOutput, DashboardContent } from '../types';
import { INITIAL_RESUME_DATA, PREFILLED_RESUME_DATA, CJES_DATA } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. Using mock data.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// Helper to clean markdown from JSON response
const cleanJsonResponse = (text: string): string => {
  if (!text) return "{}";
  // Extract content from markdown code blocks if present
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
      return match[1].trim();
  }
  // Otherwise return the text trimmed
  return text.trim();
};

// Mock Data for Jobs API Simulation
const MOCK_JOBS_DATA: JobOffer[] = [
    { id: "1", titre: "Apprenti Charpentier-menuisier", employeur: "Construction Bâtisse Inc.", lieu: "Montréal", description: "Aide à la coupe de bois, assemblage de murs et pose de gypse sur chantiers résidentiels.", type_emploi: "Temps plein", url: "#" },
    { id: "2", titre: "Préposé(e) aux bénéficiaires", employeur: "Résidence Le Havre", lieu: "Québec", description: "Assister les résidents dans leurs activités quotidiennes et veiller à leur confort.", type_emploi: "Temps partiel", url: "#" },
    { id: "3", titre: "Assistant(e) Marketing et Réseaux Sociaux", employeur: "Agence Créative Zoom", lieu: "Télétravail / Montréal", description: "Création de contenu visuel et gestion des communautés en ligne.", type_emploi: "Contrat", url: "#" },
    { id: "4", titre: "Commis d'entrepôt", employeur: "Logistique Express", lieu: "Laval", description: "Réception, tri et expédition de marchandises. Utilisation de transpalette.", type_emploi: "Temps plein", url: "#" },
    { id: "5", titre: "Conseiller(ère) à la vente", employeur: "Boutique Plein Air", lieu: "Sherbrooke", description: "Conseiller les clients sur l'équipement de randonnée et camping.", type_emploi: "Temps partiel", url: "#" },
    { id: "6", titre: "Technicien(ne) en informatique niveau 1", employeur: "TechSupport", lieu: "Gatineau", description: "Support technique aux utilisateurs, installation de logiciels et dépannage.", type_emploi: "Temps plein", url: "#" },
    { id: "7", titre: "Mécanicien(ne) de véhicules lourds", employeur: "Transport Nord", lieu: "Saguenay", description: "Entretien préventif et réparation de camions et machinerie.", type_emploi: "Temps plein", url: "#" },
    { id: "8", titre: "Réceptionniste / Adjoint(e) administratif", employeur: "Clinique Dentaire Sourire", lieu: "Trois-Rivières", description: "Gestion de l'agenda, accueil des patients et facturation.", type_emploi: "Temps plein", url: "#" },
    { id: "9", titre: "Ouvrier(ère) paysagiste", employeur: "Vert Nature", lieu: "Lévis", description: "Entretien de terrains, tonte de pelouse et plantation de fleurs.", type_emploi: "Saisonnier", url: "#" },
    { id: "10", titre: "Aide-Cuisinier(ère)", employeur: "Resto bistro Le Coin", lieu: "Montréal", description: "Préparation des ingrédients, aide au montage des assiettes et nettoyage.", type_emploi: "Soir / Fin de semaine", url: "#" },
    { id: "11", titre: "Animateur(trice) de camp de jour", employeur: "Loisirs Communautaires", lieu: "Longueuil", description: "Animation d'activités sportives et artistiques pour enfants de 5 à 12 ans.", type_emploi: "Été", url: "#" },
    { id: "12", titre: "Analyste de données junior", employeur: "Banque Nationale", lieu: "Montréal", description: "Analyse de tableaux Excel, production de rapports statistiques.", type_emploi: "Temps plein", url: "#" },
    { id: "13", titre: "Journalier(ère) de production", employeur: "Usine FabTech", lieu: "Drummondville", description: "Opérer des machines de production et assembler des pièces.", type_emploi: "Temps plein", url: "#" },
    { id: "14", titre: "Coordonnateur(trice) d'événements", employeur: "Festivals Inc.", lieu: "Québec", description: "Planification logistique et coordination d'événements culturels.", type_emploi: "Contrat", url: "#" },
    { id: "15", titre: "Technicien(ne) de laboratoire", employeur: "PharmaLab", lieu: "Laval", description: "Effectuer des tests de qualité sur des échantillons.", type_emploi: "Temps plein", url: "#" },
    { id: "16", titre: "Manœuvre minier", employeur: "Mine Or", lieu: "Val-d'Or", description: "Travaux divers sous terre et en surface.", type_emploi: "Temps plein - 14/14", url: "#" },
    { id: "17", titre: "Guide touristique", employeur: "Tourisme Gaspésie", lieu: "Gaspé", description: "Faire visiter les attraits locaux aux groupes de touristes.", type_emploi: "Saisonnier", url: "#" }
];

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
    projects: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
            }
        }
    },
    certifications: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                issuer: { type: Type.STRING },
                date: { type: Type.STRING },
            }
        }
    }
  },
};

export const parseResumeText = async (text: string): Promise<ResumeData> => {
  if (!ai) {
    // Mock response for development without API key
    return Promise.resolve({
      ...PREFILLED_RESUME_DATA,
      personalInfo: { ...PREFILLED_RESUME_DATA.personalInfo, name: 'Alex Tremblay (Exemple)' }
    });
  }

  const prompt = `
    Tu es un expert en création de CV pour les jeunes adultes au Québec. Analyse le texte conversationnel suivant et extrais les informations pour créer un CV structuré.

    Tes tâches sont:
    1.  **Extraire les données structurées** : Remplis les champs pour les informations personnelles, les expériences, la formation, les projets personnels ou académiques, et les certifications.
        - Pour les dates, essaie de les standardiser (ex: "2020-Présent").
        - Pour les descriptions, résume les tâches en une seule phrase concise.
        - Pour les compétences, extrais uniquement les compétences mentionnées explicitement par l'utilisateur. N'en invente pas.
        - Si une information n'est pas présente, laisse le champ vide.
    2. **Pas d'emojis** : Ne jamais utiliser d'emojis ou d'émoticônes dans les champs extraits.

    Retourne le résultat complet en format JSON en respectant le schéma fourni.
    
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

    const jsonString = cleanJsonResponse(response.text);
    const parsedData = JSON.parse(jsonString);
    
    // Sanitize the output and format skills
    const skillsArray: Skill[] = (Array.isArray(parsedData.skills) ? parsedData.skills : [])
      .map((skillName: string) => ({ name: skillName, description: '' }));

    const finalData: ResumeData = {
        personalInfo: parsedData.personalInfo || INITIAL_RESUME_DATA.personalInfo,
        experiences: Array.isArray(parsedData.experiences) ? parsedData.experiences : [],
        education: Array.isArray(parsedData.education) ? parsedData.education : [],
        skills: skillsArray,
        projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
        certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : [],
    };
    return finalData;

  } catch (error) {
    console.error("Error parsing resume text with Gemini:", error);
    throw new Error("Impossible de transformer le texte en CV. Essaie de nouveau.");
  }
};

export const parseResumeFile = async (base64File: string, mimeType: string): Promise<ResumeData> => {
    if (!ai) {
        // Mock response for development without API key
        return Promise.resolve(PREFILLED_RESUME_DATA);
    }

    const filePart = {
        inlineData: {
            data: base64File,
            mimeType,
        },
    };
    
    const textPart = {
        text: `
        Tu es un expert en création de CV pour les jeunes adultes au Québec. Analyse le fichier de CV suivant (qui peut être une image, un PDF, ou un document Word) et extrais les informations pour créer un CV structuré.

        Tes tâches sont:
        1.  **Extraire les données structurées** : Remplis les champs pour les informations personnelles, les expériences, la formation, les projets et les certifications.
            - Pour les dates, essaie de les standardiser (ex: "2020-Présent").
            - Pour les descriptions, résume les tâches en une seule phrase concise.
            - Pour les compétences, extrais uniquement les compétences clés visibles sur le CV. N'en invente pas.
            - Si une information n'est pas présente, laisse le champ vide.
        2. **Pas d'emojis** : Ne jamais utiliser d'emojis ou d'émoticônes dans les champs extraits.

        Retourne le résultat complet en format JSON en respectant le schéma fourni.
      `
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [filePart, textPart] },
            config: {
              responseMimeType: 'application/json',
              responseSchema: resumeSchema,
            },
          });
      
          const jsonString = cleanJsonResponse(response.text);
          const parsedData = JSON.parse(jsonString);
          
          // Sanitize the output and format skills
          const skillsArray: Skill[] = (Array.isArray(parsedData.skills) ? parsedData.skills : [])
            .map((skillName: string) => ({ name: skillName, description: '' }));
      
          const finalData: ResumeData = {
              personalInfo: parsedData.personalInfo || INITIAL_RESUME_DATA.personalInfo,
              experiences: Array.isArray(parsedData.experiences) ? parsedData.experiences : [],
              education: Array.isArray(parsedData.education) ? parsedData.education : [],
              skills: skillsArray,
              projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
              certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : [],
          };
          return finalData;

    } catch (error) {
        console.error("Error parsing resume file with Gemini:", error);
        throw new Error("Impossible d'analyser le fichier du CV. Assure-toi que le fichier est lisible.");
      }
}

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
    5.  **RÈGLE STRICTE : Pas d'emojis.** N'utilise JAMAIS d'emojis ou d'émoticônes dans les suggestions.

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
    
    const jsonString = cleanJsonResponse(response.text);
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

export const getBudgetAnalysis = async (budget: BudgetData): Promise<string> => {
  if (!ai) {
    return Promise.resolve(
      "Voici une analyse basée sur tes chiffres (Mode Simulation) :\n\n" +
      "1. **Logement** : Ton loyer occupe une part importante de ton budget. Idéalement, il ne devrait pas dépasser 30% de ton revenu net.\n" +
      "2. **Épargne** : C'est excellent d'avoir prévu un fonds d'urgence. Essaie de l'augmenter progressivement.\n" +
      "3. **Alimentation** : Tes dépenses semblent réalistes, mais surveille les sorties au restaurant qui peuvent vite s'accumuler."
    );
  }

  const totalExpenses = Object.values(budget.expenses.housing).reduce((a,b)=>a+b,0) + 
                        Object.values(budget.expenses.food).reduce((a,b)=>a+b,0) +
                        Object.values(budget.expenses.transport).reduce((a,b)=>a+b,0) +
                        Object.values(budget.expenses.communications).reduce((a,b)=>a+b,0) +
                        Object.values(budget.expenses.dailyLife).reduce((a,b)=>a+b,0);

  const prompt = `
    Tu es un conseiller financier bienveillant pour les jeunes adultes qui emménagent dans leur premier appartement.
    Analyse le budget mensuel suivant :
    
    - Revenu Net: ${budget.income}$
    - Total Dépenses: ${totalExpenses}$
    - Balance: ${budget.income - totalExpenses}$
    
    Détails des dépenses:
    - Logement (Loyer, assurance, énergie): ${Object.values(budget.expenses.housing).reduce((a,b)=>a+b,0)}$
    - Alimentation: ${Object.values(budget.expenses.food).reduce((a,b)=>a+b,0)}$
    - Transport: ${Object.values(budget.expenses.transport).reduce((a,b)=>a+b,0)}$
    - Communications: ${Object.values(budget.expenses.communications).reduce((a,b)=>a+b,0)}$
    - Vie quotidienne: ${Object.values(budget.expenses.dailyLife).reduce((a,b)=>a+b,0)}$
    - Épargne/Imprévus: ${budget.expenses.emergency}$
    
    Donne 3 conseils ou observations clés (positifs ou constructifs) sous forme de liste à puces pour aider ce jeune à réussir son autonomie financière. Sois concis et direct.
    
    RÈGLE STRICTE : Ne JAMAIS utiliser d'emojis ou d'émoticônes.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing budget:", error);
    throw new Error("Impossible d'analyser le budget pour le moment.");
  }
};

export const getRiasecAnalysis = async (input: RiasecInput): Promise<RiasecOutput> => {
    if (!ai) {
        return Promise.resolve({
            titre_profil: "Profil Démo (Sans IA)",
            profil_riasec_principal: {
                lettres_dominantes: ["R", "I"],
                description_courte: "Ceci est une réponse simulée car aucune clé API n'est configurée."
            },
            description_detaillee: "Veuillez configurer votre clé API pour obtenir une analyse réelle basée sur vos réponses.",
            forces: ["Force simulée 1", "Force simulée 2"],
            pistes_metiers: [{ intitule: "Métier Test", secteur: "Test", commentaire: "Exemple" }],
            pistes_activites: [{ type: "exploration", description: "Activité test" }],
            message_motivation: "Configurez l'API pour continuer !",
            avertissement: "Ceci est une démo."
        });
    }

    const prompt = `
    RÔLE
    Tu es un conseiller d’orientation virtuel pour une application web.
    Ton rôle : à partir des résultats du test RIASEC, produire un portrait clair et motivant.

    RÈGLES ANTI-HALLUCINATION
    1. Tu ne donnes jamais de diagnostic psychologique.
    2. Tu ne présentes pas le profil comme figé.
    3. Si une information est absente (nom, région, âge), tu n’inventes rien.
    4. Tu NE DOIS JAMAIS utiliser d'emojis ou d'émoticônes.
    5. Tu respectes strictement le format JSON.

    DONNÉES D’ENTRÉE
    ${JSON.stringify(input, null, 2)}

    TA TÂCHE
    À partir de ces données, tu dois :
    1. Identifier les 2 ou 3 lettres RIASEC dominantes en te basant sur les scores.
    2. Expliquer le profil en langage simple et positif (ton : chaleureux, "tu").
    3. Mettre en valeur les forces de la personne.
    4. Proposer des pistes de métiers ou de domaines d’activités cohérentes avec le profil et le contexte québécois.
    5. Proposer des actions concrètes à court terme.

    FORMAT DE SORTIE
    Tu dois TOUJOURS répondre avec un JSON valide conforme au schéma.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            titre_profil: { type: Type.STRING },
            profil_riasec_principal: {
                type: Type.OBJECT,
                properties: {
                    lettres_dominantes: { type: Type.ARRAY, items: { type: Type.STRING } },
                    description_courte: { type: Type.STRING }
                }
            },
            description_detaillee: { type: Type.STRING },
            forces: { type: Type.ARRAY, items: { type: Type.STRING } },
            pistes_metiers: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        intitule: { type: Type.STRING },
                        secteur: { type: Type.STRING },
                        commentaire: { type: Type.STRING }
                    }
                }
            },
            pistes_activites: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        description: { type: Type.STRING }
                    }
                }
            },
            message_motivation: { type: Type.STRING },
            avertissement: { type: Type.STRING }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });

        return JSON.parse(cleanJsonResponse(response.text));
    } catch (error) {
        console.error("Error analysing RIASEC profile:", error);
        throw new Error("Impossible d'analyser le profil pour le moment.");
    }
};

export const prepareJobSearch = async (riasecProfile: string[], region: string | null, objectif: string): Promise<JobSearchPreparationResponse> => {
  if (!ai) {
    return Promise.resolve({
      ui: {
        section_title: "Trouver des emplois selon ton profil",
        intro_text: "Voici une simulation de la section de recherche d'emploi.",
        explication: "En l'absence de clé API, nous utilisons des données simulées.",
        bouton_lancer_recherche: "Voir les offres (Démo)"
      },
      parametres_recherche: {
        mots_cles: ["démo", "emploi", "test"],
        region: region,
        type_emploi: "temps_plein",
        secteurs_suggeres: ["Administration", "Vente"]
      },
      message_global: "Mode démo actif."
    });
  }

  const input = {
    profil_riasec: riasecProfile,
    region: region,
    objectif: objectif
  };

  const prompt = `
    RÔLE
    Tu es un assistant IA qui prépare la transition vers la recherche d'emploi.
    
    RÈGLES ANTI-HALLUCINATION
    1. Ne JAMAIS utiliser d'emojis ou d'émoticônes.
    2. Reste factuel et motivant.
    3. Utilise le "tu".

    ENTRÉE
    ${JSON.stringify(input, null, 2)}

    BUT
    Générer l'UI et les paramètres de recherche pour la section emplois.

    FORMAT DE SORTIE
    JSON valide selon le schéma.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      ui: {
        type: Type.OBJECT,
        properties: {
          section_title: { type: Type.STRING },
          intro_text: { type: Type.STRING },
          explication: { type: Type.STRING },
          bouton_lancer_recherche: { type: Type.STRING }
        }
      },
      parametres_recherche: {
        type: Type.OBJECT,
        properties: {
          mots_cles: { type: Type.ARRAY, items: { type: Type.STRING } },
          region: { type: Type.STRING },
          type_emploi: { type: Type.STRING },
          secteurs_suggeres: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      },
      message_global: { type: Type.STRING }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    return JSON.parse(cleanJsonResponse(response.text));
  } catch (error) {
    console.error("Error preparing job search:", error);
    throw new Error("Impossible de préparer la recherche d'emploi.");
  }
};

export const getJobSuggestions = async (riasecProfile: string[], region: string, keywords: string[] = [], typeEmploi: string | null = null): Promise<JobSearchOutput> => {
    if (!ai) {
        return Promise.resolve({
            resultats_filtrés: [
                {
                    id: "mock1",
                    titre: "Emploi simulé (Sans API)",
                    employeur: "Entreprise Démo",
                    lieu: region,
                    type_emploi: "Temps plein",
                    url: "#",
                    score_pertinence: 85,
                    tags_riasec: ["R", "I"],
                    resume: "Ceci est un résultat simulé car l'API n'est pas connectée.",
                    raison_match: "Correspond à votre profil technique."
                }
            ],
            message_global: "Mode démo activé. Veuillez configurer une clé API."
        });
    }

    const input = {
        profil_riasec: riasecProfile,
        mots_cles_suggeres: keywords,
        type_emploi_suggere: typeEmploi,
        secteur_cible: null, // Optional based on implementation
        region: region,
        emplois_api: MOCK_JOBS_DATA // Feeding the mock data as "API" data
    };

    const prompt = `
    RÔLE
    Tu es un assistant IA qui filtre des offres d'emploi selon un profil RIASEC.

    RÈGLES ANTI-HALLUCINATION
    1. Ne JAMAIS inventer d'offres d'emploi. Utilise uniquement "emplois_api" fourni en entrée.
    2. Ne JAMAIS utiliser d'emojis ou d'émoticônes.
    3. Reste factuel.

    ENTRÉE
    ${JSON.stringify(input, null, 2)}

    TA TÂCHE
    1. Filtrer les offres cohérentes avec le profil RIASEC et la région.
    2. Créer un score de pertinence.
    3. Expliquer le match en 1 phrase.

    FORMAT DE SORTIE
    JSON valide uniquement.
    `;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            resultats_filtrés: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        titre: { type: Type.STRING },
                        employeur: { type: Type.STRING },
                        lieu: { type: Type.STRING },
                        type_emploi: { type: Type.STRING },
                        url: { type: Type.STRING },
                        score_pertinence: { type: Type.NUMBER },
                        tags_riasec: { type: Type.ARRAY, items: { type: Type.STRING } },
                        resume: { type: Type.STRING },
                        raison_match: { type: Type.STRING }
                    }
                }
            },
            message_global: { type: Type.STRING }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });

        return JSON.parse(cleanJsonResponse(response.text));
    } catch (error) {
        console.error("Error getting job suggestions:", error);
        throw new Error("Impossible de trouver des emplois pour le moment.");
    }
};

export const findBestCJE = async (ville: string, codePostal: string): Promise<CjeSearchResponse> => {
    if (!ai) {
        // Mock Fallback
        const closest = CJES_DATA[0];
        return Promise.resolve({
            dashboard_button_ui: {
              label: "Trouve ton CJE",
              description: "Entre ta ville ou ton code postal pour savoir quel CJE peut t’aider."
            },
            page_ui: {
                page_title: "Trouve ton Carrefour jeunesse-emploi",
                intro_text: "Entre ta ville ou ton code postal pour savoir quel CJE peut t’aider.",
                form: {
                  ville: { label: "Entre ta ville", placeholder: "ex: Montréal" },
                  code_postal: { label: "Entre ton code postal", placeholder: "ex: H2X 1Y2" },
                  bouton_rechercher: "Trouver mon CJE"
                },
                messages: {
                  info_initiale: "Utilise la recherche pour commencer.",
                  aucune_entree: "Tu dois entrer au moins une information.",
                  aucun_resultat: "Aucun CJE trouvé.",
                  resultats_trouves: "Voici le CJE le plus proche."
                }
            },
            cje_plus_proche: {
                ...closest,
                telephone: closest.telephone || null,
                raison_selection: "Ceci est une réponse simulée (API Key manquante).",
                lien_google_maps: `https://www.google.com/maps/search/?api=1&query=${closest.latitude},${closest.longitude}`
            },
            top_3_cjes: [{
                id: closest.id,
                nom: closest.nom,
                ville: closest.ville,
                adresse: closest.adresse,
                lien_google_maps: `https://www.google.com/maps/search/?api=1&query=${closest.latitude},${closest.longitude}`
            }],
            message_global: "Mode démo activé."
        });
    }

    const input = {
        entree_utilisateur: {
            ville: ville || null,
            code_postal: codePostal || null
        },
        cjes: CJES_DATA
    };

    const prompt = `
    RÔLE
    Tu es un assistant pour trouver le bon Carrefour Jeunesse-Emploi (CJE).

    RÈGLES ANTI-HALLUCINATION
    1. Tu n'inventes aucune donnée CJE. Utilise la liste fournie.
    2. Ne JAMAIS utiliser d'emojis ou d'émoticônes.
    3. Reste factuel.

    ENTRÉE
    ${JSON.stringify(input, null, 2)}

    TA TÂCHE
    1. Générer les textes de l'interface (bouton dashboard, page recherche).
    2. Trouver le CJE le plus proche selon l'entrée utilisateur.

    FORMAT DE SORTIE
    JSON valide uniquement.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            dashboard_button_ui: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            },
            page_ui: {
                type: Type.OBJECT,
                properties: {
                    page_title: { type: Type.STRING },
                    intro_text: { type: Type.STRING },
                    form: {
                        type: Type.OBJECT,
                        properties: {
                            ville: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    placeholder: { type: Type.STRING }
                                }
                            },
                            code_postal: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    placeholder: { type: Type.STRING }
                                }
                            },
                            bouton_rechercher: { type: Type.STRING }
                        }
                    },
                    messages: {
                        type: Type.OBJECT,
                        properties: {
                            info_initiale: { type: Type.STRING },
                            aucune_entree: { type: Type.STRING },
                            aucun_resultat: { type: Type.STRING },
                            resultats_trouves: { type: Type.STRING }
                        }
                    }
                }
            },
            cje_plus_proche: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    nom: { type: Type.STRING },
                    ville: { type: Type.STRING },
                    adresse: { type: Type.STRING },
                    siteWeb: { type: Type.STRING },
                    telephone: { type: Type.STRING },
                    raison_selection: { type: Type.STRING },
                    lien_google_maps: { type: Type.STRING },
                }
            },
            top_3_cjes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        nom: { type: Type.STRING },
                        ville: { type: Type.STRING },
                        adresse: { type: Type.STRING },
                        lien_google_maps: { type: Type.STRING },
                    }
                }
            },
            message_global: { type: Type.STRING }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });

        return JSON.parse(cleanJsonResponse(response.text));
    } catch (error) {
        console.error("Error finding CJE:", error);
        throw new Error("Impossible de trouver le CJE pour le moment.");
    }
}

export const getRiasecTestPageContent = async (questions: any): Promise<RiasecTestPageContent> => {
    if (!ai) {
        // Fallback mock data
        return Promise.resolve({
            dashboard_button_ui: {
                label: "Passe le test RIASEC",
                description: "Découvre ton profil en répondant à quelques questions.",
                tailwind_classes: "inline-flex items-center justify-center px-4 py-2 w-full rounded-lg bg-primary-600 text-white shadow hover:bg-primary-700",
                react_snippet: ""
            },
            test_page_ui: {
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
                        { code: "R", titre: "Réaliste", questions: questions.R || [] },
                        { code: "I", titre: "Investigateur", questions: questions.I || [] },
                        { code: "A", titre: "Artistique", questions: questions.A || [] },
                        { code: "S", titre: "Social", questions: questions.S || [] },
                        { code: "E", titre: "Entreprenant", questions: questions.E || [] },
                        { code: "C", titre: "Conventionnel", questions: questions.C || [] }
                    ],
                    bouton_soumettre: "Voir mon profil RIASEC"
                }
            }
        });
    }

    const input = {
        mode: "questions_courtes",
        questions: questions
    };

    const prompt = `
    RÔLE
    Tu es un assistant IA qui génère l'interface du test RIASEC.

    RÈGLES ANTI-HALLUCINATION
    1. Ne JAMAIS utiliser d'emojis ou d'émoticônes.
    2. Reste factuel et encourageant.
    
    ENTRÉE
    ${JSON.stringify(input, null, 2)}

    TA TÂCHE
    Générer les textes de l'interface du test RIASEC.

    FORMAT DE SORTIE
    JSON valide uniquement.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            dashboard_button_ui: {
                type: Type.OBJECT,
                properties: {
                    label: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tailwind_classes: { type: Type.STRING },
                    react_snippet: { type: Type.STRING }
                }
            },
            test_page_ui: {
                type: Type.OBJECT,
                properties: {
                    page_title: { type: Type.STRING },
                    intro_text: { type: Type.STRING },
                    explication_riasec: {
                        type: Type.OBJECT,
                        properties: {
                            texte_court: { type: Type.STRING },
                            definitions: {
                                type: Type.OBJECT,
                                properties: {
                                    R: { type: Type.STRING },
                                    I: { type: Type.STRING },
                                    A: { type: Type.STRING },
                                    S: { type: Type.STRING },
                                    E: { type: Type.STRING },
                                    C: { type: Type.STRING }
                                }
                            }
                        }
                    },
                    progression: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            description: { type: Type.STRING }
                        }
                    },
                    instructions: { type: Type.STRING },
                    form_structure: {
                        type: Type.OBJECT,
                        properties: {
                            dimensions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        code: { type: Type.STRING },
                                        titre: { type: Type.STRING },
                                        questions: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    }
                                }
                            },
                            bouton_soumettre: { type: Type.STRING }
                        }
                    }
                }
            }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });

        return JSON.parse(cleanJsonResponse(response.text));
    } catch (error) {
        console.error("Error getting RIASEC page content:", error);
        throw new Error("Impossible de charger le contenu du test.");
    }
};

export const getMockDashboardContent = (context: any): DashboardContent => {
    return {
        ui: {
            welcome_title: `Bonjour ${context.utilisateur?.nom || "!"}`,
            welcome_text: "Bienvenue sur ton espace d'autonomie. Voici ce qu'on te suggère pour avancer."
        },
        dashboard_cards: [
            {
                id: "resultats_riasec",
                visible: !!context.etat?.test_riasec_passe,
                titre: "Ton profil RIASEC",
                description: `Ton profil dominant est ${context.etat?.profil_riasec ? context.etat.profil_riasec.join('') : 'inconnu'}. Revois tes résultats et tes pistes de métier.`,
                cta_label: "Voir mon profil",
                tailwind_classes: "bg-white"
            },
             {
                id: "plan_action",
                visible: !!context.etat?.plan_action_genere,
                titre: "Ton Plan d'action",
                description: "Suis les étapes personnalisées pour atteindre tes objectifs.",
                cta_label: "Voir mon plan",
                tailwind_classes: "bg-white"
            }
        ],
        message_global: "N'hésite pas à explorer tous les outils disponibles !"
    };
};

export const getDashboardContent = async (context: any): Promise<DashboardContent> => {
    if (!ai) {
        return getMockDashboardContent(context);
    }

    const prompt = `
    RÔLE
    Tu es le cerveau d'un tableau de bord intelligent pour une application d'autonomie jeunesse.

    CONTEXTE UTILISATEUR
    ${JSON.stringify(context, null, 2)}

    TA TÂCHE
    Générer le contenu du tableau de bord pour guider l'utilisateur vers la prochaine étape logique.
    1. Adapte le titre et le texte de bienvenue.
    2. Sélectionne et ordonne les cartes pertinentes.
    3. RÈGLE ABSOLUE: Ne JAMAIS générer de cartes pour inviter à utiliser les outils de base (passer le test RIASEC, faire son CV, faire son budget, trouver un CJE). Ces outils sont fixes dans l'interface en bas.
    4. Génère UNIQUEMENT des cartes de "Résultats" ou de "Suivi" si les données existent dans le contexte :
       - id: 'resultats_riasec' (seulement si context.etat.test_riasec_passe est vrai).
       - id: 'plan_action' (seulement si context.etat.plan_action_genere est vrai).
    5. Si aucune donnée de résultat n'est disponible (test pas passé, pas de plan), retourne un tableau 'dashboard_cards' VIDE.

    RÈGLES
    - Pas d'emojis.
    - Ton encourageant et dynamique.

    FORMAT DE SORTIE
    JSON valide.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            ui: {
                type: Type.OBJECT,
                properties: {
                    welcome_title: { type: Type.STRING },
                    welcome_text: { type: Type.STRING }
                }
            },
            dashboard_cards: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        visible: { type: Type.BOOLEAN },
                        titre: { type: Type.STRING },
                        description: { type: Type.STRING },
                        cta_label: { type: Type.STRING },
                        tailwind_classes: { type: Type.STRING }
                    }
                }
            },
            message_global: { type: Type.STRING }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });

        return JSON.parse(cleanJsonResponse(response.text));
    } catch (error) {
        console.error("Error generating dashboard content:", error);
        // Fallback
        return getMockDashboardContent(context);
    }
};

export const generateActionPlan = async (inputData: any): Promise<ActionPlanOutput> => {
    if (!ai) {
        // Fallback mock
         return Promise.resolve({
            ui: {
                page_title: "Ton plan d'action (Démo)",
                intro_text: "Voici un plan généré automatiquement car l'API n'est pas configurée."
            },
            resume_profil: {
                lettres: ["R", "I"],
                description: "Profil réaliste et investigateur."
            },
            actions_prioritaires: ["Faire son CV", "Chercher des offres"],
            actions_moyen_terme: ["Préparer des entrevues", "Contacter des employeurs"],
            objectif_principal: {
                titre: "Trouver un emploi",
                description: "Objectif principal de trouver un emploi dans le domaine de la construction."
            },
            ressources_region: [
                { nom: "CJE local", type: "Emploi", lien: "#" }
            ],
            cta_suite: {
                texte: "Voir les CJE",
                description: "Trouve de l'aide près de chez toi."
            },
            message_final: "Bon courage !"
        });
    }

    const prompt = `
    RÔLE
    Tu es un coach de carrière pour jeunes adultes.

    RÈGLES ANTI-HALLUCINATION
    1. Ne JAMAIS utiliser d'emojis.
    2. Sois concret et direct.

    ENTRÉE
    ${JSON.stringify(inputData, null, 2)}

    TA TÂCHE
    Générer un plan d'action personnalisé pour l'autonomie.

    FORMAT DE SORTIE
    JSON valide.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            ui: {
                type: Type.OBJECT,
                properties: {
                    page_title: { type: Type.STRING },
                    intro_text: { type: Type.STRING }
                }
            },
            resume_profil: {
                type: Type.OBJECT,
                properties: {
                    lettres: { type: Type.ARRAY, items: { type: Type.STRING } },
                    description: { type: Type.STRING }
                }
            },
            actions_prioritaires: { type: Type.ARRAY, items: { type: Type.STRING } },
            actions_moyen_terme: { type: Type.ARRAY, items: { type: Type.STRING } },
            objectif_principal: {
                type: Type.OBJECT,
                properties: {
                    titre: { type: Type.STRING },
                    description: { type: Type.STRING }
                }
            },
            ressources_region: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        nom: { type: Type.STRING },
                        type: { type: Type.STRING },
                        lien: { type: Type.STRING, nullable: true }
                    }
                }
            },
            cta_suite: {
                type: Type.OBJECT,
                properties: {
                    texte: { type: Type.STRING },
                    description: { type: Type.STRING }
                }
            },
            message_final: { type: Type.STRING }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });

        return JSON.parse(cleanJsonResponse(response.text));
    } catch (error) {
        console.error("Error generating action plan:", error);
        throw new Error("Impossible de générer le plan d'action.");
    }
};
