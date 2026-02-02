"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, X, Plus } from "lucide-react";

type Job = {
  id: string;
  title: string;
  description: string;
  payPerHour?: number | null;
  mandatorySkills: string[];
  niceToHaveSkills: string[];
  tools: string[];
  preferredLocation?: string | null;
  preferredEducation?: string | null;
  clientLocation?: string | null;
  status: "OPEN" | "CLOSED" | "FILLED";
  clientId: string;
};

type SkillInputProps = {
  label: string;
  skills: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  badgeColor?: string;
};

function SkillInput({ label, skills, onChange, placeholder, badgeColor = "blue" }: SkillInputProps) {
  const [input, setInput] = useState("");

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
      setInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const colorClasses = {
    blue: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300",
    purple: "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300",
    green: "bg-green-100 text-green-800 hover:bg-green-200 border-green-300",
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder || "Add a skill and press Enter"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" variant="outline" onClick={addSkill} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 min-h-10">
        {skills.map((skill, index) => (
          <Badge
            key={index}
            variant="secondary"
            className={`${colorClasses[badgeColor as keyof typeof colorClasses] || colorClasses.blue} gap-2`}
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="hover:text-current"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default function EditJobPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [form, setForm] = useState<Partial<Job>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!jobId) return;

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/jobs/${jobId}`);
        const data = await res.json();

        if (!res.ok || !data.success) throw new Error(data.error || "Failed to load job");

        const job: Job = data.job;

        // Frontend guard
        if (session?.user?.role !== "CLIENT") throw new Error("Only clients can edit jobs");
        if (session?.user?.id !== job.clientId) throw new Error("You can edit only your own job");

        setForm({
          title: job.title,
          description: job.description,
          payPerHour: job.payPerHour ?? undefined,
          preferredLocation: job.preferredLocation ?? "",
          preferredEducation: job.preferredEducation ?? "",
          clientLocation: job.clientLocation ?? "",
          status: job.status,
          mandatorySkills: job.mandatorySkills || [],
          niceToHaveSkills: job.niceToHaveSkills || [],
          tools: job.tools || [],
        });
      } catch (e: any) {
        setError(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [jobId, session?.user?.id, session?.user?.role]);

  const update = (key: keyof Job, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const onSave = async () => {
    try {
      setSaving(true);
      setError("");

      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // make sure arrays stay arrays
          mandatorySkills: form.mandatorySkills ?? [],
          niceToHaveSkills: form.niceToHaveSkills ?? [],
          tools: form.tools ?? [],
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update job");
      }

      router.push(`/jobs/${jobId}`);
    } catch (e: any) {
      setError(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <X className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Access Denied</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 pl-0 hover:pl-2 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Job
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Job Posting</h1>
          <p className="text-gray-600 mt-2">Update your job details and requirements</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-medium">
              Job Title *
            </Label>
            <Input
              id="title"
              value={form.title || ""}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g., Senior React Developer"
              className="text-lg"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              value={form.description || ""}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the job responsibilities, requirements, and expectations..."
              rows={8}
              className="resize-y min-h-37.5"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="payPerHour" className="text-sm font-medium">
                Pay per hour (₹)
              </Label>
              <Input
                id="payPerHour"
                type="number"
                value={form.payPerHour ?? ""}
                onChange={(e) => update("payPerHour", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="e.g., 500"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="status" className="text-sm font-medium">
                Job Status *
              </Label>
              <Select
                value={form.status || "OPEN"}
                onValueChange={(value: "OPEN" | "CLOSED" | "FILLED") => update("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="FILLED">Filled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="clientLocation" className="text-sm font-medium">
                Client Location
              </Label>
              <Input
                id="clientLocation"
                value={form.clientLocation || ""}
                onChange={(e) => update("clientLocation", e.target.value)}
                placeholder="e.g., Bangalore, Karnataka"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Skills & Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SkillInput
              label="Required Skills *"
              skills={form.mandatorySkills || []}
              onChange={(skills) => update("mandatorySkills", skills)}
              placeholder="e.g., React, TypeScript, Node.js"
              badgeColor="blue"
            />

            <SkillInput
              label="Nice-to-have Skills"
              skills={form.niceToHaveSkills || []}
              onChange={(skills) => update("niceToHaveSkills", skills)}
              placeholder="e.g., AWS, Docker, MongoDB"
              badgeColor="purple"
            />

            <SkillInput
              label="Tools & Technologies"
              skills={form.tools || []}
              onChange={(skills) => update("tools", skills)}
              placeholder="e.g., Git, VS Code, Figma"
              badgeColor="green"
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="preferredLocation" className="text-sm font-medium">
                  Preferred Location
                </Label>
                <Input
                  id="preferredLocation"
                  value={form.preferredLocation || ""}
                  onChange={(e) => update("preferredLocation", e.target.value)}
                  placeholder="e.g., Remote, Hybrid, On-site"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="preferredEducation" className="text-sm font-medium">
                  Preferred Education
                </Label>
                <Input
                  id="preferredEducation"
                  value={form.preferredEducation || ""}
                  onChange={(e) => update("preferredEducation", e.target.value)}
                  placeholder="e.g., B.Tech, MCA, Any Graduate"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Save className="h-6 w-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Ready to Update?</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Review all changes before saving. All fields marked with * are required.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={saving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={onSave}
                    disabled={saving}
                    className="flex-1 gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <X className="h-5 w-5" />
              <div>
                <p className="font-medium">{error}</p>
                <p className="text-sm text-red-600 mt-1">Please check your input and try again.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}