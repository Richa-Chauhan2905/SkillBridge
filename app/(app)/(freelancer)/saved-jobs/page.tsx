"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Bookmark, Briefcase, X, ExternalLink, IndianRupeeIcon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/app/generated/prisma/enums";

interface SavedJob {
  id: string;
  title: string;
  description: string;
  payPerHour?: number;
  mandatorySkills: string[];
  niceToHaveSkills: string[];
  tools: string[];
  status: string;
  createdAt: string;
}

export default function SavedJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingJobId, setRemovingJobId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Map<string, ApplicationStatus>>(new Map());

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/signin");
      return;
    }

    if (session.user?.role !== "FREELANCER") {
      router.push("/feed");
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch saved jobs
      const savedResponse = await fetch('/api/saved-jobs');
      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        if (savedData.success) {
          setSavedJobs(savedData.savedJobs || []);
        }
      }

      // Fetch applied jobs
      const appliedResponse = await fetch('/api/applications');
      if (appliedResponse.ok) {
        const appliedData = await appliedResponse.json();
        if (appliedData.success) {
          const appsMap = new Map<string, ApplicationStatus>();
          appliedData.applications?.forEach((app: any) => {
            appsMap.set(app.jobId, app.status);
          });
          setAppliedJobs(appsMap);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSavedJob = async (jobId: string) => {
    try {
      setRemovingJobId(jobId);
      const response = await fetch('/api/saved-jobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });

      if (response.ok) {
        setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      }
    } catch (error) {
      console.error("Failed to remove saved job:", error);
    } finally {
      setRemovingJobId(null);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // Update applied jobs state
        setAppliedJobs(prev => {
          const newMap = new Map(prev);
          newMap.set(jobId, "PENDING");
          return newMap;
        });
      }
    } catch (error) {
      console.error("Failed to apply:", error);
    }
  };

  const handleViewJob = (id: string) => {
    router.push(`/jobs/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Check if job is already applied
  const isJobApplied = (jobId: string) => {
    return appliedJobs.has(jobId);
  };

  const getApplicationStatus = (jobId: string) => {
    return appliedJobs.get(jobId) || null;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading saved jobs...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Bookmark className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
                  <p className="text-gray-600">Jobs you've bookmarked for later</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <span className="text-xl font-semibold text-gray-900">{savedJobs.length}</span>
                </div>
                <p className="text-sm text-gray-500">Total Saved</p>
              </div>
              
              <Button
                variant="outline"
                onClick={() => router.push("/feed")}
                className="border-gray-300 hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
            </div>
          </div>
        </div>

        {/* Saved Jobs List */}
        {savedJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-6">
              <Bookmark className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">No saved jobs yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              When you find interesting job opportunities, click the bookmark icon to save them here for easy access later.
            </p>
            <Button
              onClick={() => router.push("/feed")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Explore Job Opportunities
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active/Open Jobs */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Jobs ({savedJobs.filter(job => job.status === "OPEN").length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedJobs
                  .filter(job => job.status === "OPEN")
                  .map((job) => {
                    const hasApplied = isJobApplied(job.id);
                    const applicationStatus = getApplicationStatus(job.id);
                    
                    return (
                      <div
                        key={job.id}
                        className="bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all"
                      >
                        <div className="p-5">
                          {/* Job Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                                {job.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Saved on {formatDate(job.createdAt)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveSavedJob(job.id)}
                              disabled={removingJobId === job.id}
                              className="text-red-400 hover:text-red-600 transition-colors ml-2"
                              aria-label="Remove from saved jobs"
                            >
                              {removingJobId === job.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <X className="h-5 w-5" />
                              )}
                            </button>
                          </div>

                          {/* Pay Rate */}
                          {job.payPerHour && (
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-900 mb-3">
                              <IndianRupeeIcon className="h-4 w-4" />
                              <span>₹{job.payPerHour.toFixed(0)}/hr</span>
                            </div>
                          )}

                          {/* Skills */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {job.mandatorySkills.slice(0, 4).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
                                >
                                  {skill}
                                </span>
                              ))}
                              {job.mandatorySkills.length > 4 && (
                                <span className="px-2 py-1 text-xs text-gray-500">
                                  +{job.mandatorySkills.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Job Status & Application Status */}
                          <div className="mb-4 flex items-center gap-2">
                            <Badge className={
                              job.status === "OPEN" 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }>
                              {job.status === "OPEN" ? "Open" : "Closed"}
                            </Badge>
                            
                            {hasApplied && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {applicationStatus === "PENDING" ? "Applied" : applicationStatus}
                              </Badge>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => handleViewJob(job.id)}
                              className="flex-1 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              onClick={() => handleApply(job.id)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              disabled={job.status !== "OPEN" || hasApplied}
                            >
                              {hasApplied ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Applied
                                </>
                              ) : (
                                "Apply Now"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Closed/Expired Jobs */}
            {savedJobs.filter(job => job.status !== "OPEN").length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Closed Jobs ({savedJobs.filter(job => job.status !== "OPEN").length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedJobs
                    .filter(job => job.status !== "OPEN")
                    .map((job) => {
                      const hasApplied = isJobApplied(job.id);
                      
                      return (
                        <div
                          key={job.id}
                          className="bg-white rounded-lg border border-gray-200 opacity-75"
                        >
                          <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                                  {job.title}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Saved on {formatDate(job.createdAt)}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveSavedJob(job.id)}
                                disabled={removingJobId === job.id}
                                className="text-red-400 hover:text-red-600 transition-colors ml-2"
                                aria-label="Remove from saved jobs"
                              >
                                {removingJobId === job.id ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <X className="h-5 w-5" />
                                )}
                              </button>
                            </div>

                            <div className="mb-4 flex items-center gap-2">
                              <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                {job.status === "CLOSED" ? "Closed" : job.status === "COMPLETED" ? "Completed" : "Expired"}
                              </Badge>
                              
                              {hasApplied && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Applied
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-4">
                              This job is no longer accepting applications.
                            </p>

                            <Button
                              variant="outline"
                              onClick={() => handleViewJob(job.id)}
                              className="w-full border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Stats Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Saved Jobs Summary</h3>
                  <p className="text-gray-600">
                    Keep track of opportunities you're interested in
                  </p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {savedJobs.filter(job => job.status === "OPEN").length}
                    </div>
                    <p className="text-sm text-gray-500">Active Jobs</p>
                  </div>
                  
                  <div className="h-10 w-px bg-gray-300"></div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {savedJobs.filter(job => isJobApplied(job.id)).length}
                    </div>
                    <p className="text-sm text-gray-500">Applied</p>
                  </div>
                  
                  <div className="h-10 w-px bg-gray-300"></div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {savedJobs.length}
                    </div>
                    <p className="text-sm text-gray-500">Total Saved</p>
                  </div>
                  
                  <div className="h-10 w-px bg-gray-300"></div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {savedJobs.filter(job => job.status !== "OPEN").length}
                    </div>
                    <p className="text-sm text-gray-500">Closed/Expired</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}