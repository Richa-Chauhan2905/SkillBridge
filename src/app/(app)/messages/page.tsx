"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSocket } from "@/src/components/providers/socket-provider";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Separator } from "@/src/components/ui/separator";
import { Badge } from "@/src/components/ui/badge";
import {
  Send,
  Loader2,
  Search,
  MessageSquare,
  ArrowLeft,
  User,
  Shield,
  Circle,
  Check,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "CLIENT" | "FREELANCER" | "USER";
  image?: string | null;
}

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string | Date;
  isSeen: boolean;
}

interface ChatRoom {
  id: string;
  updatedAt: string;
  createdAt: string;
  otherParticipant: UserInfo;
  latestMessage: ChatMessage | null;
  unreadCount: number;
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();

  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [activeChat, setActiveChat] = useState<ChatRoom | null>(null);
  const [messagesList, setMessagesList] = useState<ChatMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeChatIdRef = useRef<string | null>(null);

  const currentUserId = session?.user?.id;

  // Retrieve list of chats
  const fetchChats = useCallback(async (selectChatId?: string) => {
    try {
      const res = await fetch("/api/chats");
      const data = await res.json();
      if (res.ok && data.success) {
        setChats(data.chats);
        
        if (selectChatId) {
          const selected = data.chats.find((c: ChatRoom) => c.id === selectChatId);
          if (selected) {
            setActiveChat(selected);
          }
        }
      } else {
        toast.error("Failed to load conversation list");
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
      toast.error("Could not connect to service");
    } finally {
      setLoadingChats(false);
    }
  }, []);

  // Fetch messages for a specific chat room
  const fetchMessages = useCallback(async (chatId: string) => {
    try {
      setLoadingMessages(true);
      const res = await fetch(`/api/chats/${chatId}/messages`);
      const data = await res.json();
      if (res.ok && data.success) {
        setMessagesList(data.messages);
      } else {
        toast.error(data.message || "Failed to load messages");
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error("Error retrieving conversation history");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Resolve chat initialization via search parameters
  useEffect(() => {
    const initChat = async () => {
      const pChatId = searchParams.get("chatId");
      const pUserId = searchParams.get("userId");

      if (pChatId) {
        activeChatIdRef.current = pChatId;
        await fetchChats(pChatId);
        await fetchMessages(pChatId);
        
        // Notify server we read the messages in this room
        if (socket && currentUserId) {
          socket.emit("join_room", pChatId);
          socket.emit("read_messages", { chatId: pChatId, userId: currentUserId });
        }
      } else if (pUserId) {
        try {
          setLoadingChats(true);
          const res = await fetch("/api/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetUserId: pUserId }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            // Re-route to standard chatId search param to simplify flow
            router.replace(`/messages?chatId=${data.chatId}`);
          } else {
            toast.error(data.message || "Could not start conversation");
            await fetchChats();
          }
        } catch (err) {
          console.error("Error creating chat:", err);
          await fetchChats();
        }
      } else {
        await fetchChats();
      }
    };

    if (session) {
      initChat();
    }
  }, [searchParams, session, socket, currentUserId, router, fetchChats, fetchMessages]);

  // Handle active chat selection shifts
  const selectChat = (chat: ChatRoom) => {
    if (activeChat && socket) {
      socket.emit("leave_room", activeChat.id);
    }
    
    // Clear typing indicator for previous chat room
    setOtherUserTyping(false);
    
    router.push(`/messages?chatId=${chat.id}`);
  };

  // Real-time socket events registration
  useEffect(() => {
    if (!socket || !currentUserId) return;

    // Handle new message arrival
    socket.on("receive_message", (message: ChatMessage) => {
      const activeChatId = activeChatIdRef.current;
      
      if (message.chatId === activeChatId) {
        setMessagesList((prev) => [...prev, message]);
        // Since we are in the chat room, immediately mark it read
        socket.emit("read_messages", { chatId: activeChatId, userId: currentUserId });
      }

      // Refresh chat list to show latest message snippets and update unread count
      fetchChats(activeChatId || undefined);
    });

    // Handle typing status updates
    socket.on("user_typing", (data: { chatId: string; userId: string; isTyping: boolean }) => {
      const activeChatId = activeChatIdRef.current;
      if (data.chatId === activeChatId && activeChat?.otherParticipant.id === data.userId) {
        setOtherUserTyping(data.isTyping);
      }
    });

    // Handle message read receipts
    socket.on("messages_read", (data: { chatId: string; userId: string }) => {
      const activeChatId = activeChatIdRef.current;
      if (data.chatId === activeChatId && data.userId !== currentUserId) {
        setMessagesList((prev) =>
          prev.map((msg) => (msg.senderId === currentUserId ? { ...msg, isSeen: true } : msg))
        );
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("messages_read");
    };
  }, [socket, currentUserId, activeChat, fetchChats]);

  // Auto scroll to bottom of chat area
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList, otherUserTyping]);

  // Send message handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat || !socket || !currentUserId) return;

    // Send via socket
    socket.emit("send_message", {
      chatId: activeChat.id,
      senderId: currentUserId,
      content: messageInput.trim(),
    });

    // Cancel typing emit
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit("typing_status", {
      chatId: activeChat.id,
      userId: currentUserId,
      isTyping: false,
    });

    setMessageInput("");
  };

  // Typing status change handler with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (!socket || !activeChat || !currentUserId) return;

    // Immediately notify typing if starting to type
    if (!messageInput && e.target.value.length > 0) {
      socket.emit("typing_status", {
        chatId: activeChat.id,
        userId: currentUserId,
        isTyping: true,
      });
    }

    // Reset typing debounce timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_status", {
        chatId: activeChat.id,
        userId: currentUserId,
        isTyping: false,
      });
    }, 1500);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Filter conversations based on query
  const filteredChats = chats.filter((c) => {
    const fullName = `${c.otherParticipant.firstName} ${c.otherParticipant.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const formatMessageTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!session) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-blue-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to view and send messages.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl h-[calc(100vh-140px)] min-h-[500px]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        
        {/* Left Column: Conversations List */}
        <div className={`md:col-span-4 border-r border-gray-200 flex flex-col h-full ${activeChat ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Chats</h2>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Circle className={`h-2.5 w-2.5 fill-current ${isConnected ? "text-green-500" : "text-amber-500"}`} />
                {isConnected ? "Live connected" : "Connecting..."}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-50/50 border-gray-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingChats ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>{searchQuery ? "No matching contacts found." : "No active chats yet."}</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredChats.map((c) => {
                  const isActive = activeChat?.id === c.id;
                  const otherName = `${c.otherParticipant.firstName} ${c.otherParticipant.lastName}`;
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectChat(c)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-start gap-3 hover:bg-gray-50 ${
                        isActive ? "bg-blue-50/80 hover:bg-blue-50 text-blue-950 font-medium" : "text-gray-800"
                      }`}
                    >
                      <Avatar className="h-10 w-10 border border-gray-200 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                          {c.otherParticipant.firstName?.[0]}
                          {c.otherParticipant.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-semibold text-sm truncate">{otherName}</p>
                          {c.latestMessage && (
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {formatMessageTime(c.latestMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate ${c.unreadCount > 0 ? "text-blue-600 font-semibold" : "text-gray-500"}`}>
                          {c.latestMessage ? c.latestMessage.content : "No messages yet"}
                        </p>
                      </div>
                      {c.unreadCount > 0 && (
                        <Badge className="bg-blue-600 text-white rounded-full h-5 min-w-5 flex items-center justify-center p-0 text-[10px]">
                          {c.unreadCount}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Area */}
        <div className={`md:col-span-8 flex flex-col h-full ${!activeChat ? "hidden md:flex bg-gray-50/30 items-center justify-center" : "flex"}`}>
          {activeChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (socket) {
                        socket.emit("leave_room", activeChat.id);
                      }
                      setActiveChat(null);
                      router.push("/messages");
                    }}
                    className="md:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                      {activeChat.otherParticipant.firstName?.[0]}
                      {activeChat.otherParticipant.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900 leading-tight">
                      {activeChat.otherParticipant.firstName} {activeChat.otherParticipant.lastName}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 capitalize">
                      <Shield className="h-3 w-3 text-blue-500" />
                      {activeChat.otherParticipant.role.toLowerCase()}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/profile/${activeChat.otherParticipant.id}`)}
                  className="text-xs text-gray-500 hover:text-blue-600"
                >
                  <User className="h-4 w-4 mr-1" />
                  Profile
                </Button>
              </div>

              {/* Message Display Area */}
              <div className="flex-1 bg-gray-50/50 p-4 overflow-y-auto flex flex-col min-h-0">
                <div className="flex-1 pr-2 overflow-y-auto">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : messagesList.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-200" />
                      <p>Send a message to start the conversation.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 pb-2">
                      {messagesList.map((msg, index) => {
                        const isMine = msg.senderId === currentUserId;
                        const isLastMessage = index === messagesList.length - 1;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          >
                            <div className="max-w-[80%] md:max-w-[70%] space-y-1">
                              <div
                                className={`p-3 rounded-2xl text-sm shadow-sm leading-relaxed whitespace-pre-wrap ${
                                  isMine
                                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none"
                                    : "bg-white text-gray-900 border border-gray-100 rounded-bl-none"
                                }`}
                              >
                                {msg.content}
                              </div>
                              <div className={`flex items-center gap-1 text-[10px] text-gray-400 ${isMine ? "justify-end" : "justify-start"}`}>
                                <span>{formatMessageTime(msg.timestamp)}</span>
                                {isMine && isLastMessage && (
                                  <span className="ml-1">
                                    {msg.isSeen ? (
                                      <span className="flex items-center text-blue-500 font-medium">
                                        <CheckCheck className="h-3 w-3 mr-0.5" /> Seen
                                      </span>
                                    ) : (
                                      <span className="flex items-center">
                                        <Check className="h-3 w-3 mr-0.5" /> Sent
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {otherUserTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center space-x-1">
                            <span className="text-xs text-gray-400 italic font-light">
                              {activeChat.otherParticipant.firstName} is typing
                            </span>
                            <div className="flex gap-0.5 items-center mt-1">
                              <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                              <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                              <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white flex gap-2">
                <Input
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1 border-gray-200 focus-visible:ring-blue-500 bg-gray-50/50"
                />
                <Button type="submit" size="icon" disabled={!messageInput.trim()} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4.5 w-4.5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center p-8">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100/50">
                <MessageSquare className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Your Inbox</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Select a contact from the left list to begin messaging in real-time.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
