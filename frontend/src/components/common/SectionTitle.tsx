import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle, className = '' }) => {
  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="text-3xl font-bold text-main-text mb-3">{title}</h2>
      {subtitle && <p className="text-lg text-secondary-text">{subtitle}</p>}
    </div>
  );
};
