import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Clean up filename to prevent path traversal
    const safeFilename = path.basename(filename);
    
    let filePath = path.join(process.cwd(), "public", "uploads", safeFilename);
    if (process.env.NODE_ENV === "production") {
      filePath = path.join("/home/u487607181/domains/coffeestoreq8.com/public_html/uploads", safeFilename);
    }

    console.log("Serving upload:", filename);
    console.log("Current working dir:", process.cwd());
    console.log("Resolved filePath:", filePath);
    console.log("File exists on disk:", fs.existsSync(filePath));

    if (!fs.existsSync(filePath)) {
      return new Response("Not Found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    // Determine content type
    let contentType = "image/jpeg";
    if (safeFilename.endsWith(".png") || safeFilename.endsWith(".PNG")) {
      contentType = "image/png";
    } else if (safeFilename.endsWith(".webp") || safeFilename.endsWith(".WEBP")) {
      contentType = "image/webp";
    } else if (safeFilename.endsWith(".gif") || safeFilename.endsWith(".GIF")) {
      contentType = "image/gif";
    } else if (safeFilename.endsWith(".svg") || safeFilename.endsWith(".SVG")) {
      contentType = "image/svg+xml";
    }

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving upload:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
