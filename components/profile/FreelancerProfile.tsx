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
} from "lucide-react";
import TagInput from "@/components/TagInput";
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
    <div className="min-h-screen bg-linear-to-br from-[#F5F1EA]/50 via-white to-[#F5F1EA]/50 py-8 px-4">
      <div className="max-w-4xl mx-auto relative">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
            Professional Profile
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete your profile to showcase your skills and attract potential
            clients
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
            {/* Card Header with accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-[#C2410C] via-amber-600 to-[#C2410C]"></div>

            <CardHeader className="pb-6 pt-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-linear-to-br from-[#C2410C]/10 to-amber-100">
                  <User className="h-6 w-6 text-[#C2410C]" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    Freelancer Profile
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Fill in your professional details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Section 1: Professional Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#C2410C]" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Professional Details
                  </h3>
                </div>

                {/* Resume Upload */}
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">
                    Resume (PDF)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#C2410C]/50 transition-colors bg-gray-50/50">
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
                      <div className="p-3 rounded-full bg-[#C2410C]/10">
                        <FileText className="h-6 w-6 text-[#C2410C]" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">
                          {resumeFile
                            ? resumeFile.name
                            : "Click to upload resume"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          PDF format recommended • Max 5MB
                        </p>
                      </div>
                      <Button type="button" variant="outline" className="mt-2">
                        Choose File
                      </Button>
                    </label>
                  </div>

                  {resumeUrl && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-gray-300 hover:border-[#C2410C] hover:bg-[#C2410C]/5"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Preview Current Resume
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden flex flex-col">
                        <DialogHeader className="px-6 py-4 border-b">
                          <DialogTitle>Resume Preview</DialogTitle>
                        </DialogHeader>

                        <iframe
                          src={`/api/resume/preview?url=${encodeURIComponent(
                            resumeUrl
                          )}`}
                          className="w-full h-full"
                          title="Resume Preview"
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {/* Industry & Experience Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Industry */}
                  <div className="space-y-3">
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-colors appearance-none"
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
                  <div className="space-y-3">
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-colors appearance-none"
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
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#C2410C]" />
                    Education
                  </Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                    <Input
                      value={form.education}
                      onChange={(e) =>
                        setForm({ ...form, education: e.target.value })
                      }
                      className="pl-10 py-2.5 border-gray-300 rounded-xl focus:border-[#C2410C] focus:ring-[#C2410C]/20"
                      placeholder="e.g., B.Tech Computer Science"
                      required
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">
                    Professional Bio
                  </Label>
                  <Textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="min-h-30 border-gray-300 rounded-xl focus:border-[#C2410C] focus:ring-[#C2410C]/20 resize-none"
                    placeholder="Describe your professional background, expertise, and what makes you unique..."
                    required
                  />
                </div>
              </div>

              {/* Section 2: Skills & Languages */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#C2410C]/10">
                    <svg
                      className="h-4 w-4 text-[#C2410C]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Skills & Languages
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <TagInput
                    label="Skills"
                    values={skills}
                    setValues={setSkills}
                    placeholder="Add your technical skills..."
                  />
                  <TagInput
                    label="Languages"
                    values={languages}
                    setValues={setLanguages}
                    placeholder="Add languages you speak..."
                  />
                </div>
              </div>

              {/* Section 3: Location & Contact */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#C2410C]" />
                  <h3 className="text-lg font-semibold text-gray-800">
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
                        className="pl-10 border-gray-300 rounded-xl focus:border-[#C2410C] focus:ring-[#C2410C]/20"
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
                      className="border-gray-300 rounded-xl focus:border-[#C2410C] focus:ring-[#C2410C]/20"
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
                      className="border-gray-300 rounded-xl focus:border-[#C2410C] focus:ring-[#C2410C]/20"
                      required
                    />
                  </div>
                </div>

                {/* DOB & Contact Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#C2410C]" />
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
                        className="pl-10 border-gray-300 rounded-xl focus:border-[#C2410C] focus:ring-[#C2410C]/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-700 font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#C2410C]" />
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
                        className="pl-10 border-gray-300 rounded-xl focus:border-[#C2410C] focus:ring-[#C2410C]/20"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Rate */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <IndianRupeeIcon className="h-5 w-5 text-[#C2410C]" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Hourly Rate
                  </h3>
                </div>

                <div className="space-y-3">
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
                      className="pl-10 border-gray-300 rounded-xl focus:border-[#C2410C] focus:ring-[#C2410C]/20"
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

            <CardFooter className="pt-8 pb-10 border-t border-gray-200">
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-linear-to-r from-[#C2410C] to-amber-700 hover:from-[#C2410C]/90 hover:to-amber-700/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#C2410C]/20 transition-all duration-300 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-3 h-5 w-5" />
                    Saving Profile...
                  </>
                ) : (
                  "Save Professional Profile"
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
