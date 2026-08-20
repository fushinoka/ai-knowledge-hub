import { UploadForm } from "@/components/UploadForm";

export default function NewDocumentPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Add a document
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Paste in your content — it'll be summarized with AI and embedded for
        semantic search automatically.
      </p>
      <UploadForm />
    </div>
  );
}
