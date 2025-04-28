import React, { useState } from "react";

const TabInterface = ({ tabs, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap border-b border-slate-200/50 dark:border-slate-700/50 mb-4">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === idx 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center">
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </div>
          </button>
        ))}
      </div>
      
      <div>
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default TabInterface; 