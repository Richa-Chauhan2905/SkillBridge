"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  FileText,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
  Phone,
  IndianRupeeIcon,
  User,
  Award,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

/* ================= ENUM OPTIONS ================= */

const INDUSTRIES = [
  "IT",
  "HEALTHCARE",
  "EDUCATION",
  "REAL_ESTATE",
  "HOSPITALITY",
  "RETAIL",
  "E_COMMERCE",
  "LEGAL",
  "CONSULTING",
  "MANUFACTURING",
  "TRANSPORTATION",
  "LOGISTICS",
  "MEDIA",
  "ENTERTAINMENT",
  "PUBLIC_SECTOR",
  "NON_PROFIT",
  "ENGINEERING",
  "BIOTECH",
  "PHARMACEUTICAL",
  "AGRICULTURE",
  "ENERGY",
  "TELECOMMUNICATION",
  "SECURITY",
  "CYBERSECURITY",
  "GAMING",
  "SPORTS",
  "AUTOMOTIVE",
  "AEROSPACE",
];

const EXPERIENCES = [
  { label: "Beginner (0–1 years)", value: "BEGINNER" },
  { label: "Intermediate (1–3 years)", value: "INTERMEDIATE" },
  { label: "Expert (3+ years)", value: "EXPERT" },
];

