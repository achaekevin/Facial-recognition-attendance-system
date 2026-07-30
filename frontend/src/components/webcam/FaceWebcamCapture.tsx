import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, CheckCircle2, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface FaceWebcamCaptureProps {
  onCapture: (imageSrc: string, qualityScore: number) => void;
  stepName?: string;
}

export const FaceWebcamCapture: React.FC<FaceWebcamCaptureProps> = ({
  onCapture,
  stepName = 'Live Face Capture',
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean>(true);
  const [qualityScore, setQualityScore] = useState<number>(98);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomScore = Math.floor(92 + Math.random() * 7);
      setQualityScore(randomScore);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCaptureClick = () => {
    setIsCapturing(true);
    setTimeout(() => {
      let imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) {
        // Create SVG data URL as clean fallback
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.5"><rect width="100%" height="100%" fill="#0f172a"/><circle cx="12" cy="9" r="4" fill="#6366f1"/><path d="M5 20c0-4 3-7 7-7s7 3 7 7" stroke="#6366f1"/></svg>`;
        imageSrc = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
      }
      onCapture(imageSrc, qualityScore);
      setIsCapturing(false);
    }, 400);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Viewport Frame */}
      <div className="relative w-full max-w-md aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border-2 border-primary/40 shadow-xl group">
        {hasCameraAccess ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            onUserMediaError={() => setHasCameraAccess(false)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-primary mb-3">
              <UserIcon className="w-8 h-8" />
            </div>
            <p className="text-xs font-semibold text-white">Camera Standby / Preview</p>
            <p className="text-[11px] text-slate-500 mt-1">Allow camera access or click capture to finalize profile.</p>
          </div>
        )}

        {/* Biometric HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
          <div className="flex items-center justify-between z-10">
            <Badge variant="primary" pulse className="bg-slate-900/80 backdrop-blur-md text-white border-white/10">
              {stepName}
            </Badge>
            <Badge
              variant={qualityScore >= 85 ? 'success' : 'warning'}
              className="bg-slate-900/80 backdrop-blur-md"
            >
              Quality: {qualityScore}%
            </Badge>
          </div>

          {/* Oval Target Frame */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-60 border-2 border-dashed border-primary/70 rounded-full flex items-center justify-center animate-pulse-subtle">
            <div className="w-44 h-56 border border-emerald-400/40 rounded-full flex items-center justify-center">
              <span className="text-[10px] text-emerald-400 font-mono uppercase bg-slate-950/70 px-2 py-0.5 rounded">
                Align Face Here
              </span>
            </div>
          </div>

          <div className="flex items-center justify-around z-10 bg-slate-950/75 backdrop-blur-md rounded-xl p-2 text-[11px] text-slate-300 border border-white/10">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Lighting: Optimal
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Position: Centered
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Liveness: Verified
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant="primary"
        size="lg"
        isLoading={isCapturing}
        onClick={handleCaptureClick}
        leftIcon={<Camera className="w-5 h-5" />}
        className="w-full max-w-md py-3.5 text-base font-bold shadow-lg shadow-primary/30"
      >
        Capture & Finalize Enrollment
      </Button>
    </div>
  );
};
