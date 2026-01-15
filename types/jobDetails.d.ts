interface JobDetails {
  id: string;
  title: string;
  description: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCompany?: string;
  clientWebsite?: string;
  clientLinkedIn?: string;
  requiredExperience: Experience;
  payPerHour?: number;
  mandatorySkills: string[];
  niceToHaveSkills: string[];
  tools: string[];
  preferredLocation?: string;
  preferredEducation?: string;
  clientLocation?: string;
  status: JobStatus;
  postedAt: Date;
  createdAt: Date;
  totalApplications?: number;
  clientIndustry?: string;
  applicationStatus?: ApplicationStatus | null;
  isSaved?: boolean;
}