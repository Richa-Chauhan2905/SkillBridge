import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";

export const proxy = async (req: NextRequest) => {
  const token = await getToken({ req });
  const url = req.nextUrl;

  // If user is authenticated, redirect away from auth pages
  if (token) {
    if (url.pathname === "/signin" || url.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (url.pathname === "/signup") {
      // After signup, user will be redirected based on their role
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // If user is not authenticated, protect profile and dashboard routes
  if (!token) {
    if (
      url.pathname.startsWith("/freelancer-profile") ||
      url.pathname.startsWith("/client-profile") ||
      url.pathname.startsWith("/dashboard")
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
    "/dashboard/:path*",
  ],
};