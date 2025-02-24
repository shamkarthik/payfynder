import { useState, useEffect, useCallback } from "react";

type ExtractedElements = {
  jobTitle: string | null;
  companyName: string | null;
};

const cleanText = (text: string | null): string | null => {
  if (!text) return null;
  return text.replace(/\s+/g, " ").trim();
};

const extractVisibleText = (element: HTMLElement | null): string => {
  if (!element) return "";
  const visibleText: string[] = [];

  if (element.nodeType === Node.ELEMENT_NODE && element.offsetWidth > 0 && element.offsetHeight > 0) {
    Array.from(element.childNodes).forEach((childNode) => {
      if (childNode.nodeType === Node.TEXT_NODE) {
        visibleText.push(childNode.nodeValue?.trim() || "");
      } else if (childNode.nodeType === Node.ELEMENT_NODE) {
        visibleText.push(extractVisibleText(childNode as HTMLElement));
      }
    });
  }

  return visibleText.join(" ").trim();
};

const useExtractSavedElements = (): [ExtractedElements, () => void] => {
  const [extractedElements, setExtractedElements] = useState<ExtractedElements>({
    jobTitle: null,
    companyName: null,
  });

  const extractSavedElements = useCallback(() => {
    const jobTitleSelector = localStorage.getItem("jobTitleSelector");
    const companyNameSelector = localStorage.getItem("companyNameSelector");
  
    console.log("Job Title Selector:", jobTitleSelector);
    console.log("Company Name Selector:", companyNameSelector);
  
    const jobTitleElement = jobTitleSelector ? document.querySelector(jobTitleSelector) : null;
    const companyNameElement = companyNameSelector ? document.querySelector(companyNameSelector) : null;
  
    console.log("Job Title Element:", jobTitleElement);
    console.log("Company Name Element:", companyNameElement);
  
    if (jobTitleElement && companyNameElement) {
      const jobTitle = cleanText(extractVisibleText(jobTitleElement));
      const companyName = cleanText(extractVisibleText(companyNameElement));
      setExtractedElements({ jobTitle, companyName });
      console.log("Extracted Data:", { jobTitle, companyName });
    } else {
      console.log("Could not find elements with saved selectors.");
    }
  }, []);
  

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        extractSavedElements();
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial extraction when the component mounts
    extractSavedElements();

    return () => {
      observer.disconnect(); // Cleanup observer when the component unmounts
    };
  }, [extractSavedElements]);

  return [extractedElements, extractSavedElements];
};

export default useExtractSavedElements;
