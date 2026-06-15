import React from 'react';
import { 
  FiHome, 
  FiUsers, 
  FiImage, 
  FiFilm, 
  FiPackage, 
  FiCreditCard 
} from 'react-icons/fi';

const StartupTabs = ({ 
  activeTab, 
  onTabChange, 
  startupData, 
  isPublicView = false 
}) => {
  const tabs = [
    { key: 'overview', label: 'Overview', icon: FiHome },
    { key: 'team', label: 'Team', icon: FiUsers, count: startupData?.team?.length },
    { key: 'gallery', label: 'Gallery', icon: FiImage, count: startupData?.gallery?.length },
    { key: 'pitch', label: 'Pitch', icon: FiFilm },
    { key: 'products', label: 'Products', icon: FiPackage, count: startupData?.products?.length },
    ...(isPublicView && startupData?.virtualCard ? [{ key: 'vc', label: 'Virtual Card', icon: FiCreditCard }] : []),
    ...(!isPublicView ? [{ key: 'vc', label: 'Virtual Card', icon: FiCreditCard }] : [])
  ];

  return (
    <div className="border-b border-black/[0.06] dark:border-white/[0.08]">
      <nav className="-mb-px flex space-x-6 sm:space-x-8 px-5 sm:px-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex items-center ${
              activeTab === tab.key
                ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600'
            }`}
          >
            <tab.icon className="inline mr-1.5" />
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                tab.count > 0
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'glass-inset text-zinc-500 dark:text-zinc-400'
              }`}>
                {tab.count || 0}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default StartupTabs;