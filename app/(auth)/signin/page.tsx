"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function SigninPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/feed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
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
              Welcome back
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to continue to SkillBridge
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:border-blue-500"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="text-sm text-[#2563EB] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              >
                {loading ? "Signing in..." : "Sign In"}
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
              onClick={() => signIn("google", { callbackUrl })}
            >
              Continue with Google
            </Button>

            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{" "}
              <button
                onClick={() => router.push("/signup")}
                className="text-[#2563EB] font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}