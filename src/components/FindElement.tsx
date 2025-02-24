import React from "react";
import useExtractSavedElements from "../hooks/useExtractSavedElements";

const FindElement: React.FC = () => {
  const [extractedElements, extractSavedElements] = useExtractSavedElements();

  const handleExtractClick = () => {
    extractSavedElements();
  };

  return (
    <div>
      <h1>Extract Saved Elements</h1>
      <p>Job Title: {extractedElements.jobTitle || "Not found"}</p>
      <p>Company Name: {extractedElements.companyName || "Not found"}</p>
      <button
        onClick={handleExtractClick}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Extract Saved Elements
      </button>
    </div>
  );
};

export default FindElement;
