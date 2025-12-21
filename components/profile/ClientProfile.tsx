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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Building2,
  Globe,
  Linkedin,
  Briefcase,
  User,
} from "lucide-react";
import { toast } from "sonner";

/* ================= INDUSTRY OPTIONS ================= */

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

export default function ClientProfile() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    industry: "",
    companyName: "",
    companyWebsite: "",
    linkedInProfile: "",
  });

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    setLoading(true);
    api
      .get("/client-profile")
      .then((res) => {
        const p = res.data.profile;
        setForm({
          industry: p.industry || "",
          companyName: p.companyName || "",
          companyWebsite: p.companyWebsite || "",
          linkedInProfile: p.linkedInProfile || "",
        });
      })
      .catch(() => {
        // profile not created yet — allowed
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.industry) {
      toast.error("Industry is required");
      return;
    }

    setLoading(true);
    try {
      await api.post("/client-profile", form);
      toast.success("Profile saved successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1EA]/50 via-white to-[#F5F1EA]/50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Client Profile
          </h1>
          <p className="text-gray-600">
            Set up your company profile to hire the right freelancers
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-2xl rounded-2xl overflow-hidden relative">
            {/* Accent bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#C2410C] via-amber-600 to-[#C2410C]" />

            <CardHeader className="pt-8 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#C2410C]/10 to-amber-100">
                  <User className="h-6 w-6 text-[#C2410C]" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    Company Information
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Tell freelancers about your organization
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Industry */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Industry <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={form.industry}
                    onChange={(e) =>
                      setForm({ ...form, industry: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20"
                    required
                  >
                    <option value="" disabled>
                      Select industry
                    </option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>
                        {i.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Company Name
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Your company or brand name"
                    value={form.companyName}
                    onChange={(e) =>
                      setForm({ ...form, companyName: e.target.value })
                    }
                    className="pl-10 border-gray-300 rounded-xl focus:border-[#C2410C] focus:ring-[#C2410C]/20"
                  />
                </div>
              </div>

              {/* Company Website */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Company Website
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="https://example.com"
                    value={form.companyWebsite}
                    onChange={(e) =>
                      setForm({ ...form, companyWebsite: e.target.value })
                    }
                    className="pl-10 border-gray-300 rounded-xl focus:border-[#C2410C] focus:ring-[#C2410C]/20"
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  LinkedIn Profile
                </Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="LinkedIn company page"
                    value={form.linkedInProfile}
                    onChange={(e) =>
                      setForm({ ...form, linkedInProfile: e.target.value })
                    }
                    className="pl-10 border-gray-300 rounded-xl focus:border-[#C2410C] focus:ring-[#C2410C]/20"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-6 pb-8 border-t border-gray-200">
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-gradient-to-r from-[#C2410C] to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#C2410C]/20 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Saving Profile...
                  </>
                ) : (
                  "Save Client Profile"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
