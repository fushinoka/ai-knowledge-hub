"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { KnowledgeDocument, SearchResponse, SummarizeResponse } from "@/types";
import type { NewDocumentInput, SearchInput } from "@/lib/schemas";

/**
 * Fetches all documents the current user owns or has been granted
 * access to. RLS policies on the `documents` table do the filtering.
 */
export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: async (): Promise<KnowledgeDocument[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: async (): Promise<KnowledgeDocument> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: Boolean(id),
  });
}

/**
 * Sends a new document to the /api/summarize route, which handles
 * summarization + embedding generation server-side (keeps the OpenAI
 * key off the client) and inserts the row.
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: NewDocumentInput): Promise<SummarizeResponse> => {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create document");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useSemanticSearch() {
  return useMutation({
    mutationFn: async (input: SearchInput): Promise<SearchResponse> => {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Search failed");
      }

      return res.json();
    },
  });
}
