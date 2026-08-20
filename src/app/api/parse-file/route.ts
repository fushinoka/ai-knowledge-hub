import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// pdf-parse has no official types; this keeps the import isolated so a
// missing @types package doesn't break the rest of the app's typecheck.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "text/plain"];

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only PDF and plain text files are supported" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File is too large — max 10MB" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const text =
      file.type === "application/pdf"
        ? (await pdfParse(buffer)).text
        : buffer.toString("utf-8");

    const trimmed = text.trim();

    if (!trimmed) {
      return NextResponse.json(
        { error: "Couldn't find any readable text in that file" },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text: trimmed,
      suggestedTitle: file.name.replace(/\.(pdf|txt)$/i, ""),
    });
  } catch (err) {
    console.error("parse-file route failed:", err);
    return NextResponse.json(
      { error: "Failed to read that file — it may be corrupted or image-only" },
      { status: 500 }
    );
  }
}
