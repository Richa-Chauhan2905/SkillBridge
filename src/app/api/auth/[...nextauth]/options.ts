import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (credentials: any) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email));

        const user = result[0];

        if (!user || !user.password) {
          throw new Error("Incorrect email or password");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordCorrect) {
          throw new Error("Incorrect email or password");
        }

        return {
          id: user.id,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          image: user.image,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        if (!user.email) return "/signup";

        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email));

        const existingUser = result[0];

        if (!existingUser) return "/signup";

        // Update user info if missing
        if (!existingUser.image || !existingUser.firstName) {
          await db
            .update(users)
            .set({
              firstName: user.name?.split(" ")[0] || existingUser.firstName,
              lastName:
                user.name?.split(" ").slice(1).join(" ") ||
                existingUser.lastName,
              image: user.image || existingUser.image,
            })
            .where(eq(users.id, existingUser.id));
        }
      }
      return true;
    },

    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.email = user.email;
        token.image = user.image;
      }

      // Google login → fetch fresh DB data
      if (account?.provider === "google" && user?.email) {
        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email));

        const dbUser = result[0];

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.email = dbUser.email;
          token.image = dbUser.image || user.image;
        }
      }

      return token;
    },

    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.email = token.email;
        session.user.image = token.image;
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
    signUp: "/signup",
    error: "/error",
  },

  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
