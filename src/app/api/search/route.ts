import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embedText } from "@/lib/ai";
import { searchSchema } from "@/lib/schemas";
import type { SearchResult } from "@/types";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = searchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const queryEmbedding = await embedText(parsed.data.query);

    // match_documents is a Postgres function (see supabase/schema.sql)
    // that ranks documents by cosine similarity to the query embedding,
    // already scoped to what the current user can see via RLS.
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 10,
    });

    if (error) throw error;

    return NextResponse.json({ results: data as SearchResult[] });
  } catch (err) {
    console.error("search route failed:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
