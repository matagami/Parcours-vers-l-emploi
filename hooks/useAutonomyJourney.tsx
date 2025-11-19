
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { ResumeData, BudgetData, RiasecOutput } from '../types';
import { INITIAL_RESUME_DATA, INITIAL_BUDGET_DATA } from '../constants';
import { saveJourneyData, loadJourneyData } from '../services/localStorageService';

interface AutonomyJourneyContextType {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  budgetData: BudgetData;
  setBudgetData: (data: BudgetData) => void;
  riasecResult: RiasecOutput | null;
  setRiasecResult: (data: RiasecOutput | null) => void;
  isResumeComplete: boolean;
  isBudgetComplete: boolean;
  isRiasecComplete: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  resetData: () => void;
  lastSaved: Date | null;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

const AutonomyJourneyContext = createContext<AutonomyJourneyContextType | undefined>(undefined);

export const AutonomyJourneyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [resumeData, setResumeDataState] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [budgetData, setBudgetDataState] = useState<BudgetData>(INITIAL_BUDGET_DATA);
  const [riasecResult, setRiasecResultState] = useState<RiasecOutput | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isLoadedRef = useRef(false);
  const hasUnsavedChangesRef = useRef(false);
  const latestDataRef = useRef({ resumeData, budgetData, riasecResult, theme });
  const lastSavedTimeRef = useRef<number>(Date.now());

  // Load initial data
  useEffect(() => {
    const loadedData = loadJourneyData();
    if (loadedData) {
      setResumeDataState(loadedData.resumeData || INITIAL_RESUME_DATA);
      setBudgetDataState(loadedData.budgetData || INITIAL_BUDGET_DATA);
      setRiasecResultState(loadedData.riasecResult || null);
      setTheme(loadedData.theme || 'light');
    }
    isLoadedRef.current = true;
  }, []);

  // Update theme class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Update ref and mark dirty on changes
  useEffect(() => {
    latestDataRef.current = { resumeData, budgetData, riasecResult, theme };
    if (isLoadedRef.current) {
      hasUnsavedChangesRef.current = true;
      setAutoSaveStatus('saving');
    }
  }, [resumeData, budgetData, riasecResult, theme]);

  // Debounced Save Effect
  useEffect(() => {
    if (!isLoadedRef.current) return;

    const handler = setTimeout(() => {
      if (hasUnsavedChangesRef.current) {
        try {
          saveJourneyData(latestDataRef.current);
          setLastSaved(new Date());
          lastSavedTimeRef.current = Date.now();
          hasUnsavedChangesRef.current = false;
          setAutoSaveStatus('saved');
        } catch (error) {
          console.error("Auto-save failed", error);
          setAutoSaveStatus('error');
        }
      }
    }, 2000); // Save 2 seconds after last change

    return () => clearTimeout(handler);
  }, [resumeData, budgetData, riasecResult, theme]);

  // Max Wait Interval (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (hasUnsavedChangesRef.current && (now - lastSavedTimeRef.current > 30000)) {
        try {
          saveJourneyData(latestDataRef.current);
          setLastSaved(new Date());
          lastSavedTimeRef.current = now;
          hasUnsavedChangesRef.current = false;
          setAutoSaveStatus('saved');
        } catch (error) {
          console.error("Auto-save interval failed", error);
          setAutoSaveStatus('error');
        }
      }
    }, 5000); // Check every 5s if we need to force save

    return () => clearInterval(interval);
  }, []);

  const setResumeData = (data: ResumeData) => {
    setResumeDataState(data);
  };
  
  const setBudgetData = (data: BudgetData) => {
    setBudgetDataState(data);
  };

  const setRiasecResult = (data: RiasecOutput | null) => {
    setRiasecResultState(data);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  const resetData = () => {
    setResumeDataState(INITIAL_RESUME_DATA);
    setBudgetDataState(INITIAL_BUDGET_DATA);
    setRiasecResultState(null);
    // We trigger an immediate save for reset
    setTimeout(() => {
      saveJourneyData({ resumeData: INITIAL_RESUME_DATA, budgetData: INITIAL_BUDGET_DATA, riasecResult: null, theme });
      setLastSaved(new Date());
      hasUnsavedChangesRef.current = false;
      setAutoSaveStatus('saved');
    }, 0);
  }

  const isResumeComplete = !!resumeData.personalInfo.name;
  const isBudgetComplete = budgetData.income > 0;
  const isRiasecComplete = !!riasecResult;

  const value = {
    resumeData,
    setResumeData,
    budgetData,
    setBudgetData,
    riasecResult,
    setRiasecResult,
    isResumeComplete,
    isBudgetComplete,
    isRiasecComplete,
    theme,
    toggleTheme,
    resetData,
    lastSaved,
    autoSaveStatus
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
