"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import JobCard from "./cards/JobCard";
import { Loader2, Filter, Search, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Experience, JobStatus, Industry } from "@/app/generated/prisma/enums";

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

  postedAt: string;   // ✅ string
  createdAt: string;  // ✅ string

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


export default function FreelancerFeed() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedExperience, setSelectedExperience] = useState<Experience | "ALL">("ALL");
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | "ALL">("ALL");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs");
        setJobs(res.data.jobs || []);
        setFilteredJobs(res.data.jobs || []);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search and filters
  useEffect(() => {
    let result = jobs;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(job =>
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.mandatorySkills.some(skill => skill.toLowerCase().includes(term)) ||
        job.client.firstName.toLowerCase().includes(term) ||
        job.client.lastName.toLowerCase().includes(term)
      );
    }

    // Experience filter
    if (selectedExperience !== "ALL") {
      result = result.filter(job => job.requiredExperience === selectedExperience);
    }

    // Industry filter
    if (selectedIndustry !== "ALL") {
      result = result.filter(job => 
        job.client.clientProfile?.industry === selectedIndustry
      );
    }

    setFilteredJobs(result);
  }, [jobs, searchTerm, selectedExperience, selectedIndustry]);

  const handleViewProfile = (id: string) => {
    // Navigate to client profile
    console.log("View client profile:", id);
    // router.push(`/client/${id}`);
  };

  const handleMessage = (id: string) => {
    // Open chat with client
    console.log("Message client:", id);
    // openChat(id);
  };

  const handleApply = (id: string) => {
    // Apply for job
    console.log("Apply for job:", id);
    // applyToJob(id);
  };

  // Get unique industries from jobs
  const uniqueIndustries = Array.from(
    new Set(jobs.map(job => job.client.clientProfile?.industry).filter(Boolean))
  ) as Industry[];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Job Opportunities</h1>
            <p className="text-gray-600 mt-2">Find projects that match your skills and experience</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-white rounded-lg border border-amber-200">
              <span className="text-sm text-gray-600">Showing</span>
              <span className="font-bold text-amber-700 mx-1">{filteredJobs.length}</span>
              <span className="text-sm text-gray-600">of {jobs.length} jobs</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-amber-300 hover:bg-amber-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search jobs by title, skills, or client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
          />
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-6 p-4 bg-white rounded-xl border border-amber-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experience Filter */}
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Experience Level</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedExperience === "ALL" ? "default" : "outline"}
                    className={`cursor-pointer ${selectedExperience === "ALL" ? "bg-amber-500 text-white hover:bg-amber-600" : "hover:bg-amber-50"}`}
                    onClick={() => setSelectedExperience("ALL")}
                  >
                    All Levels
                  </Badge>
                  {Object.values(Experience).map((exp) => (
                    <Badge
                      key={exp}
                      variant={selectedExperience === exp ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedExperience === exp
                          ? exp === 'BEGINNER'
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : exp === 'INTERMEDIATE'
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : 'bg-purple-500 text-white hover:bg-purple-600'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedExperience(exp)}
                    >
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Industry Filter */}
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Industry</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedIndustry === "ALL" ? "default" : "outline"}
                    className={`cursor-pointer ${selectedIndustry === "ALL" ? "bg-amber-500 text-white hover:bg-amber-600" : "hover:bg-amber-50"}`}
                    onClick={() => setSelectedIndustry("ALL")}
                  >
                    All Industries
                  </Badge>
                  {uniqueIndustries.map((industry) => (
                    <Badge
                      key={industry}
                      variant={selectedIndustry === industry ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedIndustry === industry
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'hover:bg-blue-50'
                      }`}
                      onClick={() => setSelectedIndustry(industry)}
                    >
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedExperience !== "ALL" || selectedIndustry !== "ALL") && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedExperience("ALL");
                    setSelectedIndustry("ALL");
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* No Results State */}
      {filteredJobs.length === 0 && jobs.length > 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
            <Search className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No jobs match your filters</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedExperience("ALL");
              setSelectedIndustry("ALL");
            }}
            className="border-amber-300 hover:bg-amber-50"
          >
            Clear all filters
          </Button>
        </div>
      ) : filteredJobs.length === 0 && jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No jobs available</h3>
          <p className="text-gray-500">Check back later for new opportunities</p>
        </div>
      ) : (
        /* Job Cards Grid */
        <div className="space-y-6">
          {filteredJobs.map((job) => (
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
              onViewProfile={handleViewProfile}
              onMessage={handleMessage}
              onApply={handleApply}
            />
          ))}
        </div>
      )}

      {/* Stats Footer */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-800">{filteredJobs.length}</span> of{" "}
            <span className="font-semibold text-gray-800">{jobs.length}</span> opportunities
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Open positions</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-sm text-gray-600">High hourly rate</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">Remote available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}