export default function FreelancerProfile() {
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  const [form, setForm] = useState({
    industry: "",
    experience: "",
    education: "",
    bio: "",
    ratePerHour: "",
    DOB: "",
    contact: "",
    city: "",
    state: "",
    pincode: "",
  });

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    setLoading(true);
    api
      .get("/freelancer-profile")
      .then((res) => {
        const p = res.data.profile;
        setForm({
          industry: p.industry,
          experience: p.experience,
          education: p.education,
          bio: p.bio,
          ratePerHour: p.ratePerHour.toString(),
          DOB: p.DOB.split("T")[0],
          contact: p.contact,
          city: p.city,
          state: p.state,
          pincode: p.pincode.toString(),
        });
        setSkills(p.skills || []);
        setLanguages(p.languages || []);
        setResumeUrl(p.resume || null);
      })
      .catch(() => {
        // profile not created yet — allowed
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile && !resumeUrl) {
      toast.error("Resume is required");
      return;
    }
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("skills", JSON.stringify(skills));
    fd.append("languages", JSON.stringify(languages));
    if (resumeFile) fd.append("resume", resumeFile);

    try {
      await api.post("/freelancer-profile", fd);
      toast.success("Profile saved successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Professional Profile
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete your profile to showcase your skills and attract potential
            clients
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            {/* Card Header with accent */}
            <div className="h-1 bg-linear-to-r from-blue-600 via-blue-500 to-blue-600"></div>

            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-50">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Freelancer Profile
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Fill in your professional details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Section 1: Professional Details */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Professional Details
                  </h3>
                </div>

                {/* Resume Upload */}
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">
                    Resume (PDF)
                  </Label>

                  {/* Show only when no resume is uploaded */}
                  {!resumeUrl && !resumeFile && (
                    <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors bg-gray-50">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setResumeFile(f);
                        }}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="cursor-pointer flex flex-col items-center gap-3"
                      >
                        <div className="p-3 rounded-full bg-blue-50">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">
                            Click to upload resume
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            PDF format recommended • Max 5MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2"
                        >
                          Choose File
                        </Button>
                      </label>
                    </div>
                  )}

                  {/* Show when resume exists (either uploaded now or from server) */}
                  {(resumeFile || resumeUrl) && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="p-2 rounded-lg bg-blue-50">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 font-medium">
                            {resumeFile
                              ? resumeFile.name
                              : "Current Resume.pdf"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {resumeFile ? "New upload" : "Previously uploaded"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Preview
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden flex flex-col">
                              <DialogHeader className="px-6 py-4 border-b">
                                <DialogTitle>Resume Preview</DialogTitle>
                              </DialogHeader>
                              <iframe
                                src={`/api/resume/preview?url=${encodeURIComponent(
                                  resumeUrl || URL.createObjectURL(resumeFile!)
                                )}`}
                                className="w-full h-full"
                                title="Resume Preview"
                              />
                            </DialogContent>
                          </Dialog>

                          <Button
                            type="button"
                            variant="outline"
                            className="border-red-300 hover:border-red-400 hover:bg-red-50 text-red-600"
                            onClick={() => {
                              setResumeFile(null);
                              setResumeUrl(null);
                            }}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </Button>
                        </div>
                      </div>

                      {/* Option to replace resume */}
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors bg-gray-50/50">
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setResumeFile(f);
                          }}
                          className="hidden"
                          id="replace-resume-upload"
                        />
                        <label
                          htmlFor="replace-resume-upload"
                          className="cursor-pointer flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                          </svg>
                          Replace resume
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Industry & Experience Grid */}
                <div className="grid md:grid-cols-2 gap-5">
                  {/* Industry */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Industry
                    </Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select
                        value={form.industry}
                        onChange={(e) =>
                          setForm({ ...form, industry: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
                        required
                      >
                        <option value="" disabled>
                          Select your industry
                        </option>
                        {INDUSTRIES.map((i) => (
                          <option key={i} value={i} className="py-2">
                            {i.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Experience Level
                    </Label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select
                        value={form.experience}
                        onChange={(e) =>
                          setForm({ ...form, experience: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
                        required
                      >
                        <option value="" disabled>
                          Select experience level
                        </option>
                        {EXPERIENCES.map((e) => (
                          <option key={e.value} value={e.value}>
                            {e.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    Education
                  </Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <Input
                      value={form.education}
                      onChange={(e) =>
                        setForm({ ...form, education: e.target.value })
                      }
                      className="pl-10 py-2.5 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g., B.Tech Computer Science"
                      required
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Professional Bio
                  </Label>
                  <Textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="min-h-30 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                    placeholder="Describe your professional background, expertise, and what makes you unique..."
                    required
                  />
                </div>
              </div>

              {/* Section 2: Skills & Languages */}
              <div className="space-y-5 pt-5 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Skills & Languages
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {/* Skills Input */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Skills</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {skills.map((skill, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => {
                              const newSkills = [...skills];
                              newSkills.splice(index, 1);
                              setSkills(newSkills);
                            }}
                            className="ml-1 text-blue-700 hover:text-blue-900 focus:outline-none"
                            aria-label={`Remove ${skill}`}
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    <Input
                      type="text"
                      placeholder="Type a skill and press Enter..."
                      className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const input = e.currentTarget;
                          const value = input.value.trim();
                          if (value && !skills.includes(value)) {
                            setSkills([...skills, value]);
                            input.value = "";
                          }
                        }
                      }}
                    />
                  </div>

                  {/* Languages Input */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Languages
                    </Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {languages.map((language, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium"
                        >
                          {language}
                          <button
                            type="button"
                            onClick={() => {
                              const newLanguages = [...languages];
                              newLanguages.splice(index, 1);
                              setLanguages(newLanguages);
                            }}
                            className="ml-1 text-blue-700 hover:text-blue-900 focus:outline-none"
                            aria-label={`Remove ${language}`}
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    <Input
                      type="text"
                      placeholder="Type a language and press Enter..."
                      className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const input = e.currentTarget;
                          const value = input.value.trim();
                          if (value && !languages.includes(value)) {
                            setLanguages([...languages, value]);
                            input.value = "";
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              {/* Section 3: Location & Contact */}
              <div className="space-y-5 pt-5 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Location & Contact
                  </h3>
                </div>

                {/* Location Grid */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="City"
                        value={form.city}
                        onChange={(e) =>
                          setForm({ ...form, city: e.target.value })
                        }
                        className="pl-10 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700">State</Label>
                    <Input
                      placeholder="State"
                      value={form.state}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                      className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700">Pincode</Label>
                    <Input
                      type="number"
                      placeholder="Pincode"
                      value={form.pincode}
                      onChange={(e) =>
                        setForm({ ...form, pincode: e.target.value })
                      }
                      className="border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* DOB & Contact Grid */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Date of Birth
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        value={form.DOB}
                        onChange={(e) =>
                          setForm({ ...form, DOB: e.target.value })
                        }
                        className="pl-10 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      Contact Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="+91 98765 43210"
                        value={form.contact}
                        onChange={(e) =>
                          setForm({ ...form, contact: e.target.value })
                        }
                        className="pl-10 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Rate */}
              <div className="space-y-5 pt-5 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <IndianRupeeIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Hourly Rate
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Rate per hour (USD)
                  </Label>
                  <div className="relative max-w-xs">
                    <IndianRupeeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="Enter your hourly rate"
                      value={form.ratePerHour}
                      onChange={(e) =>
                        setForm({ ...form, ratePerHour: e.target.value })
                      }
                      className="pl-10 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      /hour
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Competitive rates help attract clients while ensuring fair
                    compensation
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-6 pb-8 border-t border-gray-200">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Saving Profile...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Professional Profile
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>

        {/* Helper text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your profile information helps clients find and hire you. Keep it
            updated!
          </p>
        </div>
      </div>
    </div>
  );
}
