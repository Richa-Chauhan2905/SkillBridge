import { NextResponse } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/db";
import { chatParticipants, messages } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) => {
  try {
    const user = await getAuthUser();
    const userId = user.id;
    const { chatId } = await params;

    if (!chatId) {
      return NextResponse.json(
        { success: false, message: "chatId is required" },
        { status: 400 }
      );
    }

    // Verify if user is participant of this chat room
    const isParticipant = await db
      .select()
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.chatId, chatId),
          eq(chatParticipants.userId, userId)
        )
      )
      .limit(1);

    if (isParticipant.length === 0) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to this chat room" },
        { status: 403 }
      );
    }

    // Fetch messages sorted by timestamp ascending
    const chatMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.timestamp);

    return NextResponse.json({ success: true, messages: chatMessages });
  } catch (error: any) {
    console.error("Error in GET /api/chats/[chatId]/messages:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
};
