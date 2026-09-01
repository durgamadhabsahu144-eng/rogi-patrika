import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X, RotateCcw, Check, Upload, FileImage } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (blob: Blob, filename: string) => void;
  onClose: () => void;
  label?: string;
}

export function CameraCapture({
  onCapture,
  onClose,
  label = "Handwritten Prescription",
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  const startCamera = useCallback(async () => {
    try {
      setStarting(true);
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setStarting(false);
    } catch {
      setError(
        "Camera access denied or unavailable. Please use the file upload option instead."
      );
      setStarting(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    canvas.toBlob(
      (blob) => {
        setCapturedBlob(blob);
      },
      "image/jpeg",
      0.9
    );
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    startCamera();
  };

  const confirmCapture = () => {
    if (!capturedBlob) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${label.toLowerCase().replace(/\s+/g, "-")}-${timestamp}.jpg`;
    onCapture(capturedBlob, filename);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <h3 className="font-bold text-sm">Capture {label}</h3>
        <button onClick={stopCamera} className="p-2" type="button">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative bg-black overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Camera className="w-16 h-16 mb-4 text-white/50" />
            <p className="text-white/80 text-sm mb-4">{error}</p>
            <p className="text-white/50 text-xs">
              You can still upload documents using the file picker below.
            </p>
            <button
              onClick={stopCamera}
              type="button"
              className="mt-6 bg-white text-black font-bold px-6 py-3 rounded-lg"
            >
              Close
            </button>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-8 left-8 right-8 bottom-8 border-2 border-white/40 rounded-lg" />
              <p className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium">
                Align the document within the frame
              </p>
            </div>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="p-6 bg-black flex justify-center gap-4">
        {capturedImage ? (
          <>
            <button
              type="button"
              onClick={retake}
              className="bg-white text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake
            </button>
            <button
              type="button"
              onClick={confirmCapture}
              className="bg-emerald-500 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Use Photo
            </button>
          </>
        ) : !error && !starting ? (
          <button
            type="button"
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-white/90 hover:bg-white" />
          </button>
        ) : starting ? (
          <p className="text-white/60 text-sm">Starting camera...</p>
        ) : null}
      </div>
    </div>
  );
}

interface DocumentUploadProps {
  patientId: string;
  onUploaded?: () => void;
}

export function DocumentUploadWithCamera({
  patientId,
  onUploaded,
}: DocumentUploadProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<"prescription" | "report">(
    "prescription"
  );
  const [description, setDescription] = useState("");
  const [capturedFile, setCapturedFile] = useState<{
    blob: Blob;
    filename: string;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (blob: Blob, filename: string) => {
    setCapturedFile({ blob, filename });
    setShowCamera(false);
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedFile({ blob: file, filename: file.name });
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!capturedFile) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const docData = {
          patientId,
          fileName: capturedFile.filename,
          fileType: capturedFile.blob.type || "image/jpeg",
          fileUrl: base64,
          description:
            description ||
            `${uploadType === "prescription" ? "Handwritten prescription" : "Medical report"} captured via camera`,
          ocrVerified: false,
        };

        const existingDocs = JSON.parse(
          localStorage.getItem("captured-docs") || "[]"
        );
        existingDocs.push({
          ...docData,
          _id: `doc-${Date.now()}`,
          createdAt: Date.now(),
        });
        localStorage.setItem("captured-docs", JSON.stringify(existingDocs));

        setCapturedFile(null);
        setPreviewUrl(null);
        setDescription("");
        setUploading(false);
        onUploaded?.();
      };
      reader.readAsDataURL(capturedFile.blob);
    } catch {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setCapturedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileSelect}
      />
      {/* Camera input - on mobile this opens the camera directly */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Upload Type Selection */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setUploadType("prescription")}
          className={`px-4 py-2 text-sm font-bold rounded-lg border transition-all ${
            uploadType === "prescription"
              ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          📋 Prescription
        </button>
        <button
          type="button"
          onClick={() => setUploadType("report")}
          className={`px-4 py-2 text-sm font-bold rounded-lg border transition-all ${
            uploadType === "report"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          📄 Report
        </button>
      </div>

      {/* Capture Options */}
      <div className="grid grid-cols-2 gap-3">
        {/* Camera option - tries native camera first, falls back to modal */}
        <button
          type="button"
          onClick={() => {
            // On mobile, the capture input opens camera directly
            // On desktop, open the camera modal with live preview
            const isMobile =
              /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isMobile && cameraInputRef.current) {
              cameraInputRef.current.click();
            } else {
              setShowCamera(true);
            }
          }}
          className="p-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-md transition-all text-center group"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-200 transition-colors">
            <Camera className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="font-semibold text-sm text-slate-900 block">
            Take Photo
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Use camera to capture document
          </span>
        </button>

        {/* File upload option */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-md transition-all text-center group"
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <span className="font-semibold text-sm text-slate-900 block">
            Upload File
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            JPG, PNG, or PDF
          </span>
        </button>
      </div>

      {/* Captured File Preview */}
      {capturedFile && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-lg border border-slate-200 flex items-center justify-center">
              {capturedFile.filename.endsWith(".pdf") ? (
                <span className="text-lg">📄</span>
              ) : (
                <FileImage className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900 truncate">
                {capturedFile.filename}
              </p>
              <p className="text-xs text-slate-500">
                {(capturedFile.blob.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Preview image */}
          {previewUrl && capturedFile.blob.type.startsWith("image/") && (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-contain bg-slate-50"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">
              Description
            </label>
            <input
              type="text"
              className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Handwritten prescription from Dr. Sharma"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-[11px] text-amber-700">
              🔍 AI/OCR extracted information — Doctor verification required.
              This document will be reviewed by a healthcare professional.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUpload}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Save Document"}
          </button>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
          label={
            uploadType === "prescription"
              ? "Handwritten Prescription"
              : "Medical Report"
          }
        />
      )}
    </div>
  );
}
