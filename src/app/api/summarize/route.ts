import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { summarizeText, embedText } from "@/lib/ai";
import { newDocumentSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = newDocumentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { title, content } = parsed.data;

  try {
    // Run summarization and embedding generation in parallel — they're
    // independent calls and both just need the raw content.
    const [summary, embedding] = await Promise.all([
      summarizeText(content),
      embedText(`${title}\n\n${content}`),
    ]);

    const { data, error } = await supabase
      .from("documents")
      .insert({
        owner_id: user.id,
        title,
        content,
        summary,
        embedding,
      })
      .select("id, title, summary, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ document: data }, { status: 201 });
  } catch (err) {
    console.error("summarize route failed:", err);
    return NextResponse.json(
      { error: "Failed to summarize and save the document" },
      { status: 500 }
    );
  }
}
