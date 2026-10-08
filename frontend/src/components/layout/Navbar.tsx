import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hand } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const getLinkClass = (path: string) => {
    const baseClass = "text-sm font-medium transition-colors hover:text-primary";
    return location.pathname === path
      ? `${baseClass} text-primary font-semibold`
      : `${baseClass} text-secondary-text`;
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-border-subtle shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Hand className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-main-text">Speaking Hands</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className={getLinkClass('/')}>Home</Link>
            <Link to="/recognition" className={getLinkClass('/recognition')}>Recognition</Link>
            <Link to="/about" className={getLinkClass('/about')}>About</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
