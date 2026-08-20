"use client";

import { useDocuments } from "@/hooks/useDocuments";
import { DocumentCard } from "./DocumentCard";

export function DocumentList() {
  const { data: documents, isLoading, isError } = useDocuments();

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600">
        Couldn't load your documents. Try refreshing the page.
      </p>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        No documents yet — add your first one to get an AI summary and make it searchable.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}
