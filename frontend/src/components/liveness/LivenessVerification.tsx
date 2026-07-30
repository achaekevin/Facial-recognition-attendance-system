import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CheckCircle, XCircle, AlertTriangle, Eye, Move, Sparkles, Monitor, Loader } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { toast } from 'sonner';

interface LivenessResult {
  success: boolean;
  is_live: boolean;
  overall_score: number;
  risk_level: string;
  status: string;
  component_scores: {
    blink: number;
    movement: number;
    texture: number;
    screen: number;
  };
  checks_passed: {
    blink: boolean;
    movement: boolean;
    texture: boolean;
    screen: boolean;
  };
  recommendations: string[];
}

interface LivenessVerificationProps {
  onVerificationComplete?: (result: LivenessResult) => void;
  autoStart?: boolean;
  showInstructions?: boolean;
  minScore?: number;
}

export const LivenessVerification: React.FC<LivenessVerificationProps> = ({
  onVerificationComplete,
  autoStart = false,
  showInstructions = true,
  minScore = 0.5
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<LivenessResult | null>(null);
  const [currentInstruction, setCurrentInstruction] = useState<string>('');
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const instructionTimerRef = useRef<NodeJS.Timeout>();

  const instructions = [
    'Look straight at the camera',
    'Blink naturally',
    'Turn your head slightly left',
    'Turn your head slightly right',
    'Smile briefly',
    'Stay still for final check'
  ];

  useEffect(() => {
    if (autoStart) {
      startVerification();
    }

    return () => {
      stopCamera();
      if (instructionTimerRef.current) {
        clearTimeout(instructionTimerRef.current);
      }
    };
  }, [autoStart]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }

      return true;
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
      return false;
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get base64 image
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const performLivenessCheck = async (imageBase64: string): Promise<LivenessResult | null> => {
    try {
      // Mock API call - replace with actual API endpoint
      // const response = await fetch('/api/v1/liveness/check', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ image_base64: imageBase64 })
      // });
      // return await response.json();

      // Mock result for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockResult: LivenessResult = {
        success: true,
        is_live: Math.random() > 0.3,
        overall_score: 0.5 + Math.random() * 0.5,
        risk_level: Math.random() > 0.5 ? 'low' : 'medium',
        status: 'probable_live',
        component_scores: {
          blink: 0.7 + Math.random() * 0.3,
          movement: 0.6 + Math.random() * 0.4,
          texture: 0.8 + Math.random() * 0.2,
          screen: 0.9 + Math.random() * 0.1
        },
        checks_passed: {
          blink: Math.random() > 0.3,
          movement: Math.random() > 0.3,
          texture: Math.random() > 0.2,
          screen: Math.random() > 0.1
        },
        recommendations: [
          'ACCEPT: High confidence live person',
          'Proceed with face recognition'
        ]
      };

      return mockResult;
    } catch (error) {
      console.error('Liveness check error:', error);
      toast.error('Failed to perform liveness check');
      return null;
    }
  };

  const runVerificationSequence = async () => {
    setIsVerifying(true);
    setCapturedFrames([]);
    setResult(null);

    const frames: string[] = [];

    // Capture frames while showing instructions
    for (let i = 0; i < instructions.length; i++) {
      setCurrentInstruction(instructions[i]);

      // Wait for instruction duration
      await new Promise(resolve => {
        instructionTimerRef.current = setTimeout(resolve, 2000);
      });

      // Capture frame
      const frame = captureFrame();
      if (frame) {
        frames.push(frame);
        setCapturedFrames(prev => [...prev, frame]);
      }
    }

    setCurrentInstruction('Analyzing...');

    // Perform liveness check on last frame (or could be aggregate of all frames)
    const lastFrame = frames[frames.length - 1];
    if (lastFrame) {
      const livenessResult = await performLivenessCheck(lastFrame);

      if (livenessResult) {
        setResult(livenessResult);

        // Show result notification
        if (livenessResult.is_live && livenessResult.overall_score >= minScore) {
          toast.success('Liveness verified! You are a real person.', {
            description: `Confidence: ${(livenessResult.overall_score * 100).toFixed(1)}%`
          });
        } else {
          toast.error('Liveness verification failed', {
            description: 'Please try again with better lighting and clear visibility'
          });
        }

        // Callback with result
        if (onVerificationComplete) {
          onVerificationComplete(livenessResult);
        }
      }
    }

    setIsVerifying(false);
    setCurrentInstruction('');
  };

  const startVerification = async () => {
    const cameraStarted = await startCamera();
    if (cameraStarted) {
      setIsActive(true);
      // Wait for video to be ready
      setTimeout(() => {
        runVerificationSequence();
      }, 1000);
    }
  };

  const stopVerification = () => {
    setIsActive(false);
    setIsVerifying(false);
    setCurrentInstruction('');
    if (instructionTimerRef.current) {
      clearTimeout(instructionTimerRef.current);
    }
    stopCamera();
  };

  const retryVerification = () => {
    setResult(null);
    runVerificationSequence();
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getStatusBadge = (status: string) => {
    if (status.includes('high_confidence')) return 'success';
    if (status.includes('probable')) return 'primary';
    if (status.includes('uncertain')) return 'warning';
    return 'error';
  };

  return (
    <div className="space-y-4">
      {/* Camera Preview */}
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Liveness Verification
          </CardTitle>
          <CardDescription>
            Complete the verification process to confirm you are a real person
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden">
            {/* Video Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlay Instructions */}
            {isVerifying && currentInstruction && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <div className="mb-4">
                    {currentInstruction === 'Analyzing...' ? (
                      <Loader className="w-12 h-12 text-white animate-spin mx-auto" />
                    ) : (
                      <Sparkles className="w-12 h-12 text-white animate-pulse mx-auto" />
                    )}
                  </div>
                  <p className="text-white text-xl font-semibold">{currentInstruction}</p>
                </div>
              </div>
            )}

            {/* Start Overlay */}
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300 mb-4">Click start to begin verification</p>
                  <Button variant="primary" onClick={startVerification} leftIcon={<Camera className="w-4 h-4" />}>
                    Start Verification
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          {isActive && !isVerifying && (
            <div className="flex justify-center gap-3 mt-4">
              <Button variant="outline" onClick={stopVerification}>
                Cancel
              </Button>
              {result && (
                <Button variant="primary" onClick={retryVerification}>
                  Retry Verification
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      {showInstructions && !result && (
        <Card glass>
          <CardHeader>
            <CardTitle className="text-sm">Verification Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {instructions.map((instruction, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-sm ${
                    currentInstruction === instruction
                      ? 'text-primary font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    currentInstruction === instruction
                      ? 'bg-primary text-white'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}>
                    {idx + 1}
                  </div>
                  <span>{instruction}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card glass className={`border-2 ${
          result.is_live ? 'border-green-500' : 'border-red-500'
        }`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {result.is_live ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                Verification {result.is_live ? 'Successful' : 'Failed'}
              </CardTitle>
              <Badge variant={getStatusBadge(result.status)}>
                {result.status.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Confidence</span>
                <span className={`text-2xl font-bold ${getRiskColor(result.risk_level)}`}>
                  {(result.overall_score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    result.overall_score > 0.75 ? 'bg-green-500' :
                    result.overall_score > 0.5 ? 'bg-blue-500' :
                    result.overall_score > 0.3 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.overall_score * 100}%` }}
                />
              </div>
            </div>

            {/* Component Checks */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${result.checks_passed.blink ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Eye className={`w-4 h-4 ${result.checks_passed.blink ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="text-xs font-semibold">Blink Detection</span>
                </div>
                <p className="text-xl font-bold">{(result.component_scores.blink * 100).toFixed(0)}%</p>
              </div>

              <div className={`p-3 rounded-lg ${result.checks_passed.movement ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Move className={`w-4 h-4 ${result.checks_passed.movement ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="text-xs font-semibold">Head Movement</span>
                </div>
                <p className="text-xl font-bold">{(result.component_scores.movement * 100).toFixed(0)}%</p>
              </div>

              <div className={`p-3 rounded-lg ${result.checks_passed.texture ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className={`w-4 h-4 ${result.checks_passed.texture ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="text-xs font-semibold">Texture Analysis</span>
                </div>
                <p className="text-xl font-bold">{(result.component_scores.texture * 100).toFixed(0)}%</p>
              </div>

              <div className={`p-3 rounded-lg ${result.checks_passed.screen ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Monitor className={`w-4 h-4 ${result.checks_passed.screen ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="text-xs font-semibold">Screen Detection</span>
                </div>
                <p className="text-xl font-bold">{(result.component_scores.screen * 100).toFixed(0)}%</p>
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Recommendations:</p>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
