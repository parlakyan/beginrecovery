import React from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

/**
 * Reusable Tabs component
 * Provides a consistent tab interface across the application
 * 
 * @example
 * ```tsx
 * const tabs = [
 *   { id: 'listings', label: 'My Listings', content: <ListingsContent /> },
 *   { id: 'settings', label: 'Account Settings', content: <SettingsContent /> }
 * ];
 * 
 * <Tabs
 *   tabs={tabs}
 *   activeTab={currentTab}
 *   onTabChange={handleTabChange}
 * />
 * ```
 */
export default function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="mb-8 border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-8 min-w-max px-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                pb-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
