import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Interfaces for the responses from AmbitionBox API
interface Designation {
  urlName: string;
  name: string;
}

interface Company {
  companyId: string;
  name: string;
}

interface JobInputFormProps {
  onSubmit: (data: { companyName: string; jobTitle: string; }) => Promise<boolean>;
  className: string;
}

const JobInputForm: React.FC<JobInputFormProps> = ({ onSubmit, className }) => {
  // State management for form fields
  const [company, setCompany] = useState<Company | null>(null);
  const [companySearchQuery, setCompanySearchQuery] = useState<string>(''); // Query input for company
  const [jobTitle, setJobTitle] = useState<string>('');

  // State for the API response data
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  // Loading and error states for each field
  const [jobLoading, setJobLoading] = useState<boolean>(false);
  const [companyLoading, setCompanyLoading] = useState<boolean>(false);

  const [jobError, setJobError] = useState<string | null>(null);
  const [companyError, setCompanyError] = useState<string | null>(null);

  // Visibility states for the dropdowns
  const [isJobDropdownVisible, setIsJobDropdownVisible] = useState<boolean>(false);
  const [isCompanyDropdownVisible, setIsCompanyDropdownVisible] = useState<boolean>(false);

  // Debounced query states for company and job title
  const [debouncedCompanyQuery, setDebouncedCompanyQuery] = useState<string>('');
  const [debouncedJobQuery, setDebouncedJobQuery] = useState<string>('');

  // Debounce effect for company and job search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCompanyQuery(companySearchQuery);
    }, 500); // 500ms delay before making the company API request
    return () => clearTimeout(timer);
  }, [companySearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedJobQuery(jobTitle);
    }, 500); // 500ms delay before making the job title API request
    return () => clearTimeout(timer);
  }, [jobTitle]);

  // Fetch data for companies
  useEffect(() => {
    if (debouncedCompanyQuery.length >= 3) {
      fetchCompanies(debouncedCompanyQuery);
    } else {
      setCompanies([]);
    }
  }, [debouncedCompanyQuery]);

  // Fetch data for designations based on selected companyId
  useEffect(() => {
    if (company && debouncedJobQuery.length >= 3) {
      fetchDesignations(company.companyId, debouncedJobQuery);
    } else {
      setDesignations([]);
    }
  }, [debouncedJobQuery, company]);

  // Fetch designations based on the selected companyId
  const fetchDesignations = async (companyId: string, query: string) => {
    try {
      setJobLoading(true);
      setJobError(null); // Reset previous errors
      const response = await axios.get(
        `https://www.ambitionbox.com/servicegateway-ambitionbox/salaries-services/v0/company/${companyId}/search`,
        {
          params: {
            jobProfileUrlName: query,
            page: 1, // assuming page 1 for simplicity
          },
          headers: {
            'AppId': 927,
            'Systemid': 'companySalaries',
          },
        }
      );
      setDesignations(response.data.data || []);
    } catch (error) {
      setJobError('Failed to load designations.');
    } finally {
      setJobLoading(false);
    }
  };

  // Fetch companies
  const fetchCompanies = async (query: string) => {
    try {
      setCompanyLoading(true);
      setCompanyError(null); // Reset previous errors
      const response = await axios.get(
        `https://www.ambitionbox.com/api/v2/search?query=${query}&category=all&type=companies&synonym=true`
      );
      setCompanies(response.data.data || []);
    } catch (error) {
      setCompanyError('Failed to load companies.');
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCompanySearchQuery(value);
  
    if (value === '') {
      // Clear the selected company if input is cleared
      setCompany(null);
    }
  
    setIsCompanyDropdownVisible(value.length >= 3); // Show dropdown only for queries with 3+ characters
  };
  


  // Handle changes in the job title field
  const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobTitle(e.target.value);
    setIsJobDropdownVisible(e.target.value.length >= 3);
  };

  // Handle selection of a company from the dropdown
const handleCompanySelect = (selectedCompany: Company) => {
  setCompany(selectedCompany); // Set the selected company
  setCompanySearchQuery(selectedCompany.name); // Update the search query with the selected company name
  setIsCompanyDropdownVisible(false); // Hide the dropdown
};
 
  // Handle selection of a job title from the dropdown
  const handleDesignationSelect = (designation: Designation) => {
    setJobTitle(designation.name);
    setIsJobDropdownVisible(false);
  };

  // Submit form data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(company?.name) {
      onSubmit({ companyName: company?.name,jobTitle: jobTitle });
    }
    
  };

  return (
    <form onSubmit={handleSubmit} className={`${className} space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg`}>
      {/* Company Name Input */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Company Name:
        </label>
       <input
          id="companyName"
          type="text"
          value={companySearchQuery} // Always bind to companySearchQuery
          onChange={handleCompanyNameChange} // Updated change handler
          placeholder="Enter company name"
          className="mt-2 w-full p-3 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          autoComplete="off"
        />

        {/* Company Name dropdown */}
        {isCompanyDropdownVisible && (
          <div className="mt-2 max-h-40 overflow-auto bg-white dark:bg-gray-700 border border-gray-300 rounded-md shadow-lg absolute z-10 w-full">
            {companyLoading ? (
              <p className="p-2 text-gray-500 dark:text-gray-300">Loading...</p>
            ) : companyError ? (
              <p className="p-2 text-red-500 dark:text-red-300">{companyError}</p>
            ) : (
              companies.map((company) => (
                <div
                  key={company.companyId}
                  onClick={() => handleCompanySelect(company)}
                  className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {company.name}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Job Title Input */}
      <div>
        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Designation Name:
        </label>
        <input
          id="jobTitle"
          type="text"
          value={jobTitle}
          onChange={handleJobTitleChange}
          placeholder="Enter designation name"
          className="mt-2 w-full p-3 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          autoComplete="off"
          disabled={!company} // Disable job title input if company is not selected
        />
        {/* Job Title dropdown */}
        {isJobDropdownVisible && company && (
          <div className="mt-2 max-h-40 overflow-auto bg-white dark:bg-gray-700 border border-gray-300 rounded-md shadow-lg absolute z-10 w-full">
            {jobLoading ? (
              <p className="p-2 text-gray-500 dark:text-gray-300">Loading...</p>
            ) : jobError ? (
              <p className="p-2 text-red-500 dark:text-red-300">{jobError}</p>
            ) : (
              designations.map((designation) => (
                <div
                  key={designation.urlName}
                  onClick={() => handleDesignationSelect(designation)}
                  className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {designation.name}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3 mt-4 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700"
        disabled={!company || !jobTitle} // Disable submit button if no company or job title
      >
        Submit
      </button>
    </form>
  );
};

export default JobInputForm;
