import React, { useState } from 'react';
import { ScanFace, Camera, Activity, CheckCircle2, AlertTriangle, User as UserIcon, Inbox } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LiveRecognitionCanvas } from '../../components/webcam/LiveRecognitionCanvas';
import { useBiometricStore } from '../../store/useBiometricStore';

export const LiveRecognitionPage: React.FC = () => {
  const { cameras, attendance } = useBiometricStore();
  const [selectedCameraId, setSelectedCameraId] = useState<string>(cameras[0]?.id || 'cam-01');
  const [gridMode, setGridMode] = useState<'single' | 'grid'>('single');

  const selectedCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ScanFace className="w-6 h-6 text-primary" /> Live Recognition Feed
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time biometric computer vision stream analysis & enrolled user matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={gridMode === 'single' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setGridMode('single')}
          >
            Single Focus
          </Button>
          <Button
            variant={gridMode === 'grid' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setGridMode('grid')}
          >
            Multi Grid
          </Button>
        </div>
      </div>

      {/* Camera Selection Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {cameras.map((cam) => (
          <button
            key={cam.id}
            onClick={() => {
              setSelectedCameraId(cam.id);
              setGridMode('single');
            }}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCameraId === cam.id && gridMode === 'single'
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{cam.name}</span>
            <Badge variant={cam.status === 'online' ? 'success' : 'danger'} className="text-[9px] py-0 px-1">
              {cam.status.toUpperCase()}
            </Badge>
          </button>
        ))}
      </div>

      {/* Main View Layout */}
      {gridMode === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Active Camera Monitor */}
          <div className="lg:col-span-2">
            {selectedCamera && <LiveRecognitionCanvas camera={selectedCamera} />}
          </div>

          {/* Right: Live Log Feed & Real Events */}
          <Card glass className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" /> Recognition Event Timeline
              </CardTitle>
              <CardDescription>Live biometric detection stream logs</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
              {attendance.length > 0 ? (
                attendance.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {evt.userAvatar ? (
                        <img src={evt.userAvatar} alt={evt.userName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/30 font-bold text-xs shrink-0">
                          <UserIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {evt.userName}
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {evt.location} • <span className="font-mono">{evt.clockIn}</span>
                        </p>
                      </div>
                    </div>

                    <Badge variant="success">
                      {evt.confidenceScore}%
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 mb-2">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Detection Logs Yet</p>
                  <p className="text-[11px] text-slate-500 mt-1">Enroll users to start logging real-time clock-in events.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Multi-Grid Camera Matrix */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cameras.map((cam) => (
            <div key={cam.id} className="space-y-2">
              <LiveRecognitionCanvas camera={cam} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
