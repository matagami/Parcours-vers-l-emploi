
import React, { useMemo, useState } from 'react';
import { useAutonomyJourney } from '../hooks/useAutonomyJourney';
import { BudgetData } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import PieChart from '../components/PieChart';
import { getBudgetAnalysis } from '../services/geminiService';
import { SparklesIcon } from '../components/Icons';

// Gauge component defined inside to avoid extra file, but outside main component
interface GaugeProps {
  value: number; // 0 to 100
}
const Gauge: React.FC<GaugeProps> = ({ value }) => {
  const safeValue = Math.max(0, Math.min(100, value));
  const getStatus = () => {
    if (safeValue <= 70) return { color: 'text-green-500', bgColor: 'bg-green-500', label: 'Sain' };
    if (safeValue <= 90) return { color: 'text-yellow-500', bgColor: 'bg-yellow-500', label: 'Avertissement' };
    return { color: 'text-red-500', bgColor: 'bg-red-500', label: 'Danger' };
  };
  const status = getStatus();

  return (
    <div className="p-4 text-center">
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 mb-2">
        <div
          className={`${status.bgColor} h-4 rounded-full transition-all duration-500`}
          style={{ width: `${safeValue}%` }}
        ></div>
      </div>
      <p className={`font-bold ${status.color}`}>{status.label}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{safeValue.toFixed(0)}% du revenu utilisé</p>
    </div>
  );
};

// Input component for budget page
interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}
const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
    <div className="mt-1 relative rounded-md shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
        <span className="text-gray-500 sm:text-sm">$</span>
      </div>
      <input
        type="number"
        className="w-full pl-7 pr-2 py-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder="0.00"
      />
    </div>
  </div>
);

