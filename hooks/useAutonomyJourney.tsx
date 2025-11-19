
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { ResumeData, BudgetData, RiasecOutput, DashboardContent } from '../types';
import { INITIAL_RESUME_DATA, INITIAL_BUDGET_DATA } from '../constants';
import { saveJourneyData, loadJourneyData } from '../services/localStorageService';

interface AutonomyJourneyContextType {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  budgetData: BudgetData;
  setBudgetData: (data: BudgetData) => void;
  riasecResult: RiasecOutput | null;
  setRiasecResult: (data: RiasecOutput | null) => void;
  hasActionPlan: boolean;
  setHasActionPlan: (hasPlan: boolean) => void;
  isResumeComplete: boolean;
  isBudgetComplete: boolean;
  isRiasecComplete: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  resetData: () => void;
  lastSaved: Date | null;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  dashboardContent: DashboardContent | null;
  setDashboardContent: (data: DashboardContent | null) => void;
}

const AutonomyJourneyContext = createContext<AutonomyJourneyContextType | undefined>(undefined);

export const AutonomyJourneyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [resumeData, setResumeDataState] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [budgetData, setBudgetDataState] = useState<BudgetData>(INITIAL_BUDGET_DATA);
  const [riasecResult, setRiasecResultState] = useState<RiasecOutput | null>(null);
  const [hasActionPlan, setHasActionPlanState] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const [dashboardContent, setDashboardContent] = useState<DashboardContent | null>(null);

  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isLoadedRef = useRef(false);
  const hasUnsavedChangesRef = useRef(false);
  const latestDataRef = useRef({ resumeData, budgetData, riasecResult, theme, hasActionPlan });
  const lastSavedTimeRef = useRef<number>(Date.now());

  // Load initial data
  useEffect(() => {
    const loadedData = loadJourneyData();
    if (loadedData) {
      const safeResumeData = {
          ...INITIAL_RESUME_DATA,
          ...(loadedData.resumeData || {}),
      };
      // Ensure arrays exist if coming from old data or malformed storage
      safeResumeData.experiences = Array.isArray(safeResumeData.experiences) ? safeResumeData.experiences : [];
      safeResumeData.education = Array.isArray(safeResumeData.education) ? safeResumeData.education : [];
      safeResumeData.skills = Array.isArray(safeResumeData.skills) ? safeResumeData.skills : [];
      safeResumeData.projects = Array.isArray(safeResumeData.projects) ? safeResumeData.projects : [];
      safeResumeData.certifications = Array.isArray(safeResumeData.certifications) ? safeResumeData.certifications : [];

      setResumeDataState(safeResumeData);
      setBudgetDataState(loadedData.budgetData || INITIAL_BUDGET_DATA);
      setRiasecResultState(loadedData.riasecResult || null);
      setTheme(loadedData.theme || 'light');
      // @ts-ignore - Handling legacy data that might not have hasActionPlan
      setHasActionPlanState(loadedData.hasActionPlan || false);
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
    latestDataRef.current = { resumeData, budgetData, riasecResult, theme, hasActionPlan };
    if (isLoadedRef.current) {
      hasUnsavedChangesRef.current = true;
      setAutoSaveStatus('saving');
    }
  }, [resumeData, budgetData, riasecResult, theme, hasActionPlan]);

  // Debounced Save Effect
  useEffect(() => {
    if (!isLoadedRef.current) return;

    const handler = setTimeout(() => {
      if (hasUnsavedChangesRef.current) {
        try {
          // @ts-ignore - extending save data
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
  }, [resumeData, budgetData, riasecResult, theme, hasActionPlan]);

  // Max Wait Interval (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (hasUnsavedChangesRef.current && (now - lastSavedTimeRef.current > 30000)) {
        try {
          // @ts-ignore
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

  const setHasActionPlan = (hasPlan: boolean) => {
    setHasActionPlanState(hasPlan);
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  const resetData = () => {
    setResumeDataState(INITIAL_RESUME_DATA);
    setBudgetDataState(INITIAL_BUDGET_DATA);
    setRiasecResultState(null);
    setHasActionPlanState(false);
    setDashboardContent(null);
    // We trigger an immediate save for reset
    setTimeout(() => {
      // @ts-ignore
      saveJourneyData({ resumeData: INITIAL_RESUME_DATA, budgetData: INITIAL_BUDGET_DATA, riasecResult: null, hasActionPlan: false, theme });
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
    hasActionPlan,
    setHasActionPlan,
    isResumeComplete,
    isBudgetComplete,
    isRiasecComplete,
    theme,
    toggleTheme,
    resetData,
    lastSaved,
    autoSaveStatus,
    dashboardContent,
    setDashboardContent
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
