"use client";

import { useState } from "react";
import Link from "next/link";
import { useSemanticSearch } from "@/hooks/useDocuments";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const search = useSemanticSearch();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    search.mutate({ query });
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by meaning, not just keywords…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={search.isPending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60"
        >
          {search.isPending ? "Searching…" : "Search"}
        </button>
      </form>

      {search.data && (
        <div className="mt-3 space-y-2">
          {search.data.results.length === 0 ? (
            <p className="text-sm text-gray-500">No close matches found.</p>
          ) : (
            search.data.results.map((result) => (
              <Link
                key={result.id}
                href={`/documents/${result.id}`}
                className="block rounded-md border border-gray-200 p-3 text-sm hover:border-brand-300"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{result.title}</span>
                  <span className="text-xs text-gray-400">
                    {Math.round(result.similarity * 100)}% match
                  </span>
                </div>
                {result.summary && (
                  <p className="mt-1 text-gray-600">{result.summary}</p>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
