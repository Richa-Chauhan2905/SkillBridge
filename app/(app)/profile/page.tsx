"use client";

import { useSession } from "next-auth/react";
import FreelancerProfile from "@/components/profile/FreelancerProfile";
import ClientProfile from "@/components/profile/ClientProfile"; // adjust name if needed
import { Loader2, ShieldAlert, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const role = session?.user?.role as "FREELANCER" | "CLIENT" | undefined;

  /* ================= LOADING ================= */
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F5F1EA] flex items-center justify-center">
        <Card className="w-full max-w-sm bg-[#EFE8DC]">
          <CardContent className="p-8 flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#C2410C] mb-4" />
            <p className="text-gray-700">Loading your profile…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ================= NOT LOGGED IN ================= */
  if (!session) {
    return (
      <div className="min-h-screen bg-[#F5F1EA] flex items-center justify-center">
        <Card className="w-full max-w-sm bg-[#EFE8DC]">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <ShieldAlert className="h-12 w-12 text-red-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Unauthorized Access
            </h2>
            <p className="text-gray-700 mb-4">
              Please sign in to view your profile.
            </p>
            <Link
              href="/signin"
              className="px-4 py-2 bg-[#C2410C] text-white rounded-md"
            >
              Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ================= ROLE SWITCH ================= */
  if (role === "FREELANCER") {
    return <FreelancerProfile />;
  }

  if (role === "CLIENT") {
    return <ClientProfile />;
  }

  /* ================= INVALID ROLE ================= */
  return (
    <div className="min-h-screen bg-[#F5F1EA] flex items-center justify-center">
      <Card className="w-full max-w-sm bg-[#EFE8DC]">
        <CardContent className="p-8 flex flex-col items-center text-center">
          <UserX className="h-12 w-12 text-red-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Invalid Account Role
          </h2>
          <p className="text-gray-700">
            Your account role is not configured correctly.
          </p>
          <p className="text-gray-700 mt-2">
            Please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
