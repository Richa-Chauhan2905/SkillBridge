"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import FreelancerCard from "./cards/FreelancerCard";
import {
  Loader2,
  Search,
  Users,
  X,
  Briefcase,
  Star,
  Bookmark,
  MapPin,
  IndianRupeeIcon,
  Code,
  Award,
  Building,
  ChevronDown,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Industry, Experience } from "@/app/generated/prisma/enums";
import api from "@/lib/axios";
import { Freelancer } from "@/types/freelancer";

export default function ClientFeed() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [savedFreelancers, setSavedFreelancers] = useState<Set<string>>(
    new Set()
  );

  // Filter states
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | "ALL">(
    "ALL"
  );
  const [selectedExperience, setSelectedExperience] = useState<
    Experience | "ALL"
  >("ALL");
  const [selectedAvailability, setSelectedAvailability] =
    useState<string>("ALL");
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");

  // Pay range filter (min fixed to 20, max variable)
  const [maxPay, setMaxPay] = useState<number>(5000);

  // Dropdown visibility states
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  const [showPayRangeDropdown, setShowPayRangeDropdown] = useState(false);
  const [showAvailabilityDropdown, setShowAvailabilityDropdown] =
    useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowIndustryDropdown(false);
        setShowExperienceDropdown(false);
        setShowPayRangeDropdown(false);
        setShowAvailabilityDropdown(false);
        setShowSkillsDropdown(false);
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  useEffect(() => {
    filterFreelancers();
  }, [
    freelancers,
    searchTerm,
    selectedIndustry,
    selectedExperience,
    selectedAvailability,
    selectedSkills,
    selectedLocation,
    maxPay,
  ]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/freelancers");
      const fetchedFreelancers = res.data.transformedFreelancers || [];
      setFreelancers(fetchedFreelancers);

      // Set initial max pay based on fetched freelancers
      const payRates = fetchedFreelancers
        .filter((f: Freelancer) => f.ratePerHour)
        .map((f: Freelancer) => f.ratePerHour as number);

      if (payRates.length > 0) {
        const max = Math.ceil(Math.max(...payRates));
        setMaxPay(max);
      }

      // Fetch saved freelancers
      // const savedRes = await api.get("/saved-freelancers");
      // const savedIds = new Set<string>(savedRes.data.savedFreelancers?.map((sf: any) => sf.freelancerId) || []);
      // setSavedFreelancers(savedIds);
    } catch (err: any) {
      console.error("Failed to fetch freelancers:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterFreelancers = () => {
    let result = [...freelancers];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (freelancer) =>
          freelancer.firstName.toLowerCase().includes(term) ||
          freelancer.lastName.toLowerCase().includes(term) ||
          freelancer.skills.some((skill) =>
            skill.toLowerCase().includes(term)
          ) ||
          freelancer.industry.toLowerCase().includes(term)
      );
    }

    // Industry filter
    if (selectedIndustry !== "ALL") {
      result = result.filter(
        (freelancer) => freelancer.industry === selectedIndustry
      );
    }

    // Experience filter
    if (selectedExperience !== "ALL") {
      result = result.filter(
        (freelancer) => freelancer.experience === selectedExperience
      );
    }

    // Availability filter
    if (selectedAvailability !== "ALL") {
      // This is a mock filter - you might want to add actual availability data to your Freelancer type
      result = result.filter((freelancer) => {
        if (selectedAvailability === "AVAILABLE_NOW") return true; // Mock logic
        if (selectedAvailability === "PART_TIME") return true; // Mock logic
        if (selectedAvailability === "FULL_TIME") return true; // Mock logic
        return true;
      });
    }

    // Pay range filter (min fixed to 20, max is variable)
    result = result.filter((freelancer) => {
      return freelancer.ratePerHour >= 20 && freelancer.ratePerHour <= maxPay;
    });

    // Skills filter
    if (selectedSkills.size > 0) {
      result = result.filter((freelancer) =>
        Array.from(selectedSkills).every((skill) =>
          freelancer.skills.includes(skill)
        )
      );
    }

    // Location filter
    if (selectedLocation !== "ALL") {
      result = result.filter((freelancer) =>
        freelancer.city.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredFreelancers(result);
  };

  const handleViewProfile = (id: string) => {
    router.push(`/freelancers/${id}`);
  };

  const handleSaveFreelancer = async (id: string) => {
    try {
      if (savedFreelancers.has(id)) {
        await api.delete(`/saved-freelancers/${id}`);
        setSavedFreelancers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        await api.post("/saved-freelancers", { freelancerId: id });
        setSavedFreelancers((prev) => new Set([...prev, id]));
      }
    } catch (err) {
      console.error("Failed to save freelancer:", err);
    }
  };

  const handleHire = (id: string) => {
    router.push(`/post-job?freelancerId=${id}`);
  };

  // Get unique industries
  const uniqueIndustries = Array.from(
    new Set(freelancers.map((f) => f.industry).filter(Boolean))
  ) as Industry[];

  // Get unique skills
  const allSkills = Array.from(
    new Set(freelancers.flatMap((f) => f.skills || []).filter(Boolean))
  );

  // Get unique locations (city only)
  const uniqueLocations = Array.from(
    new Set(freelancers.map((f) => f.city).filter(Boolean))
  );

  // Experience levels
  const experienceLevels = [
    { value: "ALL", label: "All Experience Levels" },
    { value: "BEGINNER", label: "Beginner" },
    { value: "INTERMEDIATE", label: "Intermediate" },
    { value: "EXPERT", label: "Expert" },
  ] as const;

  // Availability options
  const availabilityOptions = [
    { value: "ALL", label: "All Availability" },
    { value: "AVAILABLE_NOW", label: "Available Now" },
    { value: "PART_TIME", label: "Part-time" },
    { value: "FULL_TIME", label: "Full-time" },
  ] as const;

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedIndustry !== "ALL") count++;
    if (selectedExperience !== "ALL") count++;
    if (selectedAvailability !== "ALL") count++;
    if (selectedSkills.size > 0) count++;
    if (selectedLocation !== "ALL") count++;
    if (searchTerm) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Get industry display text
  const getIndustryDisplay = () => {
    if (selectedIndustry === "ALL") return "Industry";
    return selectedIndustry.replace(/_/g, " ");
  };

  // Get experience display text
  const getExperienceDisplay = () => {
    if (selectedExperience === "ALL") return "Experience";
    return selectedExperience;
  };

  // Get availability display text
  const getAvailabilityDisplay = () => {
    if (selectedAvailability === "ALL") return "Availability";
    return (
      availabilityOptions.find((a) => a.value === selectedAvailability)
        ?.label || "Availability"
    );
  };

  // Get skills display text
  const getSkillsDisplay = () => {
    if (selectedSkills.size === 0) return "Skills";
    if (selectedSkills.size === 1) return `${Array.from(selectedSkills)[0]}`;
    return `${selectedSkills.size} skills`;
  };

  // Get location display text
  const getLocationDisplay = () => {
    if (selectedLocation === "ALL") return "Location";
    return selectedLocation;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading freelancers...</p>
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
              Find Freelancers
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-gray-900 text-sm">
                    {filteredFreelancers.length}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Freelancers</p>
              </div>

              <div className="h-8 w-px bg-gray-300"></div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <Bookmark className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold text-gray-900 text-sm">
                    {savedFreelancers.size}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Saved</p>
              </div>

              <div className="h-8 w-px bg-gray-300"></div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-gray-900 text-sm">
                    {0} {/* You can add hired count here */}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Hired</p>
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
              placeholder="Search freelancers by name, skills, industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Individual Filter Dropdowns */}
          <div className="flex flex-wrap gap-2">
            {/* Industry Filter */}
            {uniqueIndustries.length > 0 && (
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowIndustryDropdown(!showIndustryDropdown);
                    setShowExperienceDropdown(false);
                    setShowPayRangeDropdown(false);
                    setShowAvailabilityDropdown(false);
                    setShowSkillsDropdown(false);
                    setShowLocationDropdown(false);
                  }}
                  className={`h-10 border-gray-300 hover:bg-gray-50 ${
                    selectedIndustry !== "ALL"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : ""
                  }`}
                >
                  <Building className="h-4 w-4 mr-2" />
                  {getIndustryDisplay()}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>

                {showIndustryDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Industry
                      </h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setSelectedIndustry("ALL");
                            setShowIndustryDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedIndustry === "ALL"
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          All Industries
                        </button>
                        {uniqueIndustries.map((industry) => (
                          <button
                            key={industry}
                            onClick={() => {
                              setSelectedIndustry(industry);
                              setShowIndustryDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedIndustry === industry
                                ? "bg-blue-100 text-blue-700 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {industry.replace(/_/g, " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Experience Filter */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => {
                  setShowExperienceDropdown(!showExperienceDropdown);
                  setShowIndustryDropdown(false);
                  setShowPayRangeDropdown(false);
                  setShowAvailabilityDropdown(false);
                  setShowSkillsDropdown(false);
                  setShowLocationDropdown(false);
                }}
                className={`h-10 border-gray-300 hover:bg-gray-50 ${
                  selectedExperience !== "ALL"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : ""
                }`}
              >
                <Award className="h-4 w-4 mr-2" />
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
                  setShowIndustryDropdown(false);
                  setShowExperienceDropdown(false);
                  setShowAvailabilityDropdown(false);
                  setShowSkillsDropdown(false);
                  setShowLocationDropdown(false);
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

            {/* Availability Filter */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAvailabilityDropdown(!showAvailabilityDropdown);
                  setShowIndustryDropdown(false);
                  setShowExperienceDropdown(false);
                  setShowPayRangeDropdown(false);
                  setShowSkillsDropdown(false);
                  setShowLocationDropdown(false);
                }}
                className={`h-10 border-gray-300 hover:bg-gray-50 ${
                  selectedAvailability !== "ALL"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : ""
                }`}
              >
                <Clock className="h-4 w-4 mr-2" />
                {getAvailabilityDisplay()}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>

              {showAvailabilityDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Availability
                    </h3>
                    <div className="space-y-1">
                      {availabilityOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedAvailability(option.value);
                            setShowAvailabilityDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedAvailability === option.value
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {option.label}
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
                    setShowIndustryDropdown(false);
                    setShowExperienceDropdown(false);
                    setShowPayRangeDropdown(false);
                    setShowAvailabilityDropdown(false);
                    setShowLocationDropdown(false);
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

            {/* Location Filter */}
            {uniqueLocations.length > 0 && (
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLocationDropdown(!showLocationDropdown);
                    setShowIndustryDropdown(false);
                    setShowExperienceDropdown(false);
                    setShowPayRangeDropdown(false);
                    setShowAvailabilityDropdown(false);
                    setShowSkillsDropdown(false);
                  }}
                  className={`h-10 border-gray-300 hover:bg-gray-50 ${
                    selectedLocation !== "ALL"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : ""
                  }`}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {getLocationDisplay()}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>

                {showLocationDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4">
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setSelectedLocation("ALL");
                            setShowLocationDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedLocation === "ALL"
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          All Locations
                        </button>
                        {uniqueLocations.slice(0, 10).map((location) => (
                          <button
                            key={location}
                            onClick={() => {
                              setSelectedLocation(location);
                              setShowLocationDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedLocation === location
                                ? "bg-blue-100 text-blue-700 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Bar */}
        {(selectedIndustry !== "ALL" ||
          selectedExperience !== "ALL" ||
          selectedAvailability !== "ALL" ||
          selectedSkills.size > 0 ||
          selectedLocation !== "ALL") && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {selectedIndustry !== "ALL" && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    {selectedIndustry.replace(/_/g, " ")}
                    <button
                      onClick={() => setSelectedIndustry("ALL")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
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
                {selectedAvailability !== "ALL" && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    {availabilityOptions.find(
                      (a) => a.value === selectedAvailability
                    )?.label || selectedAvailability}
                    <button
                      onClick={() => setSelectedAvailability("ALL")}
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
                {selectedLocation !== "ALL" && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    {selectedLocation}
                    <button
                      onClick={() => setSelectedLocation("ALL")}
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
                  setSelectedIndustry("ALL");
                  setSelectedExperience("ALL");
                  setSelectedAvailability("ALL");
                  setSelectedSkills(new Set());
                  setSelectedLocation("ALL");
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear all
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Freelancers Grid */}
      {filteredFreelancers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
            <Search className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">
            No freelancers found
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {freelancers.length === 0
              ? "No freelancers available at the moment"
              : "Try adjusting your search or filters"}
          </p>
          {freelancers.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedIndustry("ALL");
                setSelectedExperience("ALL");
                setSelectedAvailability("ALL");
                setSelectedSkills(new Set());
                setSelectedLocation("ALL");
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
            {filteredFreelancers.map((freelancer) => (
              <FreelancerCard
                key={freelancer.id}
                id={freelancer.id}
                firstName={freelancer.firstName}
                lastName={freelancer.lastName}
                industry={freelancer.industry}
                skills={freelancer.skills || []}
                ratePerHour={freelancer.ratePerHour}
                city={freelancer.city}
                experience={freelancer.experience}
                isSaved={savedFreelancers.has(freelancer.id)}
                onSave={handleSaveFreelancer}
                onUnsave={handleSaveFreelancer}
                onHire={handleHire}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>

          {/* Footer Stats */}
          {filteredFreelancers.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">
                    {filteredFreelancers.length}
                  </span>{" "}
                  freelancers match your criteria
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>Available now</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Budget-friendly</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>Verified profiles</span>
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
