import React, { useState, useEffect } from "react";
import axios from "axios";

interface Designation {
  urlName: string;
  name: string;
}

interface Company {
  companyId: string;
  name: string;
}

const JobInputForm: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [companySearchQuery, setCompanySearchQuery] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [jobLoading, setJobLoading] = useState<boolean>(false);
  const [companyLoading, setCompanyLoading] = useState<boolean>(false);
  const [jobError, setJobError] = useState<string | null>(null);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const [isJobDropdownVisible, setIsJobDropdownVisible] = useState<boolean>(false);
  const [isCompanyDropdownVisible, setIsCompanyDropdownVisible] = useState<boolean>(false);

  const [debouncedCompanyQuery, setDebouncedCompanyQuery] = useState<string>("");
  const [debouncedJobQuery, setDebouncedJobQuery] = useState<string>("");

  // Fetch persisted data on popup open
  useEffect(() => {
    chrome.storage.local.get(["company", "jobTitle"], (data) => {
      if (data.company) {
        setCompanySearchQuery(data.company.name);
        setCompany(data.company);
      }
      if (data.jobTitle) {
        setJobTitle(data.jobTitle);
      }
    });
  }, []);

  // Save data to chrome.storage.local when fields update
  useEffect(() => {
    chrome.storage.local.set({ company, jobTitle });
  }, [company, jobTitle]);

  // Debounce logic for company name input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCompanyQuery(companySearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [companySearchQuery]);

  // Debounce logic for job title input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedJobQuery(jobTitle);
    }, 500);
    return () => clearTimeout(timer);
  }, [jobTitle]);

  // Fetch companies when debouncedCompanyQuery changes
  useEffect(() => {
    if (debouncedCompanyQuery.length >= 3) {
      fetchCompanies(debouncedCompanyQuery);
    } else {
      setCompanies([]);
    }
  }, [debouncedCompanyQuery]);

  // Fetch designations when debouncedJobQuery changes and company is selected
  useEffect(() => {
    if (company && debouncedJobQuery.length >= 3) {
      fetchDesignations(company.companyId, debouncedJobQuery);
    } else {
      setDesignations([]);
    }
  }, [debouncedJobQuery, company]);

  const fetchCompanies = async (query: string) => {
    try {
      setCompanyLoading(true);
      setCompanyError(null);
      const response = await axios.get(`https://www.ambitionbox.com/api/v2/search`, {
        params: { query, category: "all", type: "companies", synonym: true },
      });
      setCompanies(response.data.data || []);
    } catch (error) {
      setCompanyError("Failed to load companies.");
    } finally {
      setCompanyLoading(false);
    }
  };

  const fetchDesignations = async (companyId: string, query: string) => {
    try {
      setJobLoading(true);
      setJobError(null);
      const response = await axios.get(
        `https://www.ambitionbox.com/servicegateway-ambitionbox/salaries-services/v0/company/${companyId}/search`,
        {
          params: { jobProfileUrlName: query, page: 1 },
          headers: { AppId: 927, Systemid: "companySalaries" },
        }
      );
      setDesignations(response.data.data || []);
    } catch (error) {
      setJobError("Failed to load designations.");
    } finally {
      setJobLoading(false);
    }
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanySearchQuery(e.target.value);
    if (e.target.value === "") {
      setCompany(null);
    }
    setIsCompanyDropdownVisible(e.target.value.length >= 3);
  };

  const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobTitle(e.target.value);
    setIsJobDropdownVisible(e.target.value.length >= 3);
  };

  const handleCompanySelect = (selectedCompany: Company) => {
    setCompany(selectedCompany);
    setCompanySearchQuery(selectedCompany.name);
    setIsCompanyDropdownVisible(false);
  };

  const handleDesignationSelect = (designation: Designation) => {
    setJobTitle(designation.name);
    setIsJobDropdownVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (company?.name) {
      alert(`Submitted:\nCompany: ${company.name}\nJob Title: ${jobTitle}`);
      // Do your API submission here
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg">
      <div>
        <label htmlFor="companyName">Company Name:</label>
        <input
          id="companyName"
          type="text"
          value={companySearchQuery}
          onChange={handleCompanyChange}
          placeholder="Enter company name"
          className="w-full border p-2 rounded"
        />
        {isCompanyDropdownVisible && (
          <div className="dropdown">
            {companyLoading ? (
              <p>Loading...</p>
            ) : companyError ? (
              <p>{companyError}</p>
            ) : (
              companies.map((c) => (
                <div key={c.companyId} onClick={() => handleCompanySelect(c)}>
                  {c.name}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="jobTitle">Job Title:</label>
        <input
          id="jobTitle"
          type="text"
          value={jobTitle}
          onChange={handleJobTitleChange}
          placeholder="Enter job title"
          className="w-full border p-2 rounded"
          disabled={!company}
        />
        {isJobDropdownVisible && (
          <div className="dropdown">
            {jobLoading ? (
              <p>Loading...</p>
            ) : jobError ? (
              <p>{jobError}</p>
            ) : (
              designations.map((d) => (
                <div key={d.urlName} onClick={() => handleDesignationSelect(d)}>
                  {d.name}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <button type="submit" className="btn" disabled={!company || !jobTitle}>
        Submit
      </button>
    </form>
  );
};

export default JobInputForm;
