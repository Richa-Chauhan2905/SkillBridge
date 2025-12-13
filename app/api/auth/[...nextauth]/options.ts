import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {prisma} from "@/app/index";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "email",
          type: "text",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      authorize: async (credentials: any) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }
        
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Incorrect email or password");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
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
    async signIn({ user, account }: { user: any; account: any }) {
      if (account?.provider === "google") {
        if (!user.email) {
          return "/signup";
        }
        
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        
        if (!existingUser) {
          return "/signup";
        }
        
        // Update user info from Google if needed
        if (!existingUser.image || !existingUser.firstName) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              firstName: user.name?.split(" ")[0] || existingUser.firstName,
              lastName: user.name?.split(" ").slice(1).join(" ") || existingUser.lastName,
              image: user.image || existingUser.image,
            },
          });
        }
      }
      return true;
    },

    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      // Initialize token with user data if available
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.email = user.email;
        token.image = user.image;
      }

      // For Google OAuth, fetch fresh data from database
      if (account?.provider === "google" && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        
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

    async session({ session, token }: { session: any; token: any }) {
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.AUTH_SECRET,
  
  // Enable debug logs in development
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);