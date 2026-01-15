"use client";

import { useSession } from "next-auth/react";
import ClientFeed from "@/components/feed/ClientFeed";
import FreelancerFeed from "@/components/feed/FreelancerFeed"; // Make sure this component exists
import { Loader2, ShieldAlert, UserX, Search, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function FeedPage() {
  const { data: session, status } = useSession();
  const role = session?.user?.role as "FREELANCER" | "CLIENT" | undefined;

  /* ================= LOADING ================= */
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-sm bg-white">
          <CardContent className="p-8 flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-700">Loading your feed...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ================= NOT LOGGED IN ================= */
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-sm bg-white">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <ShieldAlert className="h-12 w-12 text-red-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-700 mb-4">
              Please sign in to access the marketplace.
            </p>
            <Link
              href="/signin"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ================= ROLE SWITCH ================= */
  if (role === "CLIENT") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Client Feed Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Find Freelancers</h1>
                <p className="text-gray-600">
                  Browse skilled professionals for your projects
                </p>
              </div>
            </div>
          </div>
          <ClientFeed />
        </div>
      </div>
    );
  }

  if (role === "FREELANCER") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Freelancer Feed Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Job Opportunities</h1>
                <p className="text-gray-600">
                  Find projects that match your skills and expertise
                </p>
              </div>
            </div>
          </div>
          <FreelancerFeed />
        </div>
      </div>
    );
  }

  /* ================= INVALID ROLE ================= */
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-sm bg-white">
        <CardContent className="p-8 flex flex-col items-center text-center">
          <UserX className="h-12 w-12 text-red-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Role Configuration Required
          </h2>
          <p className="text-gray-700 mb-4">
            Your account role is not configured. Please complete your profile setup.
          </p>
          <div className="flex gap-3">
            <Link
              href="/profile"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Complete Profile
            </Link>
            <Link
              href="/"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}