"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { newDocumentSchema, type NewDocumentInput } from "@/lib/schemas";
import { useCreateDocument } from "@/hooks/useDocuments";

export function UploadForm() {
  const router = useRouter();
  const createDocument = useCreateDocument();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewDocumentInput>({
    resolver: zodResolver(newDocumentSchema),
  });

  async function onSubmit(values: NewDocumentInput) {
    const result = await createDocument.mutateAsync(values);
    router.push(`/documents/${result.document?.id ?? ""}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          {...register("title")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Q3 onboarding notes"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          rows={10}
          {...register("content")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Paste in the document text — it'll be summarized and made searchable automatically."
        />
        {errors.content && (
          <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>
        )}
      </div>

      {createDocument.isError && (
        <p className="text-sm text-red-600">
          {(createDocument.error as Error)?.message ?? "Something went wrong."}
        </p>
      )}

      <button
        type="submit"
        disabled={createDocument.isPending}
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {createDocument.isPending ? "Summarizing…" : "Save document"}
      </button>
    </form>
  );
}
