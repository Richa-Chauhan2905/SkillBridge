"use client";

import { useSession } from "next-auth/react";
import FreelancerFeed from "@/components/feed/FreelancerFeed";
import ClientFeed from "@/components/feed/ClientFeed";
import { Loader2, ShieldAlert, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function FeedPage() {
  const { data: session, status } = useSession();
  const role = session?.user?.role as "FREELANCER" | "CLIENT" | undefined;

  /* ---------- LOADING ---------- */
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C2410C]" />
      </div>
    );
  }

  /* ---------- NOT LOGGED IN ---------- */
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold">Unauthorized</h2>
            <p className="text-sm text-gray-600 mt-1">
              Please sign in to view the feed
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------- ROLE SWITCH ---------- */
  if (role === "FREELANCER") {
    return <FreelancerFeed />;
  }

  if (role === "CLIENT") {
    return <ClientFeed />;
  }

  /* ---------- FALLBACK ---------- */
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <User className="h-10 w-10 text-gray-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold">Invalid Role</h2>
          <p className="text-sm text-gray-600">
            Your account role is not configured correctly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
