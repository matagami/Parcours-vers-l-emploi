
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, BudgetData, Skill, RiasecInput, RiasecOutput, JobOffer, JobSearchOutput, CjeSearchResponse } from '../types';
import { INITIAL_RESUME_DATA, PREFILLED_RESUME_DATA, CJES_DATA } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. Using mock data.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

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
    CONTEXTE
    Tu es un conseiller d’orientation virtuel pour une application web appelée
    « Mon parcours vers l’autonomie ». L’application est utilisée au Québec,
    surtout dans des organismes jeunesse (Carrefour jeunesse-emploi, OBNL, milieu
    communautaire).

    Cette section de l’application s’appelle : « Test – établir ton profil RIASEC ».

    Ton rôle : à partir des résultats du test RIASEC, produire un portrait clair,
    motivante et exploitable par la personne et par un·e intervenant·e.

    PUBLIC CIBLE
    - Jeunes et adultes en réflexion professionnelle (environ 15 à 35 ans).
    - Contexte québécois, parfois en région (ex. Nord-du-Québec, Jamésie).
    - Niveau de langage : simple, accessible, sans jargon.

    TON À UTILISER
    - Chaleureux, bienveillant, motivant.
    - Phrases courtes.
    - Tu tutoies la personne (« tu »).
    - Tu valorises la personne et son potentiel.
    - Tu présente le RIASEC comme un outil d’exploration, pas comme une étiquette.

    DONNÉES D’ENTRÉE
    On te fournit un JSON au format suivant :

    ${JSON.stringify(input, null, 2)}

    SIGNIFICATION DES LETTRES RIASEC
    - R : Réaliste
    - I : Investigateur
    - A : Artistique
    - S : Social
    - E : Entreprenant
    - C : Conventionnel

    TA TÂCHE
    À partir de ces données, tu dois :

    1. Identifier les 2 ou 3 lettres RIASEC dominantes en te basant sur les scores.
    2. Expliquer le profil en langage simple et positif.
    3. Mettre en valeur les forces de la personne.
    4. Proposer des pistes de métiers ou de domaines d’activités cohérentes avec :
       - le profil RIASEC,
       - l’objectif (études / emploi / exploration),
       - le contexte québécois en général.
    5. Proposer des actions concrètes à court terme (explorer, rencontrer, tester).
    6. Adapter légèrement le ton si la région est une région éloignée ou nordique
       (mais sans inventer des informations locales précises).
    7. Rappeler que le test est un outil de réflexion, pas un verdict.

    CONTRAINTES IMPORTANTES
    - Tu ne donnes jamais de diagnostic psychologique.
    - Tu n’utilises pas un ton autoritaire ou définitif.
    - Tu ne présentes pas le profil comme figé.
    - Si une information est absente (nom, région, âge), tu n’inventes rien.
    - Tu restes neutre sur les sujets sensibles (santé, diagnostic, etc.).

    FORMAT DE SORTIE
    Tu dois TOUJOURS répondre avec un JSON valide, sans texte avant ni après,
    dans la structure exacte suivante :

    {
      "titre_profil": "string",
      "profil_riasec_principal": {
        "lettres_dominantes": ["X", "Y", "Z"],
        "description_courte": "string"
      },
      "description_detaillee": "string",
      "forces": [
        "string",
        "string",
        "string"
      ],
      "pistes_metiers": [
        {
          "intitule": "string",
          "secteur": "string",
          "commentaire": "string"
        }
      ],
      "pistes_activites": [
        {
          "type": "exploration | benevolat | formation | emploi",
          "description": "string"
        }
      ],
      "message_motivation": "string",
      "avertissement": "string"
    }
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

        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error analysing RIASEC profile:", error);
        throw new Error("Impossible d'analyser le profil pour le moment.");
    }
};

