"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  IndianRupeeIcon,
  Clock,
  CheckCircle,
  XCircle,
  Clock4,
  Download,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationStatus } from "@/app/generated/prisma/enums";

interface Application {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  freelancer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    freelancerProfile?: {
      industry: string;
      skills: string[];
      experience: string;
      ratePerHour: number;
      city: string;
      state: string;
      bio?: string;
    };
  };
}

interface JobDetails {
  id: string;
  title: string;
  payPerHour: number;
}

export default function JobApplicationsPage() {
  const { id: jobId } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "CLIENT" && jobId) {
      fetchData();
    }
  }, [session, jobId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch job details
      const jobResponse = await fetch(`/api/jobs/${jobId}`);
      const jobData = await jobResponse.json();

      if (jobData.success) {
        setJobDetails(jobData.job);
      }

      // Fetch applications
      const appsResponse = await fetch(`/api/jobs/${jobId}/jobApplications`);

      if (!appsResponse.ok) {
        throw new Error("Failed to fetch applications");
      }

      const appsData = await appsResponse.json();

      if (appsData.success) {
        setApplications(appsData.applications || []);
      } else {
        toast.error(appsData.message || "Failed to load applications");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "HIRED":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Hired
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Rejected
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case "HIRED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "PENDING":
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUpdateStatus = async (
    applicationId: string,
    newStatus: ApplicationStatus,
  ) => {
    try {
      const response = await fetch(
        `/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`Application ${newStatus.toLowerCase()}`);
        // Update local state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status: newStatus } : app,
          ),
        );
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status. Please try again.");
    }
  };

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view applications.</p>
        </div>
      </div>
    );
  }

  if (session.user?.role !== "CLIENT") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Only clients can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border border-gray-200">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="pt-12 pb-12 text-center">
            <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No applications yet
            </h3>
            <p className="text-gray-600 mb-6">
              Applicants will appear here once they apply to your job
            </p>
            <Button
              onClick={() => router.push("/my-jobs")}
              variant="outline"
              className="border-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Jobs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 border-2 border-blue-100">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {application.freelancer.firstName?.[0]}
                        {application.freelancer.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-medium">
                        {application.freelancer.firstName}{" "}
                        {application.freelancer.lastName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {application.freelancer.email}
                        </span>
                        {application.freelancer.freelancerProfile?.city && (
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {application.freelancer.freelancerProfile.city}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(application.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-3">
                  {application.freelancer.freelancerProfile && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-700">
                          <Briefcase className="h-3 w-3 mr-2" />
                          <span className="font-medium">Industry:</span>
                          <span className="ml-2">
                            {application.freelancer.freelancerProfile.industry}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <IndianRupeeIcon className="h-3 w-3 mr-2" />
                          <span className="font-medium">Rate:</span>
                          <span className="ml-2">
                            ₹
                            {
                              application.freelancer.freelancerProfile
                                .ratePerHour
                            }
                            /hr
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <User className="h-3 w-3 mr-2" />
                          <span className="font-medium">Experience:</span>
                          <span className="ml-2 capitalize">
                            {application.freelancer.freelancerProfile.experience.toLowerCase()}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Skills:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {application.freelancer.freelancerProfile.skills
                              ?.slice(0, 5)
                              .map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Applied {formatDate(application.appliedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(application.status)}
                      <span className="capitalize">
                        {application.status.toLowerCase().replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/messages?userId=${application.freelancer.id}`,
                      )
                    }
                    className="border-gray-300"
                  >
                    <MessageSquare className="mr-2 h-3 w-3" />
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/profile/${application.freelancer.id}`)
                    }
                    className="border-gray-300"
                  >
                    <User className="mr-2 h-3 w-3" />
                    View Profile
                  </Button>
                </div>
                <div className="flex gap-2">
                  {application.status === "PENDING" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleUpdateStatus(application.id, "HIRED")
                        }
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Hire
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUpdateStatus(application.id, "REJECTED")
                        }
                        className="border-red-200 text-red-600 hover:text-red-700"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
