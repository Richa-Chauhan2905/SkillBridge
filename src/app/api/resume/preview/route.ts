import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json(
        { error: "Resume URL is required" },
        { status: 400 },
      );
    }

    // 🔒 Validate URL
    const allowedHost = "res.cloudinary.com";

    let parsedUrl;
    try {
      parsedUrl = new URL(fileUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (!parsedUrl.hostname.includes(allowedHost)) {
      return NextResponse.json(
        { error: "Invalid file source" },
        { status: 403 },
      );
    }

    // Fetch PDF
    const res = await fetch(fileUrl);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch resume" },
        { status: 500 },
      );
    }

    const buffer = await res.arrayBuffer();

    return NextResponse.redirect(fileUrl);
  } catch (error) {
    console.error("Resume preview error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
