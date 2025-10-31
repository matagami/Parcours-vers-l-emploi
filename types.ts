
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

export interface ResumeData {
  personalInfo: PersonalInfo;
  experiences: ProfessionalExperience[];
  education: Education[];
  skills: Skill[];
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