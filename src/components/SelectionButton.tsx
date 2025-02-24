import React, { useState, useEffect } from "react";

// Utility function to generate a unique CSS selector
const getAdvancedSelector = (element: HTMLElement): string => {
  if (!element) return "";

  // Use ID if available
  if (element.id) {
    return `#${element.id}`;
  }

  // Use className for specificity
  if (element.className) {
    const classes = element.className.trim().split(/\s+/).join(".");

    if (classes) {
      return `.${classes}`;
    }
  }

  // Use unique attributes like data-testid or aria-label
  if (element.hasAttribute("data-testid")) {
    return `[data-testid="${element.getAttribute("data-testid")}"]`;
  }

  if (element.hasAttribute("aria-label")) {
    return `[aria-label="${element.getAttribute("aria-label")}"]`;
  }

  // Use tag name and nth-child for fallback
  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.documentElement) {
    const tagName = current.tagName.toLowerCase();
    if (current.id) {
      path.unshift(`#${current.id}`);
      break;
    }

    const siblings = Array.from(current.parentElement?.children || []);
    const index = siblings.indexOf(current) + 1;
    path.unshift(`${tagName}:nth-child(${index})`);
    current = current.parentElement;
  }

  return path.join(" > ");
};

const SelectionButton: React.FC = () => {
  const [learningMode, setLearningMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (learningMode) {
      injectHighlightStyles();
      enableLearningMode();
    } else {
      disableLearningMode();
    }

    // Check for previously saved selected element and highlight it
    const savedJobTitleSelector = localStorage.getItem("jobTitleSelector");
    const savedCompanyNameSelector = localStorage.getItem("companyNameSelector");

    if (savedJobTitleSelector) {
      const element = document.querySelector(savedJobTitleSelector) as HTMLElement;
      if (element) {
        element.classList.add("selected-element");
        setSelectedElement(element); // Store the selected element
      }
    }

    if (savedCompanyNameSelector) {
      const element = document.querySelector(savedCompanyNameSelector) as HTMLElement;
      if (element) {
        element.classList.add("selected-element");
        setSelectedElement(element); // Store the selected element
      }
    }

    return () => disableLearningMode();
  }, [learningMode]);

  const injectHighlightStyles = () => {
    const styleId = "highlight-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .highlight-element {
          outline: 2px solid #007bff;
          outline-offset: 2px;
          transition: outline 0.2s ease-in-out;
        }

        .selected-element {
          outline: 2px solid #28a745; /* Green highlight for selected element */
          outline-offset: 2px;
          transition: outline 0.2s ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }
  };

  const enableLearningMode = () => {
    console.log("Learning mode enabled! Highlight the job title or company name.");
    document.body.addEventListener("mouseover", handleMouseOver);
    document.body.addEventListener("click", handleElementClick);
  };

  const disableLearningMode = () => {
    console.log("Learning mode disabled.");
    document.body.removeEventListener("mouseover", handleMouseOver);
    document.body.removeEventListener("click", handleElementClick);

    // Clear any previous blue highlights
    removeHighlight();

    // If there is a selected element, add the green highlight to it
    if (selectedElement) {
      selectedElement.classList.add("selected-element");
    }
  };

  const handleMouseOver = (event: MouseEvent) => {
    const element = event.target as HTMLElement;
    if (element && element.id !== "learning-mode-button") {
      highlightElement(element);
    }
  };

  const handleElementClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const selection = window.getSelection();
    const element = event.target as HTMLElement;

    if (selection?.toString().trim() && element) {
      const selector = getAdvancedSelector(element);
      const selectedText = selection.toString().trim();

      const dataKey = window.confirm("Is this the Job Title? Click 'Cancel' for Company Name")
        ? "jobTitleSelector"
        : "companyNameSelector";

      // Save both the selector and selected text for precision
      localStorage.setItem(dataKey, selector);
      localStorage.setItem(`${dataKey}Text`, selectedText);

      alert(`Saved selector for ${dataKey}: ${selector} with text: "${selectedText}"`);
      setSelectedElement(element); // Store the selected element
      setLearningMode(false); // Disable learning mode after selection
    }
  };

  const highlightElement = (element: HTMLElement) => {
    // If learning mode is active, add a blue highlight to the element
    element.classList.add("highlight-element");
  };

  const removeHighlight = () => {
    // Remove the blue highlight from all elements
    const highlightedElements = document.querySelectorAll(".highlight-element");
    highlightedElements.forEach((el) => el.classList.remove("highlight-element"));
  };

  return (
    <>
      <button
        id="learning-mode-button"
        onClick={() => setLearningMode(!learningMode)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          padding: "10px 15px",
          backgroundColor: learningMode ? "#ff4d4d" : "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {learningMode ? "Disable Learning Mode" : "Enable Learning Mode"}
      </button>
    </>
  );
};

export default SelectionButton;
