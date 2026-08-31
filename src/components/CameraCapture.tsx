import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCcw, Check, Upload } from "lucide-react";

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
    // Stop camera
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

  // Start camera on mount
  if (starting && !stream && !capturedImage && !error) {
    startCamera();
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <h3 className="font-bold text-sm">Capture {label}</h3>
        <button onClick={stopCamera} className="p-2">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera / Preview */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Camera className="w-16 h-16 mb-4 text-white/50" />
            <p className="text-white/80 text-sm mb-4">{error}</p>
            <p className="text-white/50 text-xs">
              You can still upload documents using the file picker.
            </p>
            <Button
              onClick={stopCamera}
              className="mt-6 neo-btn bg-white text-black font-bold"
            >
              Close
            </Button>
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
            {/* Viewfinder overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-8 left-8 right-8 bottom-8 border-2 border-white/40 rounded-lg" />
              <p className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium">
                Align the document within the frame
              </p>
            </div>
          </>
        )}
      </div>

      {/* Canvas for capture (hidden) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="p-6 bg-black flex justify-center gap-4">
        {capturedImage ? (
          <>
            <Button
              onClick={retake}
              className="neo-btn bg-white text-black font-bold px-6 py-3"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake
            </Button>
            <Button
              onClick={confirmCapture}
              className="neo-btn bg-neo-green text-black font-bold px-6 py-3 border-2 border-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Use Photo
            </Button>
          </>
        ) : !error ? (
          <button
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-white/90 hover:bg-white" />
          </button>
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (blob: Blob, filename: string) => {
    setCapturedFile({ blob, filename });
    setShowCamera(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedFile({ blob: file, filename: file.name });
  };

  const handleUpload = async () => {
    if (!capturedFile) return;
    setUploading(true);
    try {
      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        // Store as a document record (without actual file storage in demo mode)
        // In production, this would upload to a file storage service
        const docData = {
          patientId,
          fileName: capturedFile.filename,
          fileType: capturedFile.blob.type || "image/jpeg",
          fileUrl: base64, // Store base64 for demo
          description: description || `${uploadType === "prescription" ? "Handwritten prescription" : "Medical report"} captured via camera`,
          ocrVerified: false,
        };

        // We need to use a mutation to save this
        // For now, store in localStorage as demo
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
        setDescription("");
        setUploading(false);
        onUploaded?.();
      };
      reader.readAsDataURL(capturedFile.blob);
    } catch {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Upload Type Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setUploadType("prescription")}
          className={`px-4 py-2 text-sm font-bold border-2 border-foreground transition-all ${
            uploadType === "prescription"
              ? "bg-neo-yellow shadow-[2px_2px_0px_#0A0A0A]"
              : "bg-background hover:bg-secondary"
          }`}
        >
          📋 Prescription
        </button>
        <button
          onClick={() => setUploadType("report")}
          className={`px-4 py-2 text-sm font-bold border-2 border-foreground transition-all ${
            uploadType === "report"
              ? "bg-neo-blue shadow-[2px_2px_0px_#0A0A0A]"
              : "bg-background hover:bg-secondary"
          }`}
        >
          📄 Report
        </button>
      </div>

      {/* Capture Options */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowCamera(true)}
          className="p-6 border-2 border-foreground bg-neo-green hover:shadow-[4px_4px_0px_#0A0A0A] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-center"
        >
          <Camera className="w-8 h-8 mx-auto mb-2" />
          <span className="font-bold text-sm block">Take Photo</span>
          <span className="text-[10px] text-muted-foreground block mt-1">
            Use camera to capture document
          </span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-6 border-2 border-foreground bg-neo-yellow hover:shadow-[4px_4px_0px_#0A0A0A] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-center"
        >
          <Upload className="w-8 h-8 mx-auto mb-2" />
          <span className="font-bold text-sm block">Upload File</span>
          <span className="text-[10px] text-muted-foreground block mt-1">
            JPG, PNG, or PDF
          </span>
        </button>
      </div>

      {/* Captured File Preview */}
      {capturedFile && (
        <div className="neo-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-neo-green border-2 border-foreground flex items-center justify-center">
              {capturedFile.filename.endsWith(".pdf") ? (
                <span className="text-lg">📄</span>
              ) : (
                <span className="text-lg">🖼️</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">
                {capturedFile.filename}
              </p>
              <p className="text-xs text-muted-foreground">
                {(capturedFile.blob.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => setCapturedFile(null)}
              className="p-1 hover:bg-secondary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preview image */}
          {capturedFile.blob.type.startsWith("image/") && (
            <div className="border-2 border-foreground overflow-hidden">
              <img
                src={URL.createObjectURL(capturedFile.blob)}
                alt="Preview"
                className="w-full h-48 object-contain bg-white"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-bold block mb-1">Description</label>
            <input
              type="text"
              className="neo-input w-full py-2 px-3 text-sm"
              placeholder="e.g., Handwritten prescription from Dr. Sharma"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="neo-border-sm p-3 bg-neo-yellow/20">
            <p className="text-[10px] text-muted-foreground italic">
              AI/OCR extracted information — Doctor verification required. This
              document will be reviewed by a healthcare professional.
            </p>
          </div>

          <Button
            onClick={handleUpload}
            className="neo-btn w-full bg-foreground text-background font-bold"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Save Document"}
          </Button>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
          label={uploadType === "prescription" ? "Handwritten Prescription" : "Medical Report"}
        />
      )}
    </div>
  );
}
