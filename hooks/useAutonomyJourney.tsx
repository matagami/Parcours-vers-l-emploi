
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ResumeData, BudgetData } from '../types';
import { INITIAL_RESUME_DATA, INITIAL_BUDGET_DATA } from '../constants';
import { saveJourneyData, loadJourneyData } from '../services/localStorageService';

interface AutonomyJourneyContextType {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  budgetData: BudgetData;
  setBudgetData: (data: BudgetData) => void;
  isResumeComplete: boolean;
  isBudgetComplete: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  resetData: () => void;
}

const AutonomyJourneyContext = createContext<AutonomyJourneyContextType | undefined>(undefined);

export const AutonomyJourneyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [resumeData, setResumeDataState] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [budgetData, setBudgetDataState] = useState<BudgetData>(INITIAL_BUDGET_DATA);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const loadedData = loadJourneyData();
    if (loadedData) {
      setResumeDataState(loadedData.resumeData || INITIAL_RESUME_DATA);
      setBudgetDataState(loadedData.budgetData || INITIAL_BUDGET_DATA);
      setTheme(loadedData.theme || 'light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const saveData = (data: { resumeData: ResumeData; budgetData: BudgetData; theme: 'light' | 'dark' }) => {
    saveJourneyData(data);
  };
  
  const setResumeData = (data: ResumeData) => {
    setResumeDataState(data);
    saveData({ resumeData: data, budgetData, theme });
  };
  
  const setBudgetData = (data: BudgetData) => {
    setBudgetDataState(data);
    saveData({ resumeData, budgetData: data, theme });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveData({ resumeData, budgetData, theme: newTheme });
  };
  
  const resetData = () => {
    setResumeData(INITIAL_RESUME_DATA);
    setBudgetData(INITIAL_BUDGET_DATA);
  }

  const isResumeComplete = !!resumeData.personalInfo.name;
  const isBudgetComplete = budgetData.income > 0;

  const value = {
    resumeData,
    setResumeData,
    budgetData,
    setBudgetData,
    isResumeComplete,
    isBudgetComplete,
    theme,
    toggleTheme,
    resetData
  };

  return (
    <AutonomyJourneyContext.Provider value={value}>
      {children}
    </AutonomyJourneyContext.Provider>
  );
};

export const useAutonomyJourney = (): AutonomyJourneyContextType => {
  const context = useContext(AutonomyJourneyContext);
  if (context === undefined) {
    throw new Error('useAutonomyJourney must be used within an AutonomyJourneyProvider');
  }
  return context;
};
