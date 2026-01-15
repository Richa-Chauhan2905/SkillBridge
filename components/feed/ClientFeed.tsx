"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FreelancerCard, { FreelancerCardProps } from "./cards/FreelancerCard";
import { Loader2, Filter, Search, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Industry, Experience } from "@/app/generated/prisma/enums";
import api from "@/lib/axios";
import { Freelancer } from "@/types/freelancer";

export default function ClientFeed() {
  const router = useRouter();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | "ALL">(
    "ALL"
  );
  const [selectedRateRange, setSelectedRateRange] = useState<string>("ALL");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [savedFreelancers, setSavedFreelancers] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetchFreelancers();
  }, []);

  useEffect(() => {
    filterFreelancers();
  }, [
    freelancers,
    searchTerm,
    selectedIndustry,
    selectedRateRange,
    selectedLocation,
  ]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/freelancers");
      setFreelancers(res.data.freelancers || []);

      // Fetch saved freelancers
      const savedRes = await api.get("/saved-freelancers");
      const savedIds = new Set<string>(
        savedRes.data.savedFreelancers?.map((sf: any) => sf.freelancerId) || []
      );
      setSavedFreelancers(savedIds);
    } catch (err) {
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
          freelancer.firstName.toLowerCase().includes(term) || // Changed from freelancer.user.firstName
          freelancer.lastName.toLowerCase().includes(term) || // Changed from freelancer.user.lastName
          freelancer.skills.some((skill) =>
            skill.toLowerCase().includes(term)
          ) ||
          freelancer.bio.toLowerCase().includes(term) ||
          freelancer.education.toLowerCase().includes(term)
      );
    }

    // Industry filter
    if (selectedIndustry !== "ALL") {
      result = result.filter(
        (freelancer) => freelancer.industry === selectedIndustry
      );
    }

    // Rate filter
    if (selectedRateRange !== "ALL") {
      switch (selectedRateRange) {
        case "LOW":
          result = result.filter((f) => f.ratePerHour <= 500);
          break;
        case "MEDIUM":
          result = result.filter(
            (f) => f.ratePerHour > 500 && f.ratePerHour <= 1500
          );
          break;
        case "HIGH":
          result = result.filter((f) => f.ratePerHour > 1500);
          break;
      }
    }

    // Location filter
    if (selectedLocation !== "ALL") {
      result = result.filter(
        (freelancer) =>
          freelancer.city
            .toLowerCase()
            .includes(selectedLocation.toLowerCase()) ||
          freelancer.state
            .toLowerCase()
            .includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredFreelancers(result);
  };

  const handleViewProfile = (id: string) => {
    router.push(`/freelancers/${id}`);
  };

  const handleContact = (id: string) => {
    console.log("Contact freelancer:", id);
    // Open chat or message modal
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
    console.log("Hire freelancer:", id);
    // Navigate to create job or open hire modal
    router.push(`/post-job?freelancerId=${id}`);
  };

  // Get unique industries
  const uniqueIndustries = Array.from(
    new Set(freelancers.map((f) => f.industry).filter(Boolean))
  ) as Industry[];

  // Get unique locations
  const uniqueLocations = Array.from(
    new Set(freelancers.map((f) => `${f.city}, ${f.state}`).filter(Boolean))
  );

  // Rate ranges
  const rateRanges = [
    { label: "All Rates", value: "ALL" },
    { label: "Budget (≤ ₹500/hr)", value: "LOW" },
    { label: "Standard (₹500-₹1500/hr)", value: "MEDIUM" },
    { label: "Premium (≥ ₹1500/hr)", value: "HIGH" },
  ];

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
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Sidebar - Filters */}
      <div className={`lg:w-80 ${showFilters ? "block" : "hidden"} lg:block`}>
        <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-6">
          {/* Mobile filter header */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="mb-5">
            <h3 className="font-medium text-gray-900 mb-2">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search freelancers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Industry Filter */}
          <div className="mb-5">
            <h3 className="font-medium text-gray-900 mb-2">Industry</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedIndustry("ALL")}
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
                  onClick={() => setSelectedIndustry(industry)}
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

          {/* Hourly Rate Filter */}
          <div className="mb-5">
            <h3 className="font-medium text-gray-900 mb-2">Hourly Rate</h3>
            <div className="space-y-2">
              {rateRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedRateRange(range.value)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedRateRange === range.value
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          {uniqueLocations.length > 0 && (
            <div className="mb-5">
              <h3 className="font-medium text-gray-900 mb-2">Location</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedLocation("ALL")}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedLocation === "ALL"
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  All Locations
                </button>
                {uniqueLocations.slice(0, 8).map((location) => (
                  <button
                    key={location}
                    onClick={() => setSelectedLocation(location)}
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
          )}

          {/* Active Filters & Clear */}
          {(selectedIndustry !== "ALL" ||
            selectedRateRange !== "ALL" ||
            selectedLocation !== "ALL" ||
            searchTerm) && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedIndustry !== "ALL" && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Industry: {selectedIndustry.replace(/_/g, " ")}
                    <button
                      onClick={() => setSelectedIndustry("ALL")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedRateRange !== "ALL" && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Rate:{" "}
                    {
                      rateRanges
                        .find((r) => r.value === selectedRateRange)
                        ?.label.split("(")[0]
                    }
                    <button
                      onClick={() => setSelectedRateRange("ALL")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedLocation !== "ALL" && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Location: {selectedLocation}
                    <button
                      onClick={() => setSelectedLocation("ALL")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {searchTerm && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Search: {searchTerm}
                    <button
                      onClick={() => setSearchTerm("")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedIndustry("ALL");
                  setSelectedRateRange("ALL");
                  setSelectedLocation("ALL");
                }}
                className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Content - Freelancers List */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Find Freelancers
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Hire skilled professionals for your projects
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">
                  {filteredFreelancers.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-900">
                  {freelancers.length}
                </span>{" "}
                freelancers
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden border-gray-300 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
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
                  setSelectedRateRange("ALL");
                  setSelectedLocation("ALL");
                }}
                className="border-gray-300 hover:bg-gray-50"
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            // In the map function, update the props:
            {filteredFreelancers.map((freelancer) => (
              <FreelancerCard
                key={freelancer.id}
                id={freelancer.id}
                name={`${freelancer.firstName} ${freelancer.lastName}`}
                industry={freelancer.industry}
                skills={freelancer.skills || []}
                ratePerHour={freelancer.ratePerHour}
                city={freelancer.city}
                state={freelancer.state}
                experience={freelancer.experience}
                bio={freelancer.bio || ""}
                education={freelancer.education || ""}
                languages={freelancer.languages || []}
                resume={freelancer.resume} // Changed from resumeUrl to resume
                isSaved={savedFreelancers.has(freelancer.id)}
                onContact={handleContact}
                onSave={handleSaveFreelancer}
                onUnsave={handleSaveFreelancer}
                onHire={handleHire}
              />
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {filteredFreelancers.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
              <div>
                Showing{" "}
                <span className="font-medium text-gray-900">
                  {filteredFreelancers.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-900">
                  {freelancers.length}
                </span>{" "}
                freelancers
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Available now</span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Budget-friendly</span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span>Verified profiles</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
