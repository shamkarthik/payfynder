import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as cheerio from 'cheerio';
import type { CompanyDetails, Designation, JobData, JobResult, SalaryDetails } from '../types';
import JobInputForm from './components/JobInputForm';
import ToggleSwitch from './components/ToggleSwitch';

const JobScraper: React.FC = () => {
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [designationList, setDesignationList] = useState<Designation[]>([]);
  const [salaryDetails, setSalaryDetails] = useState<SalaryDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Fetch company details
  const getCompanyDetails = async (companyName: string): Promise<CompanyDetails | undefined> => {
    try {
      const response = await axios.get('https://www.ambitionbox.com/api/v2/search', {
        params: {
          query: companyName,
          type: 'companies',
          category: 'all'
        },
      });

      const details = response.data.data[0] as CompanyDetails;
      // console.log(details)
      setCompanyDetails(details);
      return details;
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  };

  // 2. Fetch designation list based on company ID
  const getCompanyDesignationDetails = async (companyId: string, designation: string = '', page: number = 1): Promise<Designation[]> => {
    try {
      const response = await axios.get(`https://www.ambitionbox.com/servicegateway-ambitionbox/salaries-services/v0/company/${companyId}/search`, {
        params: {
          jobProfileUrlName: designation,
          page: page
        },
        headers: {
          'AppId': 927,
          'Systemid': 'companySalaries',
        },
      });

      const designations = response.data.data as Designation[];
      console.log(designation)
      setDesignationList(designations);
      return designations;
    } catch (error) {
      console.error('Error fetching designation list:', error);
      return [];
    }
  };

  // 3. Fetch salary details for a specific designation
  const getCompanyDesignationSalaryDetails = async (companyUrl: string, designationUrl: string): Promise<SalaryDetails | null> => {
    try {
      const response = await axios.get(`https://www.ambitionbox.com/salaries/${companyUrl}-salaries/${designationUrl}`, {
      });

      const htmlData = response.data;
      const $ = cheerio.load(htmlData);
      const scriptData: any[] = [];

      $('script').each((_, element) => {
        const scriptContent = $(element).html();
        if (scriptContent) {
          try {
            const jsonData = JSON.parse(scriptContent);
            scriptData.push(jsonData);
          } catch (e) {
            //   console.log('Could not parse JSON from script tag:', e.message);
          }
        }
      });

      console.log("salaryData", scriptData[0])
      const salaryParseData = parseSalaryData(scriptData[0].description);
      console.log("salaryParseData", salaryParseData)
      setSalaryDetails({ ...salaryParseData, sampleSize: scriptData[0]?.sampleSize, yearsExperienceMax: scriptData[0]?.yearsExperienceMax, yearsExperienceMin: scriptData[0]?.yearsExperienceMin });
      return salaryParseData;
    } catch (error) {
      console.error('Error fetching salary details:', error);
      return null;
    }
  };

  const parseSalaryData = (text: string): SalaryDetails | null => {
    const rangeRegex = /₹\s*([\d.]+)\s*Lakhs?\s*to\s*₹\s*([\d.]+)\s*Lakhs?/;
    const averageRegex = /average\s+annual\s+salary\s+of\s+₹\s*([\d.]+)\s*Lakhs?/;

    const rangeMatch = text.match(rangeRegex);
    const averageMatch = text.match(averageRegex);

    if (rangeMatch && averageMatch) {
      return {
        minSalary: `${parseFloat(rangeMatch[1])} Lakhs`,
        maxSalary: `${parseFloat(rangeMatch[2])} Lakhs`,
        averageSalary: `${parseFloat(averageMatch[1])} Lakhs`
      };
    }
    return null;
  };



  const parseJob = async (html: string): Promise<JobResult | undefined> => {
    try {
      const $ = cheerio.load(html); // Load the HTML content
      const jobTitleElement = $('.job-details-jobs-unified-top-card__job-title a'); // Select the job title anchor element
      const companyNameElement = $('.job-details-jobs-unified-top-card__company-name a'); // Select the company name anchor element

      // Extract the text content
      const companyName = companyNameElement.text().trim(); // Select the job title anchor element
      // console.log(companyName)
      // Extract the text content
      const jobTitle = jobTitleElement.text().trim();
      // console.log(jobTitle)
      return { jobTitle, companyName } as JobResult
    } catch (error) {
      console.error('Error processing HTML:', error);
      throw error; // Rethrow the error for the caller to handle
    }
  };

  const fetchSalaryDetailsForCompany = async (companyName: string, designation: string) => {
    setLoading(true);
    const companyDetails = await getCompanyDetails(companyName);

    if (companyDetails) {
      const designations = await getCompanyDesignationDetails(companyDetails.companyId, designation);
      console.log("designations", designations)
      if (designations && designations.length > 0) {
        const selectedDesignation = designations[0].urlName;
        console.log("selectedDesignation", selectedDesignation)
        const salaryData = await getCompanyDesignationSalaryDetails(companyDetails.url, selectedDesignation);
        console.log('Final Salary Details:', salaryData);
        return salaryData
      }
    }
    setLoading(false);
    return false
  };

  const getDetails = async () => {
    try {
      let html = '';

      // Get the active tab in the current window
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      const activeTabId = activeTab?.id;

      if (!activeTabId) {
        throw new Error('No active tab found');
      }

      // Execute the script to extract the HTML
      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        func: DOMtoString, // Function to extract HTML
        args: [], // No arguments needed for the full document
      });

      if (results && results[0]?.result) {
        html = results[0].result;

        // Parse the job data from the extracted HTML
        const jobData = await parseJob(html);
        console.log('jobData', jobData);

        // Fetch salary details if company name and job title are available
        if (jobData?.companyName && jobData?.jobTitle) {
          setToggleState(false)
          const salaryDetails = await fetchSalaryDetailsForCompany(jobData.companyName, jobData.jobTitle);
          setLoading(!salaryDetails)
          return !!salaryDetails
        }
      }
      return false
    } catch (error: any) {
      console.error('Error fetching details:', error?.message);
      setToggleState(true)
      return false
    }
  };


  function DOMtoString(): string {
    return document.documentElement.outerHTML; // Return the full HTML of the document
  }

  const [toggleState, setToggleState] = useState<boolean>(false);
  // Example usage of fetching details (could be triggered via a button or useEffect)
  useEffect(() => {
      getDetails()
  }, []);

  const onJobFormSubmit = async (data: { companyName: string; jobTitle: string; }): Promise<boolean> => {
    console.log(data)
    if (data?.companyName && data?.jobTitle) {
      const salaryDetails = await fetchSalaryDetailsForCompany(data.companyName, data.jobTitle);
      if (!!salaryDetails) {
        setToggleState(!salaryDetails)
        setLoading(!salaryDetails);
      }
    }
    return false
  }
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleToggle = () => {
    setToggleState(!toggleState);
    setLoading(false);
  };


  // Effect hook to apply dark mode class to the body element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  return (

    <div className={`container min-w-80 mx-auto p-6 space-y-6 dark:bg-gray-900 dark:text-white bg-white text-black`}>
      <h1 className="text-3xl font-bold">Job Scraper</h1>

      {/* Dark Mode Toggle */}
      <div className="flex items-center space-x-4">
        <ToggleSwitch onToggle={handleDarkModeToggle} initialState={isDarkMode} />
        <span className="text-lg font-medium">
          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
        </span>
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center space-x-4">
        <ToggleSwitch onToggle={handleToggle}  controlledState={toggleState} />
        <span className="text-lg font-medium">Activate Job Form</span>
      </div>

      {/* Job Input Form */}
      <div className={toggleState ? "" : "hidden"}>
        <JobInputForm
          onSubmit={onJobFormSubmit}
          className="dark:bg-gray-900 dark:text-white bg-white text-black"
        />
      </div>

      <div className={!toggleState ? "" : "hidden"}>
      {/* Loading state */}
      {loading && <p className="text-gray-500 dark:text-gray-400">Loading...</p>}

      {/* Company Details */}
      {companyDetails && (
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm dark:bg-gray-700 dark:text-white">
          <h2 className="text-sm font-medium ">Company: {companyDetails.name}</h2>
          {designationList[0]?.name && <h3 className="text-sm font-medium mt-2">Job Titles: {designationList[0].name}</h3>}
        </div>
      )}

      {/* Salary Details */}
      {salaryDetails && (
        <div className="bg-gray-100 p-4 rounded-lg mt-4 shadow-sm dark:bg-gray-700 dark:text-white">
          <h3 className="text-lg font-semibold">Salary Details</h3>
          <p className="text-sm mt-2">Min Salary: {salaryDetails.minSalary}</p>
          <p className="text-sm mt-2">Max Salary: {salaryDetails.maxSalary}</p>
          <p className="text-sm mt-2">Average Salary: {salaryDetails.averageSalary}</p>
          <p className="text-sm mt-2">
            Experience Range: {salaryDetails.yearsExperienceMin} - {salaryDetails.yearsExperienceMax}
          </p>
          <p className="text-sm mt-2">Salary Data collected from: {salaryDetails.sampleSize}</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default JobScraper;
