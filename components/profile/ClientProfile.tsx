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
  Save,
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
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Client Profile
          </h1>
          <p className="text-gray-600">
            Set up your company profile to hire the right freelancers
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            {/* Accent bar */}
            <div className="h-1 bg-linear-to-r from-blue-600 via-blue-500 to-blue-600" />

            <CardHeader className="pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Company Information
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Tell freelancers about your organization
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
                    className="pl-10 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    className="pl-10 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    className="pl-10 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-4 pb-6 border-t border-gray-200">
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
                    Save Client Profile
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Your profile helps freelancers understand your business needs better
          </p>
        </div>
      </div>
    </div>
  );
}