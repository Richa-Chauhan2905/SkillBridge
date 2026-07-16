"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { useSocket } from "@/src/components/providers/socket-provider";
import {
  Briefcase,
  Bookmark,
  PlusCircle,
  FileText,
  LogOut,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
  link: string;
};

type ApiNotification = {
  id: string;
  title?: string | null;
  description?: string | null;
  type?: string | null;
  createdAt?: string | Date | null;
  isNew?: boolean | null;
  link?: string | null;
};

const formatTimestamp = (value?: string | Date | null) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const mapNotificationType = (type?: string | null): Notification["type"] => {
  switch (type) {
    case "JOB":
      return "success";
    case "PAYMENT":
      return "warning";
    case "MESSAGE":
      return "info";
    case "SYSTEM":
      return "error";
    default:
      return "info";
  }
};

const isAppPath = (link?: string | null) =>
  Boolean(
    link &&
      link.startsWith("/") &&
      !link.startsWith("//") &&
      !link.startsWith("/\\"),
  );

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { socket } = useSocket();

  const role = session?.user?.role as "FREELANCER" | "CLIENT" | undefined;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!session) {
      return [];
    }

    const response = await fetch("/api/notifications", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok || !data.success) {
      return [];
    }

    return data.notifications
      .filter((notification: ApiNotification) => isAppPath(notification.link))
      .map((notification: ApiNotification) => ({
        id: notification.id,
        title: notification.title || "Notification",
        message: notification.description || "",
        type: mapNotificationType(notification.type),
        timestamp: formatTimestamp(notification.createdAt),
        read: !notification.isNew,
        link: notification.link as string,
      }));
  }, [session]);

  useEffect(() => {
    let ignore = false;

    const loadNotifications = async () => {
      try {
        const nextNotifications = await fetchNotifications();
        if (!ignore) {
          setNotifications(nextNotifications);
        }
      } catch {
        if (!ignore) {
          setNotifications([]);
        }
      }
    };

    loadNotifications();

    return () => {
      ignore = true;
    };
  }, [fetchNotifications]);

  const fetchUnreadMessages = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/chats");
      const data = await res.json();
      if (res.ok && data.success) {
        const count = data.chats.reduce((acc: number, chat: any) => acc + (chat.unreadCount || 0), 0);
        setUnreadMessages(count);
      }
    } catch (err) {
      console.error("Error fetching unread messages:", err);
    }
  }, [session]);

  useEffect(() => {
    fetchUnreadMessages();
  }, [fetchUnreadMessages]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message_notification", () => {
      fetchUnreadMessages();
    });

    socket.on("receive_message", () => {
      fetchUnreadMessages();
    });

    return () => {
      socket.off("message_notification");
      socket.off("receive_message");
    };
  }, [socket, fetchUnreadMessages]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const markAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
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
          href={session ? "/feed" : "/"}
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
                <Link
                  href="/post-job"
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <PlusCircle size={18} />
                  Post Job
                </Link>
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
                className={`relative p-2 rounded-md hover:bg-blue-50 transition-colors ${
                  pathname === "/messages"
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                title="Messages"
              >
                <MessageSquare size={18} />
                {unreadMessages > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-blue-600 text-white text-xs">
                    {unreadMessages}
                  </Badge>
                )}
              </Link>

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
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border ${getNotificationColor(
                              notification.type,
                            )} border-l-4 ${
                              notification.read ? "bg-white" : "bg-blue-50"
                            } hover:bg-gray-50 transition-colors cursor-pointer`}
                            onClick={() => {
                              if (!notification.read) {
                                markAsRead(notification.id);
                              }
                              setOpen(false);
                              router.push(notification.link);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="font-medium text-sm text-gray-900">
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                {notification.timestamp && (
                                  <p className="text-xs text-gray-400 mt-2">
                                    {notification.timestamp}
                                  </p>
                                )}
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
                        {unreadCount} unread | {notifications.length} total
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
