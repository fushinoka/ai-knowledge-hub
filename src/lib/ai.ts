import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Summarizes a document's content into a short, skimmable paragraph.
 * Truncates very long input so we stay well within context limits.
 */
export async function summarizeText(content: string): Promise<string> {
  const truncated = content.slice(0, 12000);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "You summarize documents for a knowledge base. Write a concise, " +
          "3-4 sentence summary that captures the key points. No preamble, " +
          "no 'this document discusses' — just the summary itself.",
      },
      { role: "user", content: truncated },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}

/**
 * Generates a 1536-dimension embedding for a piece of text, used for
 * semantic search (see supabase/schema.sql -> match_documents()).
 */
export async function embedText(text: string): Promise<number[]> {
  const truncated = text.slice(0, 8000);

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: truncated,
  });

  return response.data[0].embedding;
}
