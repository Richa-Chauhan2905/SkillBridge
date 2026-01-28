"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase } from "lucide-react";

// Toast Component
interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-full">
      <div
        className={`rounded-lg border p-4 shadow-lg ${type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`h-2 w-2 rounded-full mr-2 ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <p
              className={`text-sm ${type === "success" ? "text-green-800" : "text-red-800"}`}
            >
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredExperience: "BEGINNER",
    payPerHour: "",
    mandatorySkills: "",
    niceToHaveSkills: "",
    tools: "",
    preferredLocation: "",
    preferredEducation: "",
    clientLocation: "",
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title.trim() || !formData.description.trim()) {
        throw new Error("Title and description are required");
      }

      if (!formData.payPerHour || Number(formData.payPerHour) <= 0) {
        throw new Error("Please enter a valid pay rate");
      }

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          postedAt: new Date().toISOString(),
          requiredExperience: formData.requiredExperience,
          payPerHour: Number(formData.payPerHour),
          mandatorySkills: formData.mandatorySkills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          niceToHaveSkills: formData.niceToHaveSkills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          tools: formData.tools
            .split(",")
            .map((tool) => tool.trim())
            .filter(Boolean),
          preferredLocation: formData.preferredLocation.trim(),
          preferredEducation: formData.preferredEducation.trim(),
          clientLocation: formData.clientLocation.trim(),
          status: "OPEN",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to post job");
      }

      showToast("Job posted successfully", "success");

      // Clear form
      setFormData({
        title: "",
        description: "",
        requiredExperience: "BEGINNER",
        payPerHour: "",
        mandatorySkills: "",
        niceToHaveSkills: "",
        tools: "",
        preferredLocation: "",
        preferredEducation: "",
        clientLocation: "",
      });

      // Redirect after 1.5 seconds
      setTimeout(() => {
        router.push("/client-jobs");
      }, 1500);
    } catch (err: any) {
      showToast(err.message, "error");
      console.error("Error posting job:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-blue-600">Post New Job</h1>
        <p className="text-gray-600 mt-1">
          Create a job posting to find qualified freelancers
        </p>
      </div>

      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">Job Information</CardTitle>
          <CardDescription>
            Complete all required fields to publish your job
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700">
                Job Title *
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Senior Frontend Developer"
                value={formData.title}
                onChange={handleChange}
                className="border-gray-300"
                required
              />
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700">
                Job Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the job responsibilities, requirements, and expectations..."
                value={formData.description}
                onChange={handleChange}
                className="min-h-30 border-gray-300"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Experience Level */}
              <div className="space-y-2">
                <Label htmlFor="requiredExperience" className="text-gray-700">
                  Experience Level
                </Label>
                <Select
                  value={formData.requiredExperience}
                  onValueChange={(value) =>
                    handleSelectChange("requiredExperience", value)
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pay Rate */}
              <div className="space-y-2">
                <Label htmlFor="payPerHour" className="text-gray-700">
                  Pay Rate (₹/hr) *
                </Label>
                <Input
                  id="payPerHour"
                  name="payPerHour"
                  type="number"
                  min="1"
                  placeholder="500"
                  value={formData.payPerHour}
                  onChange={handleChange}
                  className="border-gray-300"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preferred Location */}
              <div className="space-y-2">
                <Label htmlFor="preferredLocation" className="text-gray-700">
                  Work Location
                </Label>
                <Select
                  value={formData.preferredLocation}
                  onValueChange={(value) =>
                    handleSelectChange("preferredLocation", value)
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="On-site">On-site</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Education */}
              <div className="space-y-2">
                <Label htmlFor="preferredEducation" className="text-gray-700">
                  Education Level
                </Label>
                <Select
                  value={formData.preferredEducation}
                  onValueChange={(value) =>
                    handleSelectChange("preferredEducation", value)
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select education" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any</SelectItem>
                    <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                    <SelectItem value="Master's">Master's</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Client Location */}
            <div className="space-y-2">
              <Label htmlFor="clientLocation" className="text-gray-700">
                Company Location *
              </Label>
              <Input
                id="clientLocation"
                name="clientLocation"
                placeholder="City, Country"
                value={formData.clientLocation}
                onChange={handleChange}
                className="border-gray-300"
                required
              />
            </div>

            {/* Skills Section */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-medium text-gray-700">
                Skills & Tools
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mandatory Skills */}
                <div className="space-y-2">
                  <Label
                    htmlFor="mandatorySkills"
                    className="text-gray-700 text-sm"
                  >
                    Required Skills
                  </Label>
                  <Input
                    id="mandatorySkills"
                    name="mandatorySkills"
                    placeholder="React, TypeScript, Next.js"
                    value={formData.mandatorySkills}
                    onChange={handleChange}
                    className="border-gray-300 text-sm"
                  />
                  <p className="text-xs text-gray-500">Separate with commas</p>
                </div>

                {/* Nice-to-Have Skills */}
                <div className="space-y-2">
                  <Label
                    htmlFor="niceToHaveSkills"
                    className="text-gray-700 text-sm"
                  >
                    Preferred Skills
                  </Label>
                  <Input
                    id="niceToHaveSkills"
                    name="niceToHaveSkills"
                    placeholder="AWS, Docker, GraphQL"
                    value={formData.niceToHaveSkills}
                    onChange={handleChange}
                    className="border-gray-300 text-sm"
                  />
                  <p className="text-xs text-gray-500">Separate with commas</p>
                </div>
              </div>

              {/* Tools */}
              <div className="space-y-2">
                <Label htmlFor="tools" className="text-gray-700 text-sm">
                  Tools & Technologies
                </Label>
                <Input
                  id="tools"
                  name="tools"
                  placeholder="Git, VS Code, Jira"
                  value={formData.tools}
                  onChange={handleChange}
                  className="border-gray-300 text-sm"
                />
                <p className="text-xs text-gray-500">Separate with commas</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Publish Job
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
