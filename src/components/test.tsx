import React, { useState, useEffect } from "react";

const InputSelector: React.FC = () => {
  const [company, setCompany] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectionMode, setSelectionMode] = useState<"company" | "jobTitle" | null>(null);

  // Fetch persisted data on popup open
  useEffect(() => {
    chrome.storage.local.get(["company", "jobTitle"], (data) => {
      if (data.company) {
        setCompany(data.company);
      }
      if (data.jobTitle) {
        setJobTitle(data.jobTitle);
      }
    });
  }, []);

  const handleEnableSelection = (mode: "company" | "jobTitle") => {
    setSelectionMode(mode);
    setLoading(true); // Set loading to true while enabling selection

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "enableSelection", mode },
          (response) => {
            console.log(
              response?.success ? "Selection enabled" : "Failed to enable selection"
            );
            setLoading(false); // Reset loading after response
            window.close(); // Close the popup
            // reopenPopup(); // Reopen the popup after selection is made
          }
        );
      }
    });
  };

  const reopenPopup = () => {
    chrome.runtime.sendMessage({ action: "reopenPopup" }); // Send message to background to reopen the popup
  };

  return (
    <div className="p-4 w-96">
      <div className="mb-4">
        <label htmlFor="company" className="block text-sm font-medium">
          Company Name:
        </label>
        <input
          id="company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company name"
          className="w-full p-2 border rounded"
          readOnly
        />
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => handleEnableSelection("company")}
          disabled={loading}
        >
          {loading && selectionMode === "company" ? "Selecting..." : "Select Company"}
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="jobTitle" className="block text-sm font-medium">
          Job Title:
        </label>
        <input
          id="jobTitle"
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Job title"
          className="w-full p-2 border rounded"
          readOnly
        />
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => handleEnableSelection("jobTitle")}
          disabled={loading}
        >
          {loading && selectionMode === "jobTitle" ? "Selecting..." : "Select Job Title"}
        </button>
      </div>
    </div>
  );
};

export default InputSelector;
