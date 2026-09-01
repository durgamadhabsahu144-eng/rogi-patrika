import { useState, useCallback } from "react";
import { ZIP_B64 } from "@/zip-data";

export default function Download() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  const handleDownload = useCallback(() => {
    setStatus("loading");
    try {
      const binaryString = atob(ZIP_B64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "RogiPatrika.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-10 max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">📦</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          RogiPatrika — Source Code
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          Download the complete project source code as a zip file. Contains all
          frontend, backend, and database files.
        </p>
        <button
          onClick={handleDownload}
          disabled={status === "loading"}
          className="bg-blue-600 text-white font-semibold rounded-xl px-8 py-4 shadow-md hover:bg-blue-700 hover:shadow-lg transition-all text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading"
            ? "⏳ Preparing download..."
            : status === "done"
              ? "✅ Downloaded!"
              : "⬇️ Download ZIP (147KB)"}
        </button>
        {status === "error" && (
          <p className="mt-4 text-red-600 text-sm font-medium">
            Download failed. Please try again or contact support.
          </p>
        )}
        <div className="mt-6 text-xs text-slate-400">
          <p>
            If the download doesn&apos;t work, try right-clicking the button and
            selecting "Save link as..."
          </p>
        </div>
      </div>
    </div>
  );
}
