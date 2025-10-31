import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAutonomyJourney } from '../hooks/useAutonomyJourney';
import { SunIcon, MoonIcon } from './Icons';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useAutonomyJourney();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-500 text-white'
        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`;

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
            Mon Parcours
          </NavLink>
          <div className="flex items-center space-x-4">
            <NavLink to="/" className={navLinkClass}>
              Tableau de bord
            </NavLink>
            <NavLink to="/cv" className={navLinkClass}>
              Mon CV
            </NavLink>
            <NavLink to="/budget" className={navLinkClass}>
              Mon Budget
            </NavLink>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Changer le thème"
            >
              {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;