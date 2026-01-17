"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import JobCard from "@/components/feed/cards/JobCard";
import { Loader2, Briefcase, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AppliedJob {
  id: string;
  jobId: string;
  status: string;
  job?: {
    id: string;
    title: string;
    payPerHour?: number;
    mandatorySkills: string[];
    client: {
      firstName: string;
      lastName: string;
      clientProfile?: {
        companyName?: string;
      };
    };
  };
}

export default function MyApplicationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const fetchAppliedJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/my-applications");
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAppliedJobs(data.applications || []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch applied jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your applications.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">My Applications</h1>
            <p className="text-sm text-gray-600 mt-1">
              Track the status of jobs you've applied to
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-gray-900 text-sm">
                  {appliedJobs.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Applications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      {appliedJobs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600 text-sm mb-4">
            You haven't applied to any jobs yet. Browse the job feed to find opportunities.
          </p>
          <Button
            onClick={() => router.push("/feed")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Browse Jobs
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {appliedJobs.map((appliedJob) => {
              if (!appliedJob.job) return null;
              
              return (
                <JobCard
                  key={appliedJob.id}
                  id={appliedJob.job.id}
                  title={appliedJob.job.title}
                  client={appliedJob.job.client}
                  payPerHour={appliedJob.job.payPerHour}
                  mandatorySkills={appliedJob.job.mandatorySkills}
                  applicationStatus={appliedJob.status}
                  onViewJob={(id) => router.push(`/jobs/${id}`)}
                  // No onApply prop passed - button will be disabled
                />
              );
            })}
          </div>

          {/* Status Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
            <h3 className="font-medium text-gray-900 mb-3">Application Status Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {appliedJobs.filter(job => job.status === "PENDING").length}
                  </p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {appliedJobs.filter(job => job.status === "ACCEPTED").length}
                  </p>
                  <p className="text-xs text-gray-600">Accepted</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {appliedJobs.filter(job => job.status === "UNDER_REVIEW").length}
                  </p>
                  <p className="text-xs text-gray-600">Under Review</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {appliedJobs.filter(job => job.status === "REJECTED").length}
                  </p>
                  <p className="text-xs text-gray-600">Rejected</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}