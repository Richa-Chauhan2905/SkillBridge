"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import JobCard from "@/components/feed/cards/JobCard";
import {
  Loader2,
  Search,
  X,
  Briefcase,
  Bookmark,
  CheckCircle,
  ChevronDown,
  IndianRupeeIcon,
  Star,
  MapPin,
  Code,
  ToolCase,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Experience,
  JobStatus,
  Industry,
  ApplicationStatus,
} from "@/app/generated/prisma/enums";

// Define the Job type matching your API response
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

interface AppliedJob {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  job?: Job; // Include the job data if your API returns it
}

export default function FreelancerFeed() {
  const { data: session } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set()); // Track applied job IDs
  const [appliedJobsMap, setAppliedJobsMap] = useState<
    Map<string, ApplicationStatus>
  >(new Map()); // Track application status
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedExperience, setSelectedExperience] = useState<
    Experience | "ALL"
  >("ALL");
  const [selectedJobType, setSelectedJobType] = useState<string>("ALL");
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());

  // Pay range filter (max only, min fixed to 20)
  const [maxPay, setMaxPay] = useState<number>(5000);

  // Skills and Tools state
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [allTools, setAllTools] = useState<string[]>([]);

  // Dropdown visibility states
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  const [showPayRangeDropdown, setShowPayRangeDropdown] = useState(false);
  const [showJobTypeDropdown, setShowJobTypeDropdown] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowExperienceDropdown(false);
        setShowPayRangeDropdown(false);
        setShowJobTypeDropdown(false);
        setShowSkillsDropdown(false);
        setShowToolsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch applied jobs from the new endpoint
  const fetchAppliedJobs = useCallback(async () => {
    try {
      const response = await fetch("/api/my-applications");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const appliedIds = new Set<string>();
          const appliedMap = new Map<string, ApplicationStatus>();

          data.applications?.forEach((app: AppliedJob) => {
            appliedIds.add(app.jobId);
            appliedMap.set(app.jobId, app.status);
          });

          setAppliedJobs(appliedIds);
          setAppliedJobsMap(appliedMap);

          // Update localStorage for backward compatibility
          localStorage.setItem(
            "freelancerAppliedJobs",
            JSON.stringify(
              data.applications?.map((app: AppliedJob) => ({
                id: app.jobId,
                status: app.status,
              })) || []
            )
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch applied jobs:", error);
      // Fallback to localStorage if backend fails
      const appliedJobsStr = localStorage.getItem("freelancerAppliedJobs");
      if (appliedJobsStr) {
        try {
          const appliedJobsArray = JSON.parse(appliedJobsStr);
          const appliedIds = new Set<string>();
          const appliedMap = new Map<string, ApplicationStatus>();

          appliedJobsArray.forEach(
            (job: { id: string; status: ApplicationStatus }) => {
              appliedIds.add(job.id);
              appliedMap.set(job.id, job.status);
            }
          );

          setAppliedJobs(appliedIds);
          setAppliedJobsMap(appliedMap);
        } catch (error) {
          console.error("Error parsing applied jobs:", error);
        }
      }
    }
  }, []);

  // Define fetchJobs with useCallback
  const fetchJobs = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs?page=${page}`);

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          const fetchedJobs = data.jobs || [];
          setJobs(fetchedJobs);
          setFilteredJobs(fetchedJobs);
          setTotalPages(data.pagination?.totalPages || 1);

          // Extract all unique skills and tools from fetched jobs
          const jobsArray = fetchedJobs as Job[];
          const skills = Array.from(
            new Set(jobsArray.flatMap((job: Job) => job.mandatorySkills || []))
          );
          const tools = Array.from(
            new Set(jobsArray.flatMap((job: Job) => job.tools || []))
          );
          setAllSkills(skills);
          setAllTools(tools);

          // Set initial max pay based on fetched jobs
          const payRates = fetchedJobs
            .filter((job: Job) => job.payPerHour)
            .map((job: Job) => job.payPerHour as number);

          if (payRates.length > 0) {
            const max = Math.ceil(Math.max(...payRates));
            setMaxPay(max);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    const initializeData = async () => {
      try {
        setLoading(true);

        // Fetch jobs
        await fetchJobs(currentPage);

        // Fetch applied jobs
        await fetchAppliedJobs();

        // Fetch saved jobs from backend
        try {
          const response = await fetch("/api/saved-jobs");
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              const savedJobIds =
                data.savedJobs?.map((job: any) => job.id) || [];
              setSavedJobs(new Set(savedJobIds));

              // Also update localStorage for backward compatibility
              localStorage.setItem(
                "freelancerSavedJobs",
                JSON.stringify(savedJobIds)
              );
            }
          }
        } catch (error) {
          console.error("Error fetching saved jobs from backend:", error);
          // Fallback to localStorage if backend fails
          const savedJobsStr = localStorage.getItem("freelancerSavedJobs");
          if (savedJobsStr) {
            try {
              const savedJobsArray = JSON.parse(savedJobsStr);
              setSavedJobs(new Set(savedJobsArray));
            } catch (error) {
              console.error("Error parsing saved jobs:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [session, currentPage, fetchJobs, fetchAppliedJobs]);

  // Apply filters whenever filter criteria change
  // Apply filters whenever filter criteria change
  useEffect(() => {
    if (jobs.length === 0) return;

    let result = [...jobs];

    // FILTER OUT APPLIED JOBS - Add this filter first
    result = result.filter((job) => !appliedJobs.has(job.id));

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(term) ||
          job.description.toLowerCase().includes(term) ||
          job.mandatorySkills.some((skill) =>
            skill.toLowerCase().includes(term)
          ) ||
          job.client.firstName.toLowerCase().includes(term) ||
          job.client.lastName.toLowerCase().includes(term) ||
          job.client.clientProfile?.companyName?.toLowerCase().includes(term) ||
          false
      );
    }

    // Experience filter
    if (selectedExperience !== "ALL") {
      result = result.filter(
        (job) => job.requiredExperience === selectedExperience
      );
    }

    // Pay range filter (min fixed to 20, max is variable)
    result = result.filter((job) => {
      if (!job.payPerHour) return false;
      return job.payPerHour >= 20 && job.payPerHour <= maxPay;
    });

    // Job type filter (based on preferredLocation)
    if (selectedJobType !== "ALL") {
      result = result.filter((job) => {
        if (!job.preferredLocation) return selectedJobType === "REMOTE";
        const location = job.preferredLocation.toLowerCase();
        if (selectedJobType === "REMOTE") return location.includes("remote");
        if (selectedJobType === "ONSITE")
          return !location.includes("remote") && !location.includes("hybrid");
        if (selectedJobType === "HYBRID") return location.includes("hybrid");
        return true;
      });
    }

    // Skills filter
    if (selectedSkills.size > 0) {
      result = result.filter((job) =>
        Array.from(selectedSkills).every((skill) =>
          job.mandatorySkills.includes(skill)
        )
      );
    }

    // Tools filter
    if (selectedTools.size > 0) {
      result = result.filter((job) =>
        Array.from(selectedTools).every((tool) => job.tools?.includes(tool))
      );
    }

    // Only show open jobs by default
    result = result.filter((job) => job.status === "OPEN");

    setFilteredJobs(result);
  }, [
    jobs,
    searchTerm,
    selectedExperience,
    selectedJobType,
    selectedSkills,
    selectedTools,
    maxPay,
    appliedJobs, // Add appliedJobs to dependencies
  ]);

  const handleViewJob = (id: string) => {
    router.push(`/jobs/${id}`);
  };

  const handleSaveJob = async (id: string) => {
    try {
      if (savedJobs.has(id)) {
        // Remove from saved - DELETE request to backend
        await api.delete("/saved-jobs", {
          data: { jobId: id },
        });

        // Update localStorage
        const savedJobsStr =
          localStorage.getItem("freelancerSavedJobs") || "[]";
        let savedJobsArray = JSON.parse(savedJobsStr);
        savedJobsArray = savedJobsArray.filter((jobId: string) => jobId !== id);

        // Update state
        setSavedJobs((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });

        localStorage.setItem(
          "freelancerSavedJobs",
          JSON.stringify(savedJobsArray)
        );
      } else {
        // Add to saved - POST request to backend
        await api.post("/saved-jobs", { jobId: id });

        // Update localStorage
        const savedJobsStr =
          localStorage.getItem("freelancerSavedJobs") || "[]";
        let savedJobsArray = JSON.parse(savedJobsStr);
        savedJobsArray.push(id);

        // Update state
        setSavedJobs((prev) => new Set([...prev, id]));

        localStorage.setItem(
          "freelancerSavedJobs",
          JSON.stringify(savedJobsArray)
        );
      }
    } catch (error) {
      console.error("Failed to update saved job:", error);
      throw error; // Re-throw so JobCard can handle the error
    }
  };

  const handleApply = async (id: string) => {
    try {
      // Optimistic UI update
      setAppliedJobs((prev) => new Set([...prev, id]));
      setAppliedJobsMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(id, "PENDING");
        return newMap;
      });

      const response = await fetch(`/api/jobs/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // Refresh applied jobs list from backend
        await fetchAppliedJobs();
      } else {
        // Revert optimistic update on error
        setAppliedJobs((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        setAppliedJobsMap((prev) => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });

        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to apply");
      }
    } catch (error) {
      console.error("Failed to apply:", error);
      throw error;
    }
  };

  // Calculate stats from current data
  const appliedJobsCount = appliedJobs.size;

  // Experience levels
  const experienceLevels = [
    { value: "ALL", label: "All Experience Levels" },
    { value: "BEGINNER", label: "Beginner" },
    { value: "INTERMEDIATE", label: "Intermediate" },
    { value: "EXPERT", label: "Expert" },
  ] as const;

  // Job types
  const jobTypes = [
    { value: "ALL", label: "All Types" },
    { value: "REMOTE", label: "Remote" },
    { value: "ONSITE", label: "On-site" },
    { value: "HYBRID", label: "Hybrid" },
  ] as const;

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedExperience !== "ALL") count++;
    if (selectedJobType !== "ALL") count++;
    if (selectedSkills.size > 0) count++;
    if (selectedTools.size > 0) count++;
    if (searchTerm) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Get experience display text
  const getExperienceDisplay = () => {
    if (selectedExperience === "ALL") return "Experience";
    return selectedExperience;
  };

  // Get job type display text
  const getJobTypeDisplay = () => {
    if (selectedJobType === "ALL") return "Job Type";
    return selectedJobType;
  };

  // Get skills display text
  const getSkillsDisplay = () => {
    if (selectedSkills.size === 0) return "Skills";
    if (selectedSkills.size === 1) return `${Array.from(selectedSkills)[0]}`;
    return `${selectedSkills.size} skills`;
  };

  // Get tools display text
  const getToolsDisplay = () => {
    if (selectedTools.size === 0) return "Tools";
    if (selectedTools.size === 1) return `${Array.from(selectedTools)[0]}`;
    return `${selectedTools.size} tools`;
  };

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view the job feed.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filter Dropdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Job Opportunities
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Stats Cards */}
            <div className="flex gap-4">
              {/* In the stats cards section, update the jobs count:*/}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-gray-900 text-sm">
                    {filteredJobs.length}{" "}
                    {/* This now shows only non-applied jobs */}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Available Jobs</p>{" "}
                {/* Changed label */}
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <Bookmark className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold text-gray-900 text-sm">
                    {savedJobs.size}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Saved</p>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-gray-900 text-sm">
                    {appliedJobsCount}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Applied</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Button Row */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4" ref={dropdownRef}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by title, skills, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Individual Filter Dropdowns */}
          <div className="flex flex-wrap gap-2">
            {/* Experience Filter */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => {
                  setShowExperienceDropdown(!showExperienceDropdown);
                  setShowPayRangeDropdown(false);
                  setShowJobTypeDropdown(false);
                  setShowSkillsDropdown(false);
                  setShowToolsDropdown(false);
                }}
                className={`h-10 border-gray-300 hover:bg-gray-50 ${
                  selectedExperience !== "ALL"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : ""
                }`}
              >
                <Star className="h-4 w-4 mr-2" />
                {getExperienceDisplay()}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>

              {showExperienceDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Experience Level
                    </h3>
                    <div className="space-y-1">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => {
                            setSelectedExperience(
                              level.value as Experience | "ALL"
                            );
                            setShowExperienceDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedExperience === level.value
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pay Range Filter */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPayRangeDropdown(!showPayRangeDropdown);
                  setShowExperienceDropdown(false);
                  setShowJobTypeDropdown(false);
                  setShowSkillsDropdown(false);
                  setShowToolsDropdown(false);
                }}
                className="h-10 border-gray-300 hover:bg-gray-50"
              >
                <IndianRupeeIcon className="h-4 w-4 mr-2" />
                Pay: ₹20 - ₹{maxPay}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>

              {showPayRangeDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Pay Range (₹/hr)
                    </h3>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <span>Up to ₹{maxPay} per hour</span>
                      </div>
                      <div>
                        <input
                          type="range"
                          min="20"
                          max="10000"
                          step="100"
                          value={maxPay}
                          onChange={(e) => setMaxPay(Number(e.target.value))}
                          className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>₹20</span>
                          <span>₹{maxPay}</span>
                          <span>₹10000</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm font-medium text-blue-700">
                        <IndianRupeeIcon className="h-4 w-4" />
                        <span>Max: ₹{maxPay}/hr</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Job Type Filter */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => {
                  setShowJobTypeDropdown(!showJobTypeDropdown);
                  setShowExperienceDropdown(false);
                  setShowPayRangeDropdown(false);
                  setShowSkillsDropdown(false);
                  setShowToolsDropdown(false);
                }}
                className={`h-10 border-gray-300 hover:bg-gray-50 ${
                  selectedJobType !== "ALL"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : ""
                }`}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {getJobTypeDisplay()}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>

              {showJobTypeDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 mb-2">Job Type</h3>
                    <div className="space-y-1">
                      {jobTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => {
                            setSelectedJobType(type.value);
                            setShowJobTypeDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedJobType === type.value
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Skills Filter */}
            {allSkills.length > 0 && (
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSkillsDropdown(!showSkillsDropdown);
                    setShowExperienceDropdown(false);
                    setShowPayRangeDropdown(false);
                    setShowJobTypeDropdown(false);
                    setShowToolsDropdown(false);
                  }}
                  className={`h-10 border-gray-300 hover:bg-gray-50 ${
                    selectedSkills.size > 0
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : ""
                  }`}
                >
                  <Code className="h-4 w-4 mr-2" />
                  {getSkillsDisplay()}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>

                {showSkillsDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">Skills</h3>
                        {selectedSkills.size > 0 && (
                          <button
                            onClick={() => setSelectedSkills(new Set())}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {allSkills.slice(0, 15).map((skill) => (
                          <div key={skill} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`skill-${skill}`}
                              checked={selectedSkills.has(skill)}
                              onChange={(e) => {
                                const newSkills = new Set(selectedSkills);
                                if (e.target.checked) {
                                  newSkills.add(skill);
                                } else {
                                  newSkills.delete(skill);
                                }
                                setSelectedSkills(newSkills);
                              }}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`skill-${skill}`}
                              className="text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                            >
                              {skill}
                            </label>
                          </div>
                        ))}
                        {allSkills.length > 15 && (
                          <p className="text-xs text-gray-500 pt-1">
                            +{allSkills.length - 15} more skills
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tools Filter */}
            {allTools.length > 0 && (
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowToolsDropdown(!showToolsDropdown);
                    setShowExperienceDropdown(false);
                    setShowPayRangeDropdown(false);
                    setShowJobTypeDropdown(false);
                    setShowSkillsDropdown(false);
                  }}
                  className={`h-10 border-gray-300 hover:bg-gray-50 ${
                    selectedTools.size > 0
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : ""
                  }`}
                >
                  <ToolCase className="h-4 w-4 mr-2" />
                  {getToolsDisplay()}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>

                {showToolsDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          Tools & Technologies
                        </h3>
                        {selectedTools.size > 0 && (
                          <button
                            onClick={() => setSelectedTools(new Set())}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {allTools.slice(0, 12).map((tool) => (
                          <div key={tool} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`tool-${tool}`}
                              checked={selectedTools.has(tool)}
                              onChange={(e) => {
                                const newTools = new Set(selectedTools);
                                if (e.target.checked) {
                                  newTools.add(tool);
                                } else {
                                  newTools.delete(tool);
                                }
                                setSelectedTools(newTools);
                              }}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`tool-${tool}`}
                              className="text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                            >
                              {tool}
                            </label>
                          </div>
                        ))}
                        {allTools.length > 12 && (
                          <p className="text-xs text-gray-500 pt-1">
                            +{allTools.length - 12} more tools
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Bar */}
        {(selectedExperience !== "ALL" ||
          selectedJobType !== "ALL" ||
          selectedSkills.size > 0 ||
          selectedTools.size > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {selectedExperience !== "ALL" && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    {selectedExperience}
                    <button
                      onClick={() => setSelectedExperience("ALL")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedJobType !== "ALL" && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    {selectedJobType}
                    <button
                      onClick={() => setSelectedJobType("ALL")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedSkills.size > 0 && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    {selectedSkills.size} skill
                    {selectedSkills.size > 1 ? "s" : ""}
                    <button
                      onClick={() => setSelectedSkills(new Set())}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedTools.size > 0 && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    {selectedTools.size} tool{selectedTools.size > 1 ? "s" : ""}
                    <button
                      onClick={() => setSelectedTools(new Set())}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedExperience("ALL");
                  setSelectedJobType("ALL");
                  setSelectedSkills(new Set());
                  setSelectedTools(new Set());
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear all
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 text-sm mb-4">
            {jobs.length === 0
              ? "No jobs available at the moment"
              : "Try adjusting your search or filters"}
          </p>
          {jobs.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedExperience("ALL");
                setSelectedJobType("ALL");
                setSelectedSkills(new Set());
                setSelectedTools(new Set());
              }}
              className="border-gray-300 hover:bg-gray-50"
            >
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredJobs.map((job) => {
              const isApplied = appliedJobs.has(job.id);
              const applicationStatus = appliedJobsMap.get(job.id) || null;

              return (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  client={job.client}
                  payPerHour={job.payPerHour}
                  mandatorySkills={job.mandatorySkills}
                  isSaved={savedJobs.has(job.id)}
                  applicationStatus={applicationStatus}
                  onSaveJob={handleSaveJob}
                  onUnsaveJob={handleSaveJob}
                  onApply={isApplied ? undefined : handleApply}
                  onViewJob={handleViewJob}
                />
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* In the pagination controls section */}
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-medium">{filteredJobs.length}</span> of{" "}
                <span className="font-medium">
                  {
                    jobs.filter(
                      (j) => j.status === "OPEN" && !appliedJobs.has(j.id)
                    ).length
                  }
                </span>{" "}
                available jobs {/* Updated text */}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center text-sm rounded ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 flex items-center justify-center text-sm rounded text-gray-700 hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {filteredJobs.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">
                    {filteredJobs.length}
                  </span>{" "}
                  jobs match your criteria
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Remote work</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Flexible hours</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>Verified clients</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
