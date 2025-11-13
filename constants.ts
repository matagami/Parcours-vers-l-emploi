import { ResumeData, BudgetData, ResumeTemplate } from './types';

export const INITIAL_RESUME_DATA: ResumeData = {
  personalInfo: { name: '', email: '', phone: '', address: '' },
  experiences: [],
  education: [],
  skills: [],
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
};
