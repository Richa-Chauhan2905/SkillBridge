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
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2563EB]">SkillBridge</h1>
          <p className="text-gray-600 mt-2">Professional Freelance Platform</p>
        </div>

        <Card className="w-full shadow-sm border-gray-200">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Create your account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Join SkillBridge as a client or freelancer
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* ROLE SELECTION */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole("CLIENT")}
                className={`border rounded-lg p-3 text-sm transition-all duration-200 ${
                  role === "CLIENT"
                    ? "border-[#2563EB] bg-blue-50"
                    : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <p className="font-medium text-gray-900">Client</p>
                <p className="text-xs text-gray-600 mt-1">
                  Hire freelancers & post jobs
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole("FREELANCER")}
                className={`border rounded-lg p-3 text-sm transition-all duration-200 ${
                  role === "FREELANCER"
                    ? "border-[#2563EB] bg-blue-50"
                    : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <p className="font-medium text-gray-900">Freelancer</p>
                <p className="text-xs text-gray-600 mt-1">
                  Find work & apply to jobs
                </p>
              </button>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">
                  Minimum 8 characters with uppercase, lowercase, number & symbol
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
              onClick={() => signIn("google", { callbackUrl: "/feed" })}
            >
              Continue with Google
            </Button>

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/signin")}
                className="text-[#2563EB] font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}