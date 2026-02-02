"use client";

import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  Calendar,
  IndianRupeeIcon,
  Users,
  FileText,
  Eye,
  Edit2,
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface Job {
  id: string;
  title: string;
  description: string;
  requiredExperience: string;
  payPerHour: number;
  mandatorySkills: string[];
  niceToHaveSkills: string[];
  tools: string[];
  preferredLocation: string;
  preferredEducation: string;
  clientLocation: string;
  status: "OPEN" | "CLOSED" | "DRAFT";
  createdAt: string;
  updatedAt: string;
  applicationsCount: number;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Pagination {
  totalJobs: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function MyJobs() {
  const { data: session } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    totalJobs: 0,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    if (session?.user?.role === "CLIENT") {
      fetchJobs();
    }
  }, [session, pagination.currentPage, statusFilter, sortBy]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        ...(sortBy && { sort: sortBy }),
      });

      const response = await fetch(`/api/jobs/client-jobs?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();

      if (data.success) {
        setJobs(data.clientJobs || []);
        setPagination(
          data.pagination || {
            totalJobs: 0,
            totalPages: 1,
            currentPage: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        );
      } else {
        toast.error(data.error || "Failed to load jobs");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load your jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    jobId: string,
    newStatus: "OPEN" | "CLOSED",
  ) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Job ${newStatus.toLowerCase()} successfully`);
        // Update the job status in the list
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === jobId ? { ...job, status: newStatus } : job,
          ),
        );
      } else {
        toast.error(data.error || "Failed to update job status");
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Failed to update job status. Please try again.");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.mandatorySkills.some((skill) =>
          skill.toLowerCase().includes(term),
        ) ||
        job.clientLocation.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Open
          </Badge>
        );
      case "CLOSED":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Closed
          </Badge>
        );
      case "DRAFT":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Draft
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getExperienceLabel = (experience: string) => {
    switch (experience) {
      case "BEGINNER":
        return "Beginner";
      case "INTERMEDIATE":
        return "Intermediate";
      case "EXPERT":
        return "Expert";
      default:
        return experience;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your jobs.</p>
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Jobs</h1>
            <p className="text-gray-600 mt-1">
              Manage your job postings and applications
            </p>
          </div>
          <Button
            onClick={() => router.push("/post-job")}
            className="bg-gray-900 hover:bg-black text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-semibold mt-1">
                    {pagination.totalJobs}
                  </p>
                </div>
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open Jobs</p>
                  <p className="text-2xl font-semibold mt-1">
                    {jobs.filter((j) => j.status === "OPEN").length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-semibold mt-1">
                    {jobs.reduce((acc, job) => acc + job.applicationsCount, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Pay Rate</p>
                  <p className="text-2xl font-semibold mt-1">
                    {jobs.length > 0
                      ? `₹${Math.round(
                          jobs.reduce((acc, job) => acc + job.payPerHour, 0) /
                            jobs.length,
                        )}/hr`
                      : "₹0/hr"}
                  </p>
                </div>
                <IndianRupeeIcon className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border border-gray-200 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs by title, skills, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 border-gray-300"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-35 border-gray-300">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-35 border-gray-300">
                    <div className="flex items-center">
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="applications">
                      Most Applications
                    </SelectItem>
                    <SelectItem value="pay-high">Pay: High to Low</SelectItem>
                    <SelectItem value="pay-low">Pay: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border border-gray-200">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="pt-12 pb-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== "ALL"
                ? "No jobs match your search"
                : "No jobs posted yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "ALL"
                ? "Try adjusting your search or filters"
                : "Start by posting your first job opportunity"}
            </p>
            <Button
              onClick={() => router.push("/post-job")}
              className="bg-gray-900 hover:bg-black text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Post Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg font-medium">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="mt-1 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Posted {formatDate(job.createdAt)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(job.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center text-sm text-gray-700">
                        <IndianRupeeIcon className="h-3 w-3 mr-1" />
                        <span className="font-medium">
                          ₹{job.payPerHour}/hr
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center text-sm text-gray-700">
                        <Users className="h-3 w-3 mr-1" />
                        <span className="font-medium">
                          {job.applicationsCount}
                        </span>
                        <span className="ml-1">applications</span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">
                          {getExperienceLabel(job.requiredExperience)}
                        </span>{" "}
                        level
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">
                          {job.preferredLocation}
                        </span>
                      </div>
                    </div>

                    {job.mandatorySkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.mandatorySkills.slice(0, 5).map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {job.mandatorySkills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.mandatorySkills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-3 w-3 mr-1" />
                    Posted {formatDate(job.createdAt)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      className="border-gray-300"
                    >
                      <Eye className="mr-2 h-3 w-3" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/job-applications/${job.id}`)}
                      className="border-gray-300"
                    >
                      <FileText className="mr-2 h-3 w-3" />
                      Applications ({job.applicationsCount})
                    </Button>
                    {job.status === "OPEN" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(job.id, "CLOSED")}
                        className="border-gray-300 text-amber-600 hover:text-amber-700"
                      >
                        Close Job
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(job.id, "OPEN")}
                        className="border-gray-300 text-green-600 hover:text-green-700"
                      >
                        Reopen
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {jobs.length} of {pagination.totalJobs} jobs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage - 1,
                    }))
                  }
                  disabled={!pagination.hasPrevPage}
                  className="border-gray-300"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage + 1,
                    }))
                  }
                  disabled={!pagination.hasNextPage}
                  className="border-gray-300"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
