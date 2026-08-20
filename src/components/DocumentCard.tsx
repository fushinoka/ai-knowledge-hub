import Link from "next/link";
import type { KnowledgeDocument } from "@/types";
import { formatDate, truncate } from "@/lib/utils";

export function DocumentCard({ document }: { document: KnowledgeDocument }) {
  return (
    <Link
      href={`/documents/${document.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
    >
      <h3 className="font-medium text-gray-900">{document.title}</h3>

      <p className="mt-1 text-sm text-gray-600">
        {document.summary
          ? truncate(document.summary, 160)
          : "Summary is still generating…"}
      </p>

      <p className="mt-3 text-xs text-gray-400">
        Added {formatDate(document.created_at)}
      </p>
    </Link>
  );
}
