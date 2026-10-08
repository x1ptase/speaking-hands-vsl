import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-border-subtle py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-secondary-text text-sm">
          &copy; {new Date().getFullYear()} Speaking Hands VSL. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
