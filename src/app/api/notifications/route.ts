import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/src/db";
import { notifications } from "@/src/db/schema";
import { getAuthUser } from "@/src/lib/auth";

const linkedNotificationFilter = sql`${notifications.link} IS NOT NULL
  AND ${notifications.link} <> ''
  AND ${notifications.link} LIKE '/%'
  AND ${notifications.link} NOT LIKE '//%'
  AND ${notifications.link} NOT LIKE '/\\%'`;

export const GET = async () => {
  try {
    const user = await getAuthUser();

    const result = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        description: notifications.description,
        link: notifications.link,
        isNew: notifications.isNew,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(and(eq(notifications.userId, user.id), linkedNotificationFilter))
      .orderBy(desc(notifications.createdAt));

    return NextResponse.json({
      success: true,
      notifications: result,
    });
  } catch (error) {
    console.error("GET notifications error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load notifications" },
      { status: 500 },
    );
  }
};

export const PATCH = async (req: NextRequest) => {
  try {
    const user = await getAuthUser();
    const { id, all } = await req.json();

    if (all) {
      await db
        .update(notifications)
        .set({ isNew: false })
        .where(and(eq(notifications.userId, user.id), linkedNotificationFilter));

      return NextResponse.json({ success: true });
    }

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "Notification ID is required" },
        { status: 400 },
      );
    }

    await db
      .update(notifications)
      .set({ isNew: false })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, user.id),
          linkedNotificationFilter,
        ),
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH notifications error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update notifications" },
      { status: 500 },
    );
  }
};
