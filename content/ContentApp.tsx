import React, { useEffect } from "react";

// ContentApp Component (Content Script Logic)
const ContentApp: React.FC = () => {
  // Handle text selection for company and job title
  const handleSelection = (mode: "company" | "jobTitle") => {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText) {
      console.log(mode)
      console.log(selectedText)
      // Store the selected text in Chrome local storage
      chrome.storage.local.set({ [mode]: selectedText }, () => {
        chrome.runtime.sendMessage({
          action: "notify",
          message: `${mode === "company" ? "Company" : "Job Title"} selected: ${selectedText}`,
        });
      });
    }
  };

  useEffect(() => {
    // Listen for enableSelection action from the popup or background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "enableSelection") {
       
        const mode = message.mode;

        // Add mouseup event listener to detect text selection
        const listener = () => {
          handleSelection(mode);
          document.removeEventListener("mouseup", listener); // Clean up listener after selection
        };
        document.addEventListener("mouseup", listener);

        sendResponse({ success: true });
      }
    });

    // Cleanup on component unmount
    return () => {
      chrome.runtime.onMessage.removeListener((message) => message.action === "enableSelection");
    };
  }, []);

  return null
};

export default ContentApp