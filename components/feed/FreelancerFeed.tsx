"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import JobCard from "@/components/feed/cards/JobCard";
import { Loader2 } from "lucide-react";
import { Experience, JobStatus, Industry, ApplicationStatus } from "@/app/generated/prisma/enums";

// Define the Job type based on your Prisma schema
interface Job {
  id: string;
  title: string;
  description: string;
  requiredExperience: Experience;
  payPerHour?: number;
  mandatorySkills: string[];
  niceToHaveSkills: string[];
  tools: string[];
  preferredLocation?: string;
  preferredEducation?: string;
  clientLocation?: string;
  status: JobStatus;
  postedAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    clientProfile?: {
      industry: Industry;
      companyName?: string;
      companyWebsite?: string;
      linkedInProfile?: string;
    };
  };
}

// Type for saved job response
interface SavedJob {
  id: string;
  jobId: string;
  userId: string;
}

// Type for application response
interface Application {
  id: string;
  jobId: string;
  status: ApplicationStatus;
}

export default function FreelancerFeed() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [applications, setApplications] = useState<Map<string, ApplicationStatus>>(new Map());

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      try {
        // Fetch jobs
        const jobsResponse = await fetch("/api/jobs/freelancer-feed");
        if (jobsResponse.ok) {
          const data = await jobsResponse.json();
          setJobs(data.jobs || []);
        }

        // Fetch saved jobs
        const savedResponse = await fetch("/api/saved-jobs");
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          const savedIds = new Set<string>(savedData.savedJobs?.map((sj: SavedJob) => sj.jobId) || []);
          setSavedJobs(savedIds);
        }

        // Fetch applications
        const appsResponse = await fetch("/api/applications");
        if (appsResponse.ok) {
          const appsData = await appsResponse.json();
          const appsMap = new Map<string, ApplicationStatus>();
          appsData.applications?.forEach((app: Application) => {
            appsMap.set(app.jobId, app.status);
          });
          setApplications(appsMap);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  // REMOVED handleViewDetails function

  const handleSaveJob = async (id: string) => {
    try {
      const response = await fetch("/api/saved-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id }),
      });
      
      if (response.ok) {
        setSavedJobs(prev => {
          const newSet = new Set<string>(prev);
          if (newSet.has(id)) {
            newSet.delete(id);
          } else {
            newSet.add(id);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error("Failed to save job:", error);
    }
  };

  const handleApply = async (id: string) => {
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id }),
      });
      
      if (response.ok) {
        setApplications(prev => {
          const newMap = new Map<string, ApplicationStatus>(prev);
          newMap.set(id, ApplicationStatus.PENDING);
          return newMap;
        });
      }
    } catch (error) {
      console.error("Failed to apply:", error);
    }
  };

  const handleWithdraw = async (id: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setApplications(prev => {
          const newMap = new Map<string, ApplicationStatus>(prev);
          newMap.delete(id);
          return newMap;
        });
      }
    } catch (error) {
      console.error("Failed to withdraw:", error);
    }
  };

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view the feed.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Freelancer Feed</h1>
        <p className="text-gray-600 mt-1">
          Browse available job opportunities that match your skills
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
            <Loader2 className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">No jobs available</h3>
          <p className="text-gray-600 text-sm">
            Check back later for new opportunities
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              description={job.description}
              clientName={`${job.client.firstName} ${job.client.lastName}`}
              clientCompany={job.client.clientProfile?.companyName}
              requiredExperience={job.requiredExperience}
              payPerHour={job.payPerHour}
              mandatorySkills={job.mandatorySkills}
              niceToHaveSkills={job.niceToHaveSkills}
              tools={job.tools}
              preferredLocation={job.preferredLocation}
              preferredEducation={job.preferredEducation}
              clientLocation={job.clientLocation}
              status={job.status}
              postedAt={new Date(job.postedAt)}
              isSaved={savedJobs.has(job.id)}
              applicationStatus={applications.get(job.id) || null}
              onSaveJob={handleSaveJob}
              onUnsaveJob={handleSaveJob}
              onApply={handleApply}
              onWithdraw={handleWithdraw}
            />
          ))}
        </div>
      )}

      {jobs.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Showing {jobs.length} job opportunities
          </p>
        </div>
      )}
    </div>
  );
}