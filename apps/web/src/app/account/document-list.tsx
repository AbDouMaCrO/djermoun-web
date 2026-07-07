"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { getDocumentDownloadUrl } from "@/app/actions/account";

export type UserDocument = {
  id: string;
  document_name: string;
  file_url: string;
  created_at: string;
};

export default function DocumentList({ documents }: { documents: UserDocument[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onDownload(doc: UserDocument) {
    setError(null);
    setBusyId(doc.id);
    const result = await getDocumentDownloadUrl(doc.file_url);
    setBusyId(null);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    const link = document.createElement("a");
    link.href = result.url;
    link.target = "_blank";
    link.rel = "noopener,noreferrer";
    link.download = doc.document_name || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (documents.length === 0) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        No documents yet. Export paperwork will appear here as your order progresses.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <ul className="divide-y divide-slate-200">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <FileText size={20} className="shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-slate-900">{doc.document_name}</p>
                <p className="text-xs text-slate-500">
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDownload(doc)}
              disabled={busyId === doc.id}
              className="press-scale rounded-md bg-amber-500 px-4 py-1.5 text-sm font-semibold text-black transition-colors duration-150 hover:bg-amber-400 disabled:opacity-50"
            >
              {busyId === doc.id ? "Preparing…" : "Download"}
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
