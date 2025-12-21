"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

type Role = "CLIENT" | "FREELANCER";

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please select a role");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Auto sign-in after signup
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/feed",
      });
    } catch (err) {
      setError("Internal error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-[#2D2A26]">
            Create your account
          </CardTitle>
          <CardDescription className="text-[#6B7280]">
            Join SkillBridge as a client or freelancer
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* ROLE SELECTION */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("CLIENT")}
              className={`border rounded-lg p-3 text-sm transition ${
                role === "CLIENT"
                  ? "border-[#C05621] bg-[#FED7AA]"
                  : "border-gray-200 hover:border-[#C05621]"
              }`}
            >
              <p className="font-medium">Client</p>
              <p className="text-xs text-gray-600">
                Hire freelancers & post jobs
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRole("FREELANCER")}
              className={`border rounded-lg p-3 text-sm transition ${
                role === "FREELANCER"
                  ? "border-[#C05621] bg-[#FED7AA]"
                  : "border-gray-200 hover:border-[#C05621]"
              }`}
            >
              <p className="font-medium">Freelancer</p>
              <p className="text-xs text-gray-600">Find work & apply to jobs</p>
            </button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Min 8 chars, uppercase, lowercase, number & symbol
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C05621] hover:bg-[#9C4221]"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <Separator className="my-6" />

          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/feed" })}
          >
            Continue with Google
          </Button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/signin")}
              className="text-[#C05621] font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
