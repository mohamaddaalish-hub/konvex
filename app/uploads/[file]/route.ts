import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (!/^[a-f0-9-]{36}\.webp$/.test(file))
    return new NextResponse("Not found", { status: 404 });
  try {
    const data = await fs.readFile(
      path.join(process.cwd(), "data/uploads", file),
    );
    return new NextResponse(data, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