const BudgetPage: React.FC = () => {
  const { budgetData, setBudgetData } = useAutonomyJourney();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // FIX: Corrected the generic handler to be type-safe for nested objects.
  // This resolves errors from incorrect type constraints on generics and value types.
  const handleInputChange = <
    K extends 'expenses' | 'startupCosts',
    SK extends keyof BudgetData[K]
  >(
    category: K,
    subCategory: SK,
    value: BudgetData[K][SK]
  ) => {
    setBudgetData({
      ...budgetData,
      [category]: {
        ...(budgetData[category]),
        [subCategory]: value,
      },
    });
  };

  const totals = useMemo(() => {
    // FIX: Replaced the problematic reduce function with a simple loop to ensure correct type inference for totalExpenses.
    let totalExpenses = 0;
    for (const category of Object.values(budgetData.expenses)) {
        if (typeof category === 'number') {
            totalExpenses += category;
        } else if (category && typeof category === 'object') {
            for (const value of Object.values(category)) {
                totalExpenses += Number(value);
            }
        }
    }

    const totalStartupCosts = Object.values(budgetData.startupCosts).reduce((sum, val) => sum + val, 0);

    const balance = budgetData.income - totalExpenses;
    const grossAnnualRequired = (totalExpenses * 12) / 0.7; // Approx. 30% tax/deductions

    return { totalExpenses, totalStartupCosts, balance, grossAnnualRequired };
  }, [budgetData]);
  
  const chartData = useMemo(() => {
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const expenseCategories = {
        'Logement': Object.values(budgetData.expenses.housing).reduce((a, b) => a + b, 0),
        'Alimentation': Object.values(budgetData.expenses.food).reduce((a, b) => a + b, 0),
        'Transport': Object.values(budgetData.expenses.transport).reduce((a, b) => a + b, 0),
        'Communications': Object.values(budgetData.expenses.communications).reduce((a, b) => a + b, 0),
        'Vie Quotidienne': Object.values(budgetData.expenses.dailyLife).reduce((a, b) => a + b, 0),
        'Épargne': budgetData.expenses.emergency,
    };
    
    return Object.entries(expenseCategories)
        .filter(([, value]) => value > 0)
        .map(([label, value], index) => ({
            label,
            value,
            color: COLORS[index % COLORS.length]
        }));
  }, [budgetData.expenses]);

  const exportToPdf = async () => {
    if (!window.jspdf || !window.html2canvas) {
      alert("La librairie de génération PDF n'est pas encore chargée. Veuillez réessayer dans un instant.");
      console.error("PDF generation libraries not loaded.");
      return;
    }

    const element = document.getElementById('budget-summary');
    if (element) {
        setIsExportingPdf(true);
        try {
            const canvas = await window.html2canvas(element, { 
                scale: 2,
                useCORS: true
            });
            const imgData = canvas.toDataURL('image/png');
            // FIX: The jsPDF constructor with multiple arguments is deprecated and conflicts with the global type definition.
            // Switched to the recommended single-object options for compatibility.
            const pdf = new window.jspdf.jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('budget.pdf');
        } catch (error) {
            console.error("Erreur lors de la génération du PDF du budget:", error);
            alert("Une erreur est survenue lors de la création du PDF. Veuillez réessayer.");
        } finally {
            setIsExportingPdf(false);
        }
    }
  };
  
  const handleAnalyzeBudget = async () => {
    if (budgetData.income <= 0) {
        alert("Entre ton revenu d'abord pour obtenir une analyse pertinente.");
        return;
    }
    setIsAnalyzing(true);
    try {
        const result = await getBudgetAnalysis(budgetData);
        setAnalysisResult(result);
    } catch (error) {
        alert("Erreur lors de l'analyse.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Inputs Column */}
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-3xl font-bold">Simulateur de Budget - Premier Appartement</h1>
        
        <Card>
          <h2 className="text-xl font-bold mb-4">Revenu Mensuel Net</h2>
          <NumberInput 
            label="Ton salaire après impôts"
            value={budgetData.income}
            onChange={(val) => setBudgetData({ ...budgetData, income: val })}
          />
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Dépenses Mensuelles</h2>
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <h3 className="md:col-span-2 font-semibold text-lg mt-2 border-b dark:border-slate-700 pb-1">Logement</h3>
            <NumberInput label="Loyer" value={budgetData.expenses.housing.rent} onChange={(v) => handleInputChange('expenses', 'housing', { ...budgetData.expenses.housing, rent: v })} />
            <NumberInput label="Assurance locataire" value={budgetData.expenses.housing.insurance} onChange={(v) => handleInputChange('expenses', 'housing', { ...budgetData.expenses.housing, insurance: v })} />
            <NumberInput label="Électricité" value={budgetData.expenses.housing.electricity} onChange={(v) => handleInputChange('expenses', 'housing', { ...budgetData.expenses.housing, electricity: v })} />
            <NumberInput label="Chauffage" value={budgetData.expenses.housing.heating} onChange={(v) => handleInputChange('expenses', 'housing', { ...budgetData.expenses.housing, heating: v })} />

            <h3 className="md:col-span-2 font-semibold text-lg mt-4 border-b dark:border-slate-700 pb-1">Alimentation</h3>
            <NumberInput label="Épicerie" value={budgetData.expenses.food.groceries} onChange={(v) => handleInputChange('expenses', 'food', { ...budgetData.expenses.food, groceries: v })} />
            <NumberInput label="Restaurants / Sorties" value={budgetData.expenses.food.restaurants} onChange={(v) => handleInputChange('expenses', 'food', { ...budgetData.expenses.food, restaurants: v })} />
            
            <h3 className="md:col-span-2 font-semibold text-lg mt-4 border-b dark:border-slate-700 pb-1">Transport</h3>
            <NumberInput label="Transport en commun / Auto" value={budgetData.expenses.transport.publicTransport} onChange={(v) => handleInputChange('expenses', 'transport', { ...budgetData.expenses.transport, publicTransport: v })} />
            <NumberInput label="Essence" value={budgetData.expenses.transport.gas} onChange={(v) => handleInputChange('expenses', 'transport', { ...budgetData.expenses.transport, gas: v })} />
            <NumberInput label="Assurance auto" value={budgetData.expenses.transport.insurance} onChange={(v) => handleInputChange('expenses', 'transport', { ...budgetData.expenses.transport, insurance: v })} />

            <h3 className="md:col-span-2 font-semibold text-lg mt-4 border-b dark:border-slate-700 pb-1">Communications</h3>
            <NumberInput label="Internet" value={budgetData.expenses.communications.internet} onChange={(v) => handleInputChange('expenses', 'communications', { ...budgetData.expenses.communications, internet: v })} />
            <NumberInput label="Cellulaire" value={budgetData.expenses.communications.mobile} onChange={(v) => handleInputChange('expenses', 'communications', { ...budgetData.expenses.communications, mobile: v })} />

            <h3 className="md:col-span-2 font-semibold text-lg mt-4 border-b dark:border-slate-700 pb-1">Vie Quotidienne</h3>
            <NumberInput label="Vêtements" value={budgetData.expenses.dailyLife.clothing} onChange={(v) => handleInputChange('expenses', 'dailyLife', { ...budgetData.expenses.dailyLife, clothing: v })} />
            <NumberInput label="Soins personnels" value={budgetData.expenses.dailyLife.personalCare} onChange={(v) => handleInputChange('expenses', 'dailyLife', { ...budgetData.expenses.dailyLife, personalCare: v })} />
            <NumberInput label="Loisirs / Divertissement" value={budgetData.expenses.dailyLife.entertainment} onChange={(v) => handleInputChange('expenses', 'dailyLife', { ...budgetData.expenses.dailyLife, entertainment: v })} />

            <h3 className="md:col-span-2 font-semibold text-lg mt-4 border-b dark:border-slate-700 pb-1">Épargne</h3>
            <NumberInput label="Fonds d'urgence / Imprévus" value={budgetData.expenses.emergency} onChange={(v) => setBudgetData({...budgetData, expenses: {...budgetData.expenses, emergency: v}})} />
          </div>
        </Card>
      </div>

      {/* Summary Column */}
      <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
        <Card id="budget-summary">
          <h2 className="text-2xl font-bold mb-4">Résumé du Budget</h2>
          <div className="space-y-3">
            <div className="flex justify-between font-medium"><span>Revenu mensuel:</span> <span>{budgetData.income.toFixed(2)} $</span></div>
            <div className="flex justify-between"><span>Dépenses mensuelles:</span> <span className="text-red-500">-{totals.totalExpenses.toFixed(2)} $</span></div>
            <hr className="dark:border-slate-700"/>
            <div className={`flex justify-between text-lg font-bold ${totals.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <span>Balance:</span> <span>{totals.balance.toFixed(2)} $</span>
            </div>
          </div>
          {budgetData.income > 0 && <Gauge value={(totals.totalExpenses / budgetData.income) * 100} />}
          
          {chartData.length > 0 && (
            <div className="mt-6">
                <h3 className="text-lg font-bold text-center mb-2">Répartition des Dépenses</h3>
                <PieChart data={chartData} />
            </div>
          )}

          <div className="mt-4 text-center p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
            <p className="text-sm">Salaire annuel brut requis (estimé):</p>
            <p className="font-bold text-xl text-primary-600 dark:text-primary-400">{totals.grossAnnualRequired.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
          </div>
          
          <div className="mt-4 space-y-2">
            <Button 
                onClick={handleAnalyzeBudget} 
                className="w-full bg-violet-600 hover:bg-violet-700 text-white" 
                isLoading={isAnalyzing}
            >
                <SparklesIcon className="w-4 h-4 mr-2" />
                Analyser avec l'IA
            </Button>
            <Button onClick={exportToPdf} className="w-full" isLoading={isExportingPdf} variant="secondary">Exporter en PDF</Button>
          </div>
        </Card>
        
        <Card>
            <h3 className="text-xl font-bold mb-4">Surprises Réalistes</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">N'oublie pas les coûts de démarrage!</p>
            <div className="space-y-2">
                <NumberInput label="Meubles et électros" value={budgetData.startupCosts.furniture} onChange={(v) => handleInputChange('startupCosts', 'furniture', v)} />
                <NumberInput label="Dépôt de garantie / 1er mois" value={budgetData.startupCosts.deposit} onChange={(v) => handleInputChange('startupCosts', 'deposit', v)} />
                <NumberInput label="Frais de déménagement" value={budgetData.startupCosts.moving} onChange={(v) => handleInputChange('startupCosts', 'moving', v)} />
                <NumberInput label="Frais de branchement (Hydro, etc.)" value={budgetData.startupCosts.utilities} onChange={(v) => handleInputChange('startupCosts', 'utilities', v)} />
                 <hr className="my-2 dark:border-slate-700"/>
                <div className="flex justify-between font-bold">
                    <span>Total démarrage:</span> <span>{totals.totalStartupCosts.toFixed(2)} $</span>
                </div>
            </div>
        </Card>
      </div>
      
      {isExportingPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4" aria-modal="true" role="status">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 flex items-center gap-6">
                <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xl font-semibold">Génération du PDF...</span>
            </div>
        </div>
      )}

      {analysisResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                <button 
                    onClick={() => setAnalysisResult(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-2xl font-bold mb-4 flex items-center text-violet-600 dark:text-violet-400">
                    <SparklesIcon className="w-6 h-6 mr-2" />
                    Analyse de ton Budget
                </h2>
                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {analysisResult}
                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={() => setAnalysisResult(null)}>Fermer</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
