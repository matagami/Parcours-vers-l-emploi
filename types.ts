
export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface ProfessionalExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  completionDate: string;
}

export interface Skill {
  name: string;
  description: string;
}

export interface Project {
  title: string;
  description: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experiences: ProfessionalExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
}

export interface BudgetData {
  income: number;
  expenses: {
    housing: { rent: number; insurance: number; electricity: number; heating: number; };
    food: { groceries: number; restaurants: number; };
    transport: { publicTransport: number; gas: number; insurance: number; };
    communications: { internet: number; mobile: number; };
    dailyLife: { clothing: number; personalCare: number; entertainment: number; };
    emergency: number;
  };
  startupCosts: {
    furniture: number;
    deposit: number;
    moving: number;
    utilities: number;
  }
}

export enum ResumeTemplate {
  Minimalist = 'minimalist',
  Creative = 'creative',
  Classic = 'classic',
  Modern = 'modern',
}

export interface RiasecInput {
    nom: string;
    age: string; // kept as string for form input flexibility
    groupe_age: string;
    region: string;
    objectif: string;
    scores_riasec: { [key: string]: number };
}

export interface RiasecOutput {
    titre_profil: string;
    profil_riasec_principal: {
        lettres_dominantes: string[];
        description_courte: string;
    };
    description_detaillee: string;
    forces: string[];
    pistes_metiers: Array<{
        intitule: string;
        secteur: string;
        commentaire: string;
    }>;
    pistes_activites: Array<{
        type: string;
        description: string;
    }>;
    message_motivation: string;
    avertissement: string;
}

export interface RiasecTestPageContent {
  dashboard_button_ui: {
    label: string;
    description: string;
    tailwind_classes: string;
    react_snippet: string;
  };
  test_page_ui: {
    page_title: string;
    intro_text: string;
    explication_riasec: {
      texte_court: string;
      definitions: {
        R: string;
        I: string;
        A: string;
        S: string;
        E: string;
        C: string;
      };
    };
    progression: {
      type: string;
      description: string;
    };
    instructions: string;
    form_structure: {
      dimensions: Array<{
        code: string;
        titre: string;
        questions: string[];
      }>;
      bouton_soumettre: string;
    };
  };
}

export interface JobOffer {
  id: string;
  titre: string;
  employeur: string;
  lieu: string;
  description: string;
  type_emploi: string;
  url: string;
}

export interface JobSearchOutput {
  resultats_filtrés: Array<{
    id: string;
    titre: string;
    employeur: string;
    lieu: string;
    type_emploi: string;
    url: string;
    score_pertinence: number;
    tags_riasec: string[];
    resume: string;
    raison_match: string;
  }>;
  message_global: string;
}

export interface JobSearchPreparationResponse {
  ui: {
    section_title: string;
    intro_text: string;
    explication: string;
    bouton_lancer_recherche: string;
  };
  parametres_recherche: {
    mots_cles: string[];
    region: string | null;
    type_emploi: string | null;
    secteurs_suggeres: string[];
  };
  message_global: string;
}

export interface CJE {
  id: string;
  nom: string;
  ville: string;
  adresse: string;
  siteWeb: string;
  telephone?: string;
  latitude: number;
  longitude: number;
}

export interface CjeSearchResponse {
  dashboard_button_ui: {
    label: string;
    description: string;
  };
  page_ui: {
    page_title: string;
    intro_text: string;
    form: {
      ville: { label: string; placeholder: string };
      code_postal: { label: string; placeholder: string };
      bouton_rechercher: string;
    };
    messages: {
      info_initiale: string;
      aucune_entree: string;
      aucun_resultat: string;
      resultats_trouves: string;
    };
  };
  cje_plus_proche: {
    id: string | null;
    nom: string | null;
    ville: string | null;
    adresse: string | null;
    siteWeb: string | null;
    telephone: string | null;
    raison_selection: string | null;
    lien_google_maps: string | null;
  };
  top_3_cjes: Array<{
    id: string;
    nom: string;
    ville: string;
    adresse: string;
    lien_google_maps: string;
  }>;
  message_global: string;
}

export interface ActionPlanOutput {
  ui: {
    page_title: string;
    intro_text: string;
  };
  resume_profil: {
    lettres: string[];
    description: string;
  };
  actions_prioritaires: string[];
  actions_moyen_terme: string[];
  objectif_principal: {
    titre: string;
    description: string;
  };
  ressources_region: Array<{
    nom: string;
    type: string;
    lien: string | null;
  }>;
  cta_suite: {
    texte: string;
    description: string;
  };
  message_final: string;
}

export interface DashboardCard {
  id: string;
  visible: boolean;
  titre: string;
  description: string;
  cta_label: string;
  tailwind_classes: string;
}

export interface DashboardContent {
  ui: {
    welcome_title: string;
    welcome_text: string;
  };
  dashboard_cards: DashboardCard[];
  message_global: string;
}
