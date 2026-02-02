"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Briefcase,
  Bookmark,
  MessageSquare,
  PlusCircle,
  FileText,
  LogOut,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
  link?: string;
};

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Application Submitted",
      message:
        "Your application for 'Frontend Developer' has been submitted successfully.",
      type: "success",
      timestamp: "2 hours ago",
      read: false,
      link: "/my-applications",
    },
    {
      id: "2",
      title: "New Job Match",
      message:
        "A new job matching your skills has been posted: 'React Developer'",
      type: "info",
      timestamp: "1 day ago",
      read: false,
      link: "/feed",
    },
  ]);
  const [open, setOpen] = useState(false);

  const role = session?.user?.role as "FREELANCER" | "CLIENT" | undefined;

  // Filter notifications based on user role
  const filteredNotifications =
    role === "CLIENT"
      ? notifications.filter(
          (n) => n.type !== "success" && n.type !== "warning"
        ) // Filter client-specific notifications
      : notifications; // Show all for freelancer

  const unreadCount = filteredNotifications.filter((n) => !n.read).length;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "border-l-green-500";
      case "warning":
        return "border-l-amber-500";
      case "error":
        return "border-l-red-500";
      default:
        return "border-l-blue-500";
    }
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link
          href={session ? (role === "FREELANCER" ? "/feed" : "/feed") : "/"}
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
                  <Link
                    href="/my-applications"
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      pathname === "/my-applications"
                        ? "text-blue-600 font-medium"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    <FileText size={18} />
                    My Applications
                  </Link>
                </>
              )}

              {/* Changed from /client-jobs to /my-jobs */}
              {role === "CLIENT" && (
                <Link
                  href="/my-jobs"
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    pathname === "/my-jobs"
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

              {/* Notification Dialog */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Bell size={20} />
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Mark all as read
                        </Button>
                      )}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="overflow-y-auto max-h-[60vh]">
                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border ${getNotificationColor(
                              notification.type
                            )} border-l-4 ${
                              notification.read ? "bg-white" : "bg-blue-50"
                            } hover:bg-gray-50 transition-colors cursor-pointer`}
                            onClick={() => {
                              if (!notification.read) {
                                markAsRead(notification.id);
                              }
                              if (notification.link) {
                                window.location.href = notification.link;
                              }
                              setOpen(false);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm text-gray-900">
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {notification.timestamp}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {unreadCount} unread • {filteredNotifications.length}{" "}
                        total
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen(false)}
                        className="text-xs"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            <div className="flex items-center gap-4">
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

              {/* Sign Out Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-700 hover:text-red-600 hover:bg-red-50"
                title="Sign Out"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}