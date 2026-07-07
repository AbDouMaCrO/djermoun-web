"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2 } from "lucide-react";
import { uploadClientDocument, deleteClientDocument } from "@/app/actions/adminDocuments";

export type ClientDoc = {
  id: string;
  document_name: string;
  file_url: string;
  created_at: string;
};

export default function ClientDocuments({
  orderId,
  userId,
  documents,
}: {
  orderId: string;
  userId: string | null;
  documents: ClientDoc[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a file.");
      return;
    }

    const formData = new FormData();
    formData.set("order_id", orderId);
    formData.set("user_id", userId ?? "");
    formData.set("document_name", name);
    formData.set("file", file);

    setPending(true);
    const result = await uploadClientDocument(formData);
    setPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    setName("");
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  async function onDelete(doc: ClientDoc) {
    setError(null);
    setPending(true);
    const result = await deleteClientDocument(doc.id, doc.file_url, orderId);
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={onUpload} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Document name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Inspection Report"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-amber-500"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">File (PDF)</span>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt,.csv"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500"
          />
        </label>
        <button
          type="submit"
          disabled={pending || !userId}
          className="press-scale rounded-md bg-amber-500 px-5 py-2 text-sm font-bold text-black transition-colors duration-150 hover:bg-amber-400 disabled:opacity-50"
        >
          {pending ? "Uploading…" : "Upload"}
        </button>
      </form>

      {!userId && (
        <p className="mt-2 text-sm text-amber-600">
          This order has no linked customer account, so documents can't be attached.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <table className="mt-6 min-w-full divide-y divide-slate-200 text-sm">
        <thead className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            <th className="py-2">Document</th>
            <th className="py-2">Uploaded</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {documents.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center text-slate-400">
                No documents uploaded yet.
              </td>
            </tr>
          )}
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="py-3">
                <span className="flex items-center gap-2 font-medium text-slate-900">
                  <FileText size={16} className="text-amber-500" />
                  {doc.document_name}
                </span>
              </td>
              <td className="py-3 text-slate-500">
                {new Date(doc.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 text-right">
                <button
                  type="button"
                  onClick={() => onDelete(doc)}
                  disabled={pending}
                  aria-label="Delete document"
                  className="rounded-md border border-slate-300 p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
