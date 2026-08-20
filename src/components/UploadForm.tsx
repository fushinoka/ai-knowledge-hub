"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { newDocumentSchema, type NewDocumentInput } from "@/lib/schemas";
import { useCreateDocument } from "@/hooks/useDocuments";

export function UploadForm() {
  const router = useRouter();
  const createDocument = useCreateDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NewDocumentInput>({
    resolver: zodResolver(newDocumentSchema),
  });

  async function onSubmit(values: NewDocumentInput) {
    const result = await createDocument.mutateAsync(values);
    router.push(`/documents/${result.document?.id ?? ""}`);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setIsParsingFile(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-file", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to read that file");
      }

      setValue("content", data.text, { shouldValidate: true });
      if (data.suggestedTitle) {
        setValue("title", data.suggestedTitle, { shouldValidate: true });
      }
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Failed to read that file");
    } finally {
      setIsParsingFile(false);
      // Reset so selecting the same file again still fires onChange
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
        <div className="flex items-center justify-between">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsingFile}
            className="text-xs font-medium text-brand-600 hover:underline disabled:opacity-60"
          >
            {isParsingFile ? "Reading file…" : "Upload a PDF or .txt instead"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        <textarea
          id="content"
          rows={10}
          {...register("content")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Paste in the document text — it'll be summarized and made searchable automatically."
        />
        {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
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
