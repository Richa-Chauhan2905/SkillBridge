"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  Mail,
  MapPin,
  Briefcase,
  IndianRupeeIcon,
  GraduationCap,
  Globe,
  Download,
  X,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface FreelancerProfile {
  id: string;
  industry: string;
  skills: string[];
  experience: string;
  education: string;
  bio: string;
  ratePerHour: number;
  city: string;
  state: string;
  languages: string[];
  resume?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function FreelancerProfilePage() {
  const { profileId } = useParams();
  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumePreviewOpen, setResumePreviewOpen] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string>("");

  useEffect(() => {
    if (!profileId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/freelancers/${profileId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load profile");
        }

        setFreelancer(data.freelancer);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);
  const handleResumePreview = async () => {
    if (!freelancer?.resume) return;

    setResumeLoading(true);
    setResumePreviewOpen(true);

    try {
      // Use the correct API route path
      const encodedUrl = encodeURIComponent(freelancer.resume);
      const previewUrl = `/api/resume/preview?url=${encodedUrl}`;

      // Test the API call
      const testResponse = await fetch(previewUrl);

      if (testResponse.ok) {
        setResumeUrl(previewUrl);
      } else {
        console.error("API Error:", await testResponse.text());
        // Fallback: use direct Cloudinary URL
        setResumeUrl(`${freelancer.resume}#view=FitH`);
      }
    } catch (error) {
      console.error("Preview error:", error);
      // Fallback to direct URL
      setResumeUrl(`${freelancer.resume}#view=FitH`);
    } finally {
      setResumeLoading(false);
    }
  };
  const handleDownloadResume = async () => {
    if (!freelancer?.resume) return;

    try {
      // Use the correct API route
      const response = await fetch(
        `/api/resume/preview?url=${encodeURIComponent(freelancer.resume)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to download resume");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${freelancer.user.firstName}_${freelancer.user.lastName}_Resume.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      // Fallback: open in new tab
      window.open(freelancer.resume, "_blank");
    }
  };

  const handleViewOriginal = () => {
    if (freelancer?.resume) {
      window.open(freelancer.resume, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !freelancer) {
    return (
      <div className="text-center text-red-600 mt-10">
        {error || "Freelancer not found"}
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 p-6 md:p-8">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {freelancer.user.firstName} {freelancer.user.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{freelancer.industry}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span>
                      {freelancer.city}, {freelancer.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Mail className="h-4 w-4 text-purple-600" />
                    <span className="truncate max-w-50">
                      {freelancer.user.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 p-2 rounded-lg">
                    <IndianRupeeIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Hourly Rate</div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{freelancer.ratePerHour}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Bio & Experience */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                About Me
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {freelancer.bio}
              </p>
            </div>

            {/* Experience & Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Experience
                  </h3>
                </div>
                <p className="text-gray-700 pl-10">{freelancer.experience}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-50 p-2 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Education
                  </h3>
                </div>
                <p className="text-gray-700 pl-10">{freelancer.education}</p>
              </div>
            </div>

            {/* Skills Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills.map((skill, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="px-4 py-2 text-sm bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:from-blue-100 hover:to-indigo-100 transition-all"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Languages & Contact */}
          <div className="space-y-6">
            {/* Languages */}
            <div className="space-y-4 p-5 bg-linear-to-br from-gray-50 to-white rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 p-2 rounded-lg">
                  <Globe className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Languages
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {freelancer.languages.map((language, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="px-3 py-1.5 bg-white"
                  >
                    {language}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Resume Section */}
            {freelancer.resume && (
              <div className="p-5 bg-linear-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Resume
                  </h3>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={handleResumePreview}
                    className="w-full bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm"
                  >
                    Preview Resume
                  </Button>
                  <Button
                    onClick={handleDownloadResume}
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume Preview Dialog */}
      <Dialog open={resumePreviewOpen} onOpenChange={setResumePreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume Preview - {freelancer?.user.firstName}{" "}
                {freelancer?.user.lastName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResumePreviewOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-hidden">
            {resumeLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="h-full overflow-auto bg-gray-50 rounded-lg">
                {resumeUrl ? (
                  <iframe
                    src={resumeUrl}
                    className="w-full h-full min-h-125 border-0"
                    title="Resume Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No resume available for preview
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-500">
              {resumeUrl?.startsWith("/api/resume")
                ? "PDF loaded via secure API"
                : "PDF loaded directly from Cloudinary"}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setResumePreviewOpen(false)}
              >
                Close
              </Button>
              {freelancer?.resume && (
                <Button
                  onClick={handleDownloadResume}
                  className="bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
