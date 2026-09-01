import { useState, useCallback } from "react";

export default function Download() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  const handleDownload = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/CareSync-Pro.zip");
      if (!res.ok) throw new Error("Failed to fetch zip");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "CareSync-Pro.zip";
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
    <div className="min-h-screen bg-[#FFFEF2] flex items-center justify-center p-8">
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] p-8 max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-4">📦 CareSync Pro — Source Code</h1>
        <p className="text-sm mb-6">
          Download the complete project source code as a zip file.
        </p>
        <button
          onClick={handleDownload}
          disabled={status === "loading"}
          className="bg-[#C5F82A] text-black font-bold border-2 border-black px-8 py-4 shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading"
            ? "⏳ Downloading..."
            : status === "done"
              ? "✅ Downloaded!"
              : "⬇️ Download ZIP (147KB)"}
        </button>
        {status === "error" && (
          <p className="mt-4 text-red-600 text-sm font-bold">
            ❌ Download failed. The file may not be available yet.
            <br />
            Try refreshing the page or contact support.
          </p>
        )}
        <div className="mt-6 text-xs text-gray-500">
          <p>
            If the download doesn't work, try right-clicking the button and
            selecting "Save link as..."
          </p>
        </div>
      </div>
    </div>
  );
}
