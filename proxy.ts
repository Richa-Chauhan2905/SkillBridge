import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const proxy = async (req: NextRequest) => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl;
  const isAuthPage = url.pathname === "/signin" || url.pathname === "/signup";
  const isLandingPage = url.pathname === "/";

  // Landing and auth pages are only for unauthenticated users.
  if (token) {
    if (isLandingPage || isAuthPage) {
      return NextResponse.redirect(new URL("/feed", req.url));
    }
  }

  // If user is not authenticated, protect profile and dashboard routes
  if (!token) {
    if (
      url.pathname.startsWith("/freelancer-profile") ||
      url.pathname.startsWith("/client-profile") ||
      url.pathname.startsWith("/feed")
    ) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  return NextResponse.next();
};

// Specify which routes should be protected
export const config = {
  matcher: [
    "/",
    "/signup",
    "/signin",
    "/freelancer-profile/:path*",
    "/client-profile/:path*",
    "/feed/:path*",
  ],
};
