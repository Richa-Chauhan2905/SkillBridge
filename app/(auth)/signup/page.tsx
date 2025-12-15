"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
  Briefcase,
  Users,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn } from "next-auth/react";

// Define proper role types based on your Prisma schema
type UserRole = "CLIENT" | "FREELANCER" | "";

export default function SignUpPage() {
  const [role, setRole] = useState<UserRole>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error("Please select a role");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("/api/signup", {
        role,
        firstName,
        lastName,
        email: emailAddress,
        password,
      });

      if (response.status === 201) {
        toast.success("Account created successfully!");

        // Sign in the user automatically after signup
        const result = await signIn("credentials", {
          redirect: false,
          email: emailAddress,
          password,
        });

        if (result?.error) {
          toast.error(
            "Signup successful, but automatic login failed. Please log in manually."
          );
          router.push("/signin");
        } else {
          // Redirect based on role after successful signup
          if (role === "FREELANCER") {
            router.push("/freelancer-profile");
          } else if (role === "CLIENT") {
            router.push("/client-profile");
          } else {
            router.push("/dashboard");
          }
        }
      }
    } catch (error: unknown) {
      const errorMessage = error as AxiosError<{ error: string }>;
      const message =
        errorMessage.response?.data?.error ||
        "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (selectedRole: "CLIENT" | "FREELANCER") => {
    setRole(selectedRole);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      {/* Professional Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(100,100,100,0.03)_25%,transparent_25%),linear-gradient(225deg,rgba(100,100,100,0.03)_25%,transparent_25%),linear-gradient(45deg,rgba(100,100,100,0.03)_25%,transparent_25%),linear-gradient(315deg,rgba(100,100,100,0.03)_25%,transparent_25%)] bg-size-[20px_20px]"></div>

      {/* Subtle Brand Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-30"></div>

      <Card className="w-full max-w-md border border-gray-200 shadow-lg rounded-xl bg-white relative overflow-hidden">
        {/* Professional Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-amber-500 via-purple-600 to-rose-600"></div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-gray-300 rounded-tl-lg"></div>
        <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-gray-300 rounded-tr-lg"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-gray-300 rounded-bl-lg"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-gray-300 rounded-br-lg"></div>

        <CardHeader className="text-center space-y-3 pb-2 pt-6">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-linear-to-br from-amber-100 to-purple-100 rounded-full border border-gray-200">
              <Briefcase className="h-6 w-6 text-gray-700" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-800 tracking-tight">
            Create Your SkillBridge Account
          </CardTitle>
          <CardDescription className="text-gray-500 text-sm">
            Join professionals in finding and hiring exceptional talent
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} autoComplete="off">
          <CardContent className="space-y-5 px-6 pt-2">
            {error && (
              <Alert
                variant="destructive"
                className="mb-4 bg-rose-50 border-rose-200"
              >
                <AlertDescription className="text-rose-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Professional Role Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 text-sm font-medium">
                  I am joining as:
                </Label>
                <span className="text-xs text-gray-500">Select one</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("FREELANCER")}
                  className={`p-4 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                    role === "FREELANCER"
                      ? "border-amber-500 bg-amber-50 shadow-sm ring-1 ring-amber-500/20"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      role === "FREELANCER"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <User className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      role === "FREELANCER" ? "text-amber-700" : "text-gray-700"
                    }`}
                  >
                    Freelancer
                  </span>
                  <span className="text-xs text-gray-500">
                    Find opportunities
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("CLIENT")}
                  className={`p-4 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                    role === "CLIENT"
                      ? "border-purple-600 bg-purple-50 shadow-sm ring-1 ring-purple-600/20"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      role === "CLIENT"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      role === "CLIENT" ? "text-purple-700" : "text-gray-700"
                    }`}
                  >
                    Client
                  </span>
                  <span className="text-xs text-gray-500">Hire talent</span>
                </button>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-gray-700 text-sm font-medium"
                >
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    minLength={2}
                    className="pl-9 h-10 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-gray-700 text-sm font-medium"
                >
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    minLength={2}
                    className="pl-9 h-10 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:border-purple-600 focus:ring-purple-600/20 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-gray-700 text-sm font-medium"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="professional@example.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  required
                  className="pl-9 h-10 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:border-rose-600 focus:ring-rose-600/20 bg-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-gray-700 text-sm font-medium"
                >
                  Password
                </Label>
                <span className="text-xs text-gray-500">
                  Minimum 8 characters
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-9 h-10 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:border-gray-700 focus:ring-gray-700/20 bg-white"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 px-6 pb-8">
            <Button
              type="submit"
              className="w-full h-11 bg-linear-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-gray-950 text-white font-medium shadow-sm hover:shadow transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Professional Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {/* Terms and Conditions */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                By creating an account, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-gray-700 hover:text-amber-600 underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-gray-700 hover:text-purple-600 underline"
                >
                  Privacy Policy
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-medium text-gray-800 hover:text-rose-600 hover:underline transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-gray-600">
                  Secure & Encrypted
                </span>
              </div>
              <div className="h-3 w-px bg-gray-300"></div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-purple-600" />
                <span className="text-xs text-gray-600">Trusted Platform</span>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}