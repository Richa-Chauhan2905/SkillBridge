import { NextResponse } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/db";
import { chats, chatParticipants, messages, users } from "@/src/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";

// GET /api/chats - Get list of active chats for current user
export const GET = async () => {
  try {
    const user = await getAuthUser();
    const userId = user.id;

    // Get all chat IDs the user is a participant in
    const myParticipations = await db
      .select({ chatId: chatParticipants.chatId })
      .from(chatParticipants)
      .where(eq(chatParticipants.userId, userId));

    const chatIds = myParticipations
      .map((p) => p.chatId)
      .filter((id): id is string => id !== null);

    if (chatIds.length === 0) {
      return NextResponse.json({ success: true, chats: [] });
    }

    const chatsList = [];
    for (const chatId of chatIds) {
      // Get the chat record to read dates
      const chatRecordResult = await db
        .select()
        .from(chats)
        .where(eq(chats.id, chatId))
        .limit(1);
      const chatRecord = chatRecordResult[0];

      if (!chatRecord) continue;

      // Find the other participant in this chat
      const participants = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          role: users.role,
          image: users.image,
        })
        .from(chatParticipants)
        .innerJoin(users, eq(chatParticipants.userId, users.id))
        .where(eq(chatParticipants.chatId, chatId));

      const otherParticipant = participants.find((p) => p.id !== userId);

      if (!otherParticipant) continue;

      // Get latest message in this chat
      const latestMessageResult = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, chatId))
        .orderBy(desc(messages.timestamp))
        .limit(1);
      const latestMessage = latestMessageResult[0] || null;

      // Count unread messages (isSeen = false and senderId != currentUserId)
      const unreadCountResult = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.chatId, chatId),
            eq(messages.isSeen, false),
            ne(messages.senderId, userId)
          )
        );
      const unreadCount = unreadCountResult.length;

      chatsList.push({
        id: chatId,
        updatedAt: chatRecord.updatedAt,
        createdAt: chatRecord.createdAt,
        otherParticipant,
        latestMessage,
        unreadCount,
      });
    }

    // Sort by latest message/activity timestamp desc
    chatsList.sort((a, b) => {
      const aTime = a.latestMessage
        ? new Date(a.latestMessage.timestamp || 0).getTime()
        : new Date(a.updatedAt || 0).getTime();
      const bTime = b.latestMessage
        ? new Date(b.latestMessage.timestamp || 0).getTime()
        : new Date(b.updatedAt || 0).getTime();
      return bTime - aTime;
    });

    return NextResponse.json({ success: true, chats: chatsList });
  } catch (error: any) {
    console.error("Error in GET /api/chats:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch chats" },
      { status: 500 }
    );
  }
};

// POST /api/chats - Get or Create a chat with another user
export const POST = async (req: Request) => {
  try {
    const user = await getAuthUser();
    const currentUserId = user.id;

    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: "targetUserId is required" },
        { status: 400 }
      );
    }

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { success: false, message: "Cannot chat with yourself" },
        { status: 400 }
      );
    }

    // Find if a chat room already exists between these two users
    const myChats = await db
      .select({ chatId: chatParticipants.chatId })
      .from(chatParticipants)
      .where(eq(chatParticipants.userId, currentUserId));

    const targetChats = await db
      .select({ chatId: chatParticipants.chatId })
      .from(chatParticipants)
      .where(eq(chatParticipants.userId, targetUserId));

    const myChatIds = myChats.map((c) => c.chatId).filter(Boolean);
    const targetChatIds = targetChats.map((c) => c.chatId).filter(Boolean);

    const commonChatId = myChatIds.find((id) => targetChatIds.includes(id));

    if (commonChatId) {
      return NextResponse.json({
        success: true,
        chatId: commonChatId,
        existing: true,
      });
    }

    // Create a new chat room
    const [newChat] = await db.insert(chats).values({}).returning();

    // Insert participants
    await db.insert(chatParticipants).values([
      { chatId: newChat.id, userId: currentUserId },
      { chatId: newChat.id, userId: targetUserId },
    ]);

    return NextResponse.json({
      success: true,
      chatId: newChat.id,
      existing: false,
    });
  } catch (error: any) {
    console.error("Error in POST /api/chats:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create chat" },
      { status: 500 }
    );
  }
};
