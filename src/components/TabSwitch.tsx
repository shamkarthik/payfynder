import React, { useState } from "react";

const TabSwitch: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("profile");

  // Define the tabs data
  const tabs = [
    { id: "autoLinkedIn", label: "Auto LinkedIn", content: "This is the Profile tab content" },
    { id: "manualInput", label: "Manual Input", content: "This is the Dashboard tab content" },
  ];

  return (
    <div>
      {/* Tabs Navigation */}
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex space-x-4 text-sm font-medium text-center" role="tablist">
          {tabs.map((tab) => (
            <li key={tab.id} role="presentation">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === tab.id
                    ? "text-purple-600 border-purple-600"
                    : "text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-controls={tab.id}
                aria-selected={activeTab === tab.id ? "true" : "false"}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tabs Content */}
      <div>
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <div
                key={tab.id}
                className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
                id={tab.id}
                role="tabpanel"
                aria-labelledby={`${tab.id}-tab`}
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tab.content}
                </p>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default TabSwitch;
