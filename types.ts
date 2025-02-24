// src/types.ts
export interface CompanyDetails {
  name: string;
  companyId: string;
  url: string;
}

export interface Designation {
  urlName: string;
  name: string;
}

export interface SalaryDetails {
  minSalary: string;
  maxSalary: string;
  averageSalary: string;
  sampleSize?: string | null | undefined
  yearsExperienceMax?: string | null | undefined
  yearsExperienceMin?: string | null | undefined
}

export interface JobData {
  jobTitle: string;
  companyName: string;
}




export interface JobResult {
  jobTitle: string;
  companyName: string;
}