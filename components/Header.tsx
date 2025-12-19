
import React from 'react';

interface HeaderProps {
  activeTab: 'info' | 'specs' | 'live';
  setActiveTab: (tab: 'info' | 'specs' | 'live') => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('info')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">Y</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">YULETIDE</span>
        </div>

        <nav className="hidden md:flex items-center gap-10">
          <button 
            onClick={() => setActiveTab('info')}
            className={`text-sm font-medium transition-colors ${activeTab === 'info' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            General Info
          </button>
          <button 
            onClick={() => setActiveTab('specs')}
            className={`text-sm font-medium transition-colors ${activeTab === 'specs' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Technical Specs
          </button>
          <button 
            onClick={() => setActiveTab('live')}
            className={`text-sm font-medium transition-colors ${activeTab === 'live' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Live Demo
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('live')}
            className="hidden sm:block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-md shadow-blue-200"
          >
            Launch Core
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
