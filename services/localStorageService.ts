
import { ResumeData, BudgetData, RiasecOutput } from '../types';

const JOURNEY_DATA_KEY = 'autonomyJourneyData';

interface JourneyData {
  resumeData: ResumeData;
  budgetData: BudgetData;
  riasecResult?: RiasecOutput | null;
  theme: 'light' | 'dark';
}

export const saveJourneyData = (data: JourneyData): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(JOURNEY_DATA_KEY, serializedData);
  } catch (error) {
    console.error("Could not save journey data to localStorage", error);
  }
};

export const loadJourneyData = (): JourneyData | null => {
  try {
    const serializedData = localStorage.getItem(JOURNEY_DATA_KEY);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error("Could not load journey data from localStorage", error);
    return null;
  }
};
