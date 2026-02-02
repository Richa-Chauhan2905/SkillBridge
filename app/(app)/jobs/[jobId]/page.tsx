"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader 
} from "@/components/ui/card";
import {
  ArrowLeft,
  Briefcase,
  Clock,
  MapPin,
  GraduationCap,
  ToolCase,
  Users,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupeeIcon
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  description: string;
  payPerHour?: number | null;
  mandatorySkills: string[];
  niceToHaveSkills: string[];
  tools: string[];
  preferredLocation?: string | null;
  preferredEducation?: string | null;
  clientLocation?: string | null;
  status: "OPEN" | "CLOSED" | "FILLED";
  clientId: string;
  client: { id: string; firstName: string; lastName: string };
};

export default function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [job, setJob] = useState<Job | null>(null);
  const [applicationsCount, setApplicationsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!jobId) return;

    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/jobs/${jobId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load job");
        }

        setJob(data.job);
        setApplicationsCount(typeof data.applicationsCount === "number" ? data.applicationsCount : null);
      } catch (e: any) {
        setError(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Open
          </Badge>
        );
      case "CLOSED":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Closed
          </Badge>
        );
      case "FILLED":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
            <Users className="h-3 w-3 mr-1" />
            Filled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">{error || "Job not found"}</h3>
                <p className="text-sm text-red-600 mt-1">Please check the job ID or try again later.</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isClient = session?.user?.role === "CLIENT";
  const isOwner = isClient && session?.user?.id === job.clientId;
  const canApply = session?.user?.role === "FREELANCER" && job.status === "OPEN";

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 pl-0 hover:pl-2 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {getStatusBadge(job.status)}
                  {isOwner && applicationsCount !== null && (
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />
                      {applicationsCount} application{applicationsCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {job.title}
                </h1>
                <p className="text-gray-600 mt-2">
                  Posted by <span className="font-semibold">{job.client.firstName} {job.client.lastName}</span>
                </p>
              </div>
              
              <div className="shrink-0">
                {job.payPerHour && (
                  <div className="flex items-center gap-2 bg-linear-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-xl border border-green-200">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <IndianRupeeIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Pay Rate</div>
                      <div className="text-2xl font-bold text-gray-900">₹{job.payPerHour}</div>
                      <div className="text-xs text-gray-500">per hour</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {isOwner ? (
          <>
            <Button
              onClick={() => router.push(`/jobs/${job.id}/edit`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Job
            </Button>
            <Button variant="outline" onClick={() => router.push(`/jobs/${job.id}/applications`)}>
              View Applications
            </Button>
          </>
        ) : canApply ? (
          <Button className="gap-2">
            <Briefcase className="h-4 w-4" />
            Apply Now
          </Button>
        ) : null}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Job Description</h2>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mandatory Skills */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Required Skills</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.mandatorySkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="default"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Nice-to-have Skills */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ToolCase className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold">Nice-to-have Skills</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.niceToHaveSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-purple-200 text-purple-700 bg-white"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Job Details */}
        <div className="space-y-6">
          {/* Job Details Card */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Job Details</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.tools.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <ToolCase className="h-4 w-4 text-gray-500" />
                    Tools & Technologies
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.tools.map((tool, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {job.preferredLocation && (
                <div className="flex items-start gap-3 pt-2">
                  <MapPin className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Preferred Location</div>
                    <div className="text-gray-600">{job.preferredLocation}</div>
                  </div>
                </div>
              )}

              {job.preferredEducation && (
                <div className="flex items-start gap-3 pt-2">
                  <GraduationCap className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Preferred Education</div>
                    <div className="text-gray-600">{job.preferredEducation}</div>
                  </div>
                </div>
              )}

              {job.clientLocation && (
                <div className="flex items-start gap-3 pt-2">
                  <MapPin className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Client Location</div>
                    <div className="text-gray-600">{job.clientLocation}</div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 pt-2">
                <Clock className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Job Status</div>
                  <div className="text-gray-600 capitalize">{job.status.toLowerCase()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Info */}
          {canApply && (
            <Card className="bg-linear-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Ready to Apply?</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    This job is currently accepting applications. Make sure your profile is complete before applying.
                  </p>
                  <Button className="w-full gap-2">
                    <Briefcase className="h-4 w-4" />
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Owner Actions */}
          {isOwner && (
            <Card className="bg-linear-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Manage Applications</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {applicationsCount !== null 
                      ? `You have ${applicationsCount} application${applicationsCount !== 1 ? 's' : ''} to review.`
                      : "Review applications for this job."
                    }
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-green-300 text-green-700 hover:bg-green-100"
                    onClick={() => router.push(`/jobs/${job.id}/applications`)}
                  >
                    View Applications
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}