
import { ResumeData, BudgetData, ResumeTemplate, CJE } from './types';

export const INITIAL_RESUME_DATA: ResumeData = {
  personalInfo: { name: '', email: '', phone: '', address: '' },
  experiences: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
};

export const INITIAL_BUDGET_DATA: BudgetData = {
  income: 0,
  expenses: {
    housing: { rent: 0, insurance: 0, electricity: 0, heating: 0 },
    food: { groceries: 0, restaurants: 0 },
    transport: { publicTransport: 0, gas: 0, insurance: 0 },
    communications: { internet: 0, mobile: 0 },
    dailyLife: { clothing: 0, personalCare: 0, entertainment: 0 },
    emergency: 0,
  },
  startupCosts: { furniture: 0, deposit: 0, moving: 0, utilities: 0 }
};

export const PREFILLED_RESUME_EXAMPLE = `
Je m'appelle Alex Tremblay. Mon email est alex.tremblay@email.com et mon téléphone est 514-123-4567. J'habite au 123 Rue Principale, Montréal, QC.

De 2020 à aujourd'hui, j'ai travaillé comme Barista chez Café Central. Je préparais des cafés et servais les clients. J'ai aussi géré la caisse.

Avant ça, de 2018 à 2019, j'étais vendeur dans un magasin de vêtements. Je conseillais les clients et je m'occupais de l'inventaire. J'ai aussi été plongeur dans un restaurant pendant l'été.

J'ai un DEC en Techniques de l'informatique du Cégep du Vieux Montréal, terminé en 2018.

Mes compétences manuelles sont : Service à la clientèle, gestion du temps, Microsoft Office, et je parle français et anglais.

J'ai réalisé un projet personnel de site web pour un organisme local et j'ai mon certificat de secourisme.
`;

export const PREFILLED_RESUME_DATA: ResumeData = {
  personalInfo: {
    name: 'Alex Tremblay',
    email: 'alex.tremblay@exemple.com',
    phone: '514-123-4567',
    address: '123 Rue Principale, Montréal, QC H2X 1Y2',
  },
  experiences: [
    {
      title: 'Barista',
      company: 'Café Central',
      startDate: '2020',
      endDate: 'Présent',
      description: 'Préparation de cafés spécialisés, service à la clientèle personnalisé et gestion efficace de la caisse dans un environnement à fort volume.',
    },
    {
      title: 'Vendeur',
      company: 'Mode-Express',
      startDate: '2018',
      endDate: '2019',
      description: 'Conseil client sur les produits, gestion des stocks et de l\'inventaire, et maintien de l\'attrait visuel du magasin.',
    },
  ],
  education: [
    {
      degree: 'DEC en Techniques de l\'informatique',
      institution: 'Cégep du Vieux Montréal',
      completionDate: '2018',
    },
  ],
  skills: [
    { name: 'Service à la clientèle', description: '' },
    { name: 'Gestion de caisse', description: '' },
    { name: 'Vente et conseil', description: '' },
    { name: 'Gestion des stocks', description: '' },
    { name: 'Travail d\'équipe', description: '' },
    { name: 'Microsoft Office', description: '' },
    { name: 'Français (Natif)', description: '' },
    { name: 'Anglais (Professionnel)', description: '' },
  ],
  projects: [
    {
        title: "Site Web Communautaire",
        description: "Conception et développement d'un site web vitrine pour un organisme sans but lucratif local."
    }
  ],
  certifications: [
    {
        name: "Secourisme général et RCR",
        issuer: "Croix-Rouge canadienne",
        date: "2023"
    }
  ]
};

export const CJES_DATA: CJE[] = [
  {
    id: "cje-montreal-centre-ville",
    nom: "CJE Montréal Centre-Ville",
    ville: "Montréal",
    adresse: "1410 Rue Guy, Montréal, QC",
    siteWeb: "https://www.cjemontreal.org/",
    latitude: 45.4957,
    longitude: -73.5780,
    telephone: "514-875-9770"
  },
  {
    id: "cje-jamesie",
    nom: "CJE de la Jamésie",
    ville: "Chibougamau",
    adresse: "466, 3e Rue, Chibougamau, QC",
    siteWeb: "https://www.trouvetoncje.com",
    latitude: 49.9167,
    longitude: -74.3667,
    telephone: "418-748-7643"
  },
  {
    id: "cje-capitale-nationale",
    nom: "CJE de la Capitale-Nationale",
    ville: "Québec",
    adresse: "200-160, rue Saint-Joseph Est, Québec, QC",
    siteWeb: "https://www.cjecn.qc.ca/",
    latitude: 46.8131,
    longitude: -71.2224,
    telephone: "418-524-2345"
  },
  {
    id: "cje-sherbrooke",
    nom: "CJE de Sherbrooke",
    ville: "Sherbrooke",
    adresse: "155, rue Wellington Sud, Sherbrooke, QC",
    siteWeb: "https://www.cjesherbrooke.qc.ca/",
    latitude: 45.4001,
    longitude: -71.8991,
    telephone: "819-565-2722"
  },
  {
    id: "cje-trois-rivieres",
    nom: "CJE Trois-Rivières/MRC des Chenaux",
    ville: "Trois-Rivières",
    adresse: "100, rue Laviolette, Trois-Rivières, QC",
    siteWeb: "https://cjetr.org/",
    latitude: 46.3430,
    longitude: -72.5421,
    telephone: "819-379-3377"
  },
  {
    id: "cje-gatineau",
    nom: "CJE de l'Outaouais",
    ville: "Gatineau",
    adresse: "430, boulevard de l'Hôpital, Gatineau, QC",
    siteWeb: "https://cjeo.qc.ca/",
    latitude: 45.4776,
    longitude: -75.6950,
    telephone: "819-561-7712"
  },
  {
    id: "cje-saguenay",
    nom: "CJE Chicoutimi",
    ville: "Chicoutimi",
    adresse: "436, rue Racine Est, Chicoutimi, QC",
    siteWeb: "https://cje-chicoutimi.org/",
    latitude: 48.4276,
    longitude: -71.0600,
    telephone: "418-545-9710"
  }
];
