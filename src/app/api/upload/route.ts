import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (process.env.NODE_ENV === "production") {
      uploadsDir = path.join(process.cwd(), "..", "public_html", "uploads");
    }
    await mkdir(uploadsDir, { recursive: true });

    // Clean up filename to prevent path traversal and spaces
    const cleanName = path.basename(file.name).replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${cleanName}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
