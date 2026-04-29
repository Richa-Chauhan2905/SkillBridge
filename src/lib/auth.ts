import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/options";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function getAuthUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const dbUser = result[0];

  if (!dbUser) {
    throw new Error("USER_NOT_FOUND");
  }

  console.log("SESSION DEBUG:", session);
  return dbUser;
}
