"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Briefcase,
  Bookmark,
  MessageSquare,
  PlusCircle,
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const role = session?.user?.role as "FREELANCER" | "CLIENT" | undefined;

  return (
    <nav className="w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link
          href={session ? (role === "FREELANCER" ? "/freelancer-feed" : "/client-feed") : "/"}
          className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          SkillBridge
        </Link>

        {!session ? (
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            >
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-8">
              
              {role === "CLIENT" && (
                <>
                  {/* <Link
                    href="/client-feed"
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      pathname === "/client-feed"
                        ? "text-blue-600 font-medium"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    <Search size={18} />
                    Find Freelancers
                  </Link> */}
                  
                  <Link
                    href="/post-job"
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <PlusCircle size={18} />
                    Post Job
                  </Link>
                </>
              )}

              {role === "FREELANCER" && (
                <>
                  <Link
                    href="/freelancer-feed"
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      pathname === "/freelancer-feed"
                        ? "text-blue-600 font-medium"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    <Briefcase size={18} />
                    Job Feed
                  </Link>
                  
                  <Link
                    href="/saved-jobs"
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      pathname === "/saved-jobs"
                        ? "text-blue-600 font-medium"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    <Bookmark size={18} />
                    Saved Jobs
                  </Link>
                </>
              )}

              {role === "CLIENT" && (
                <Link
                  href="/client-jobs"
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    pathname === "/client-jobs"
                      ? "text-blue-600 font-medium"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  <Briefcase size={18} />
                  My Jobs
                </Link>
              )}

              <Link
                href="/messages"
                className={`flex items-center gap-2 text-sm transition-colors ${
                  pathname === "/messages"
                    ? "text-blue-600 font-medium"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                <MessageSquare size={18} />
                Messages
              </Link>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            <Link
              href="/profile"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.user?.firstName} {session.user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {role?.toLowerCase()}
                </p>
              </div>
              <Avatar className="h-9 w-9 border-2 border-blue-100">
                <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                  {session.user?.firstName?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}