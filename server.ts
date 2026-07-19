import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { db } from "./src/db/index";
import { messages, chats } from "./src/db/schema";
import { eq, and, ne } from "drizzle-orm";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const userSockets = new Map<string, Set<string>>();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    let currentUserId: string | null = null;
    console.log("Client connected via Socket.io:", socket.id);

    socket.on("register_user", (userId: string) => {
      if (!userId) return;
      currentUserId = userId;
      
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)!.add(socket.id);
      
      console.log(`User ${userId} registered with socket ${socket.id}`);
      console.log(`Active users: ${userSockets.size}`);
    });

    socket.on("join_room", (chatId: string) => {
      if (!chatId) return;
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined room/chat: ${chatId}`);
    });
    socket.on("leave_room", (chatId: string) => {
      if (!chatId) return;
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left room/chat: ${chatId}`);
    });

    socket.on("send_message", async (data: {
      chatId: string;
      senderId: string;
      content: string;
    }) => {
      const { chatId, senderId, content } = data;
      if (!chatId || !senderId || !content) return;

      try {
        const [savedMessage] = await db
          .insert(messages)
          .values({
            chatId,
            senderId,
            content,
            isSeen: false,
          })
          .returning();

        await db
          .update(chats)
          .set({ updatedAt: new Date() })
          .where(eq(chats.id, chatId));

        io.to(chatId).emit("receive_message", savedMessage);
        console.log(`Message broadcasted in room ${chatId}:`, content);

        const { chatParticipants } = await import("./src/db/schema");
        const participants = await db
          .select({ userId: chatParticipants.userId })
          .from(chatParticipants)
          .where(eq(chatParticipants.chatId, chatId));

        const recipientIds = participants
          .map((p) => p.userId)
          .filter((id) => id !== senderId && id !== null) as string[];

        for (const recipientId of recipientIds) {
          const recipientSockets = userSockets.get(recipientId);
          if (recipientSockets) {
            for (const socketId of recipientSockets) {
              io.to(socketId).emit("message_notification", {
                chatId,
                senderId,
                message: content,
                messageId: savedMessage.id,
              });
            }
          }
        }
      } catch (err) {
        console.error("Error storing and broadcasting message:", err);
      }
    });

    socket.on("typing_status", (data: {
      chatId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      const { chatId, userId, isTyping } = data;
      if (!chatId || !userId) return;
      
      socket.to(chatId).emit("user_typing", { chatId, userId, isTyping });
    });

    socket.on("read_messages", async (data: {
      chatId: string;
      userId: string; // The user who read the messages
    }) => {
      const { chatId, userId } = data;
      if (!chatId || !userId) return;

      try {
        await db
          .update(messages)
          .set({ isSeen: true })
          .where(
            and(
              eq(messages.chatId, chatId),
              eq(messages.isSeen, false),
              ne(messages.senderId, userId)
            )
          );

        io.to(chatId).emit("messages_read", { chatId, userId });
        console.log(`Messages marked read in room ${chatId} by user ${userId}`);
      } catch (err) {
        console.error("Error setting read status in database:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected via Socket.io:", socket.id);
      if (currentUserId && userSockets.has(currentUserId)) {
        const socketsSet = userSockets.get(currentUserId)!;
        socketsSet.delete(socket.id);
        if (socketsSet.size === 0) {
          userSockets.delete(currentUserId);
        }
      }
      console.log(`Active users: ${userSockets.size}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> SkillBridge app ready on http://${hostname}:${port}`);
  });
});
