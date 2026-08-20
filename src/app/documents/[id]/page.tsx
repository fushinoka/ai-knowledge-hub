import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function DocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: document, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !document) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">{document.title}</h1>
      <p className="mt-1 text-xs text-gray-400">
        Added {formatDate(document.created_at)}
      </p>

      {document.summary && (
        <div className="mt-6 rounded-lg border border-brand-100 bg-brand-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-700">
            AI Summary
          </p>
          <p className="mt-1 text-sm text-gray-800">{document.summary}</p>
        </div>
      )}

      <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
        {document.content}
      </div>
    </article>
  );
}
