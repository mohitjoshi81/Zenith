
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full"></div>
            <h1 className="text-xl font-bold text-slate-800">
              Zenith <span className="font-light">Wellness</span>
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