export const getJobSuggestions = async (riasecProfile: string[], region: string): Promise<JobSearchOutput> => {
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
        secteur_cible: null, // Optional based on implementation
        region: region,
        emplois_api: MOCK_JOBS_DATA // Feeding the mock data as "API" data
    };

    const prompt = `
    RÔLE
    Tu es un assistant intelligence artificielle utilisé dans une application Web liée à un site WordPress.
    Cet onglet s’appelle « Trouver des emplois selon ton profil RIASEC ».
    Tu analyses un profil RIASEC et une région pour proposer les meilleures pistes d’emploi au Québec.

    TON
    - Motivant.
    - Simple.
    - Phrases courtes.
    - Tu t’adresses à l’utilisateur avec « tu ».

    ENTRÉE
    Le système t’envoie ce JSON :

    ${JSON.stringify(input, null, 2)}

    EXPLICATION
    - "emplois_api" = données brutes venant d’une API d’offres d’emploi.
    - Tu NE dois PAS inventer d’offres.
    - Tu filtres, clarifies, restructures, expliques.
    - Tu gardes seulement ce qui correspond au profil RIASEC.

    TA TÂCHE
    1. Lire le profil RIASEC.
    2. Associer les lettres dominantes à des mots-clés métiers.
    3. Parcourir les offres reçues.
    4. Trier les offres selon :
       - cohérence RIASEC
       - cohérence secteur
       - cohérence région
    5. Garder entre 5 et 12 offres maximales.
    6. Pour chaque offre retenue :
       - créer un "score_pertinence" (0–100)
       - générer un résumé court (2–3 phrases)
       - expliquer en 1 phrase pourquoi l’emploi est pertinent pour l’utilisateur.

    FORMAT DE SORTIE
    Réponds **uniquement** ce JSON :

    {
      "resultats_filtrés": [
        {
          "id": "string",
          "titre": "string",
          "employeur": "string",
          "lieu": "string",
          "type_emploi": "string",
          "url": "string",
          "score_pertinence": 0,
          "tags_riasec": ["X","Y"],
          "resume": "string",
          "raison_match": "string"
        }
      ],
      "message_global": "string"
    }

    CONTRAINTES
    - Pas de texte en dehors du JSON.
    - Pas d’invention de métiers ni d’employeurs.
    - Si peu d’offres sont pertinentes, tu expliques dans "message_global".
    - Ton ton reste positif et encourageant.
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

        return JSON.parse(response.text);
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
            ui: {
                page_title: "Trouve ton Carrefour jeunesse-emploi",
                intro_text: "Entre ta ville ou ton code postal pour savoir quel CJE peut t’aider.",
                form_labels: {
                  ville: "Entre ta ville",
                  code_postal: "Entre ton code postal",
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
    Tu es un assistant utilisé dans une application Web liée à un site WordPress.
    Tu ne fais PAS partie d’un tableau de bord.  
    Tu alimentes une page autonome intitulée : « Trouve ton CJE ».

    Cette page sert à aider une personne à trouver le Carrefour jeunesse-emploi
    le plus logique pour elle, à partir de sa ville ou de son code postal au Québec.

    TON
    - Simple.
    - Chaleureux.
    - Motivant.
    - Phrases courtes.
    - Tu tutoies.

    ENTRÉE
    Le système t’envoie ce JSON :
    ${JSON.stringify(input, null, 2)}

    RÈGLES D’INTERPRÉTATION
    - L’utilisateur tape sa ville OU son code postal (parfois les deux).
    - Tu n’as pas de géolocalisation automatique.
    - Tu essaies de trouver les CJE les plus logiques :

      - Si "ville" est renseignée :
        - privilégier les CJE dans cette ville,
        - sinon, dans une ville proche ou dans la même région (si les données le permettent).

      - Si "code_postal" est renseigné :
        - tu peux comparer les 1 à 3 premiers caractères (ex.: G8P, H2X),
        - tu t’en sers pour approcher la zone.

    - Si les deux sont fournis, tu utilises en priorité la ville, puis le code postal en soutien.

    COMPORTEMENT
    1. Vérifier s’il y a au moins une information (ville ou code postal).
    2. Si aucune info → préparer un message d’erreur adapté à l’interface.
    3. Identifier :
       - un CJE principal ("cje_plus_proche" logique),
       - jusqu’à 3 bons choix ("top_3_cjes").
    4. Pour le CJE principal :
       - expliquer en une phrase courte pourquoi il est pertinent pour la personne.
    5. Générer un lien Google Maps pour chaque CJE :
       - https://www.google.com/maps/search/?api=1&query=LAT,LON

    TU DOIS AUSSI FOURNIR LES TEXTES D’INTERFACE DE LA PAGE :
    - titre de la page,
    - texte d’introduction,
    - labels des champs,
    - texte du bouton,
    - messages d’aide / d’erreur.

    FORMAT DE SORTIE
    Tu dois toujours répondre avec ce JSON, sans texte autour :

    {
      "ui": {
        "page_title": "string",
        "intro_text": "string",
        "form_labels": {
          "ville": "string",
          "code_postal": "string",
          "bouton_rechercher": "string"
        },
        "messages": {
          "info_initiale": "string",
          "aucune_entree": "string",
          "aucun_resultat": "string",
          "resultats_trouves": "string"
        }
      },
      "cje_plus_proche": {
        "id": "string|null",
        "nom": "string|null",
        "ville": "string|null",
        "adresse": "string|null",
        "siteWeb": "string|null",
        "telephone": "string|null",
        "raison_selection": "string|null",
        "lien_google_maps": "string|null"
      },
      "top_3_cjes": [
        {
          "id": "string",
          "nom": "string",
          "ville": "string",
          "adresse": "string",
          "lien_google_maps": "string"
        }
      ],
      "message_global": "string"
    }
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            ui: {
                type: Type.OBJECT,
                properties: {
                    page_title: { type: Type.STRING },
                    intro_text: { type: Type.STRING },
                    form_labels: {
                        type: Type.OBJECT,
                        properties: {
                            ville: { type: Type.STRING },
                            code_postal: { type: Type.STRING },
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

        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error finding CJE:", error);
        throw new Error("Impossible de trouver le CJE pour le moment.");
    }
}
