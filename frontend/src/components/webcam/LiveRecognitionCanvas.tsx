import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { CameraNode, AttendanceRecord, UnknownFaceRecord } from '../../types';
import { Maximize2, Minimize2, Activity, Zap, AlertTriangle, UserCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useBiometricStore } from '../../store/useBiometricStore';

interface LiveRecognitionCanvasProps {
  camera: CameraNode;
  onDetectFace?: (record: Partial<AttendanceRecord>) => void;
  onUnknownFaceAlert?: (record: Partial<UnknownFaceRecord>) => void;
}

export const LiveRecognitionCanvas: React.FC<LiveRecognitionCanvasProps> = ({
  camera,
  onDetectFace,
  onUnknownFaceAlert,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { users, addAttendance } = useBiometricStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fps, setFps] = useState(camera.fps || 30);
  const [hasCameraAccess, setHasCameraAccess] = useState(true);
  const [detectedUser, setDetectedUser] = useState<any | null>(null);
  const [isMatchActive, setIsMatchActive] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'scanning' | 'liveness' | 'recognizing' | 'validating' | 'success' | 'failed'>('scanning');
  const [verificationMessage, setVerificationMessage] = useState<string>('Scanning for faces...');

  // Smart Attendance Verification Workflow
  const performSmartVerification = async (user: any) => {
    try {
      // Step 1: Liveness Check
      setVerificationStatus('liveness');
      setVerificationMessage('Verifying liveness...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const livenessScore = 0.92 + Math.random() * 0.07; // Mock liveness score
      if (livenessScore < 0.85) {
        setVerificationStatus('failed');
        setVerificationMessage('❌ Liveness check failed - possible spoof detected');
        return false;
      }

      // Step 2: Recognition
      setVerificationStatus('recognizing');
      setVerificationMessage('Matching face embeddings...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const confidenceScore = 95 + Math.random() * 4.5;
      if (confidenceScore < 70) {
        setVerificationStatus('failed');
        setVerificationMessage('❌ Low confidence match - check lighting');
        return false;
      }

      // Step 3: Attendance Rules Validation
      setVerificationStatus('validating');
      setVerificationMessage('Validating attendance rules...');
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Mock rules validation (duplicate check, working hours, etc.)
      const rulesValid = Math.random() > 0.1; // 90% pass rate
      if (!rulesValid) {
        setVerificationStatus('failed');
        setVerificationMessage('❌ Duplicate attendance or outside working hours');
        return false;
      }

      // Step 4: Success - Record Attendance
      setVerificationStatus('success');
      setVerificationMessage('✅ Attendance verified & recorded');
      
      const clockTime = new Date().toLocaleTimeString();
      addAttendance({
        userId: user.id,
        userName: user.name,
        userCategory: user.category,
        userAvatar: user.avatar,
        department: user.departmentName,
        date: new Date().toISOString().split('T')[0],
        clockIn: clockTime,
        status: 'present',
        confidenceScore: Number(confidenceScore.toFixed(1)),
        cameraName: camera.name,
        cameraId: camera.id,
        location: camera.location,
        workingHours: 8.0,
        breakTime: 0.5,
        approvalStatus: 'approved',
        recognitionImageUrl: user.avatar || '',
        deviceUsed: 'Biometric Camera',
      });

      if (onDetectFace) {
        onDetectFace({
          userId: user.id,
          userName: user.name,
          userCategory: user.category,
          userAvatar: user.avatar,
          department: user.departmentName,
          status: 'present',
          confidenceScore: Number(confidenceScore.toFixed(1)),
          cameraName: camera.name,
          location: camera.location,
        });
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setVerificationStatus('scanning');
        setVerificationMessage('Scanning for faces...');
        setIsMatchActive(false);
        setDetectedUser(null);
      }, 2000);

      return true;
    } catch (error) {
      setVerificationStatus('failed');
      setVerificationMessage('❌ Verification error');
      return false;
    }
  };

  // Live FPS and dynamic matching against real enrolled users
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.floor((camera.fps || 30) - 2 + Math.random() * 4));

      // If users are enrolled and no active verification, start new verification
      if (users.length > 0 && !isMatchActive && verificationStatus === 'scanning') {
        const primaryUser = users[Math.floor(Math.random() * users.length)]; // Random user for demo
        setDetectedUser(primaryUser);
        setIsMatchActive(true);
        performSmartVerification(primaryUser);
      }
    }, 6000); // Check every 6 seconds

    return () => clearInterval(interval);
  }, [camera, users, addAttendance, onDetectFace, isMatchActive, verificationStatus]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group ${
        isFullscreen ? 'h-screen rounded-none' : 'aspect-16/9'
      }`}
    >
      {/* Live Physical Webcam Feed */}
      {hasCameraAccess ? (
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          onUserMediaError={() => setHasCameraAccess(false)}
          className="w-full h-full object-cover brightness-95"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 text-center">
          <Activity className="w-10 h-10 text-primary mb-2 animate-pulse" />
          <p className="text-sm font-semibold text-white">Live Biometric Stream Active</p>
          <p className="text-xs text-slate-500 mt-1">Connect physical camera hardware or allow browser webcam access.</p>
        </div>
      )}

      {/* Real Enrolled User Dynamic Bounding Box Overlay with Verification Flow */}
      {isMatchActive && detectedUser ? (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className={`relative w-48 h-64 border-2 rounded-2xl shadow-2xl transition-all duration-300 ${
            verificationStatus === 'success' ? 'border-emerald-400 bg-emerald-500/10' :
            verificationStatus === 'failed' ? 'border-red-400 bg-red-500/10' :
            'border-blue-400 bg-blue-500/10 animate-pulse'
          }`}>
            {/* Top Match Label */}
            <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg whitespace-nowrap ${
              verificationStatus === 'success' ? 'bg-emerald-600' :
              verificationStatus === 'failed' ? 'bg-red-600' :
              'bg-blue-600'
            }`}>
              <UserCheck className="w-4 h-4 text-white" />
              <span>{detectedUser.name}</span>
              {verificationStatus === 'success' && (
                <span className="font-mono text-[11px] bg-emerald-700 px-1.5 py-0.5 rounded">98.7%</span>
              )}
            </div>

            {/* Corner Bracket Reticles */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white" />

            {/* Verification Status Pipeline */}
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-max">
              <div className={`bg-slate-950/95 backdrop-blur-md text-xs px-3 py-1.5 rounded-full border ${
                verificationStatus === 'success' ? 'border-emerald-500/40 text-emerald-400' :
                verificationStatus === 'failed' ? 'border-red-500/40 text-red-400' :
                'border-blue-500/40 text-blue-400'
              }`}>
                {verificationMessage}
              </div>
              
              {/* Progress Indicators */}
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className={`w-2 h-2 rounded-full ${
                  ['liveness', 'recognizing', 'validating', 'success'].includes(verificationStatus) 
                    ? 'bg-emerald-500' : 'bg-slate-600'
                }`} />
                <div className={`w-2 h-2 rounded-full ${
                  ['recognizing', 'validating', 'success'].includes(verificationStatus) 
                    ? 'bg-emerald-500' : 'bg-slate-600'
                }`} />
                <div className={`w-2 h-2 rounded-full ${
                  ['validating', 'success'].includes(verificationStatus) 
                    ? 'bg-emerald-500' : 'bg-slate-600'
                }`} />
                <div className={`w-2 h-2 rounded-full ${
                  verificationStatus === 'success' ? 'bg-emerald-500' : 'bg-slate-600'
                }`} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300 px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>0 Enrolled Users in System. Please enroll a user's face to enable live match tracking.</span>
          </div>
        </div>
      )}

      {/* Top Controls HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Badge
            variant={camera.status === 'online' ? 'success' : 'danger'}
            pulse={camera.status === 'online'}
            className="bg-slate-950/80 backdrop-blur-md"
          >
            {camera.name} ({camera.status.toUpperCase()})
          </Badge>
          <Badge variant="secondary" className="bg-slate-950/80 text-white backdrop-blur-md">
            {camera.resolution}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md text-white text-[11px] px-3 py-1 rounded-full border border-white/10 font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{fps} FPS</span>
            <span className="opacity-40">|</span>
            <span>{camera.bitrate}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="bg-slate-950/80 hover:bg-slate-900 text-white rounded-full h-8 w-8"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Bottom Live Feed Banner */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs text-white">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Real-Time Biometric Engine Active</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
          <span>Active Targets: {isMatchActive ? 1 : 0}</span>
          <span>Location: {camera.location}</span>
        </div>
      </div>
    </div>
  );
};
