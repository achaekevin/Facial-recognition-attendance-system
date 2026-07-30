import React, { useState } from 'react';
import { CameraNode } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useBiometricStore } from '../../store/useBiometricStore';
import { Camera, Plus, Activity, HardDrive, Wifi, Eye, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const CameraPage: React.FC = () => {
  const { cameras, addCamera, deleteCamera } = useBiometricStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [ipAddress, setIpAddress] = useState('192.168.1.110');
  const [streamUrl, setStreamUrl] = useState('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80');

  const handleAddCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) {
      toast.error('Please enter camera name and location.');
      return;
    }

    addCamera({
      name,
      location,
      department: 'Campus Security & Operations',
      streamUrl,
      status: 'online',
      ipAddress,
      resolution: '1080p Full HD (30fps)',
      fps: 30,
      bitrate: '4.0 Mbps',
      activeRecognitionCount: 0,
      totalDetectionsToday: 0,
      recordingStatus: 'recording',
      storageUsedGB: 120,
      bandwidthMbps: 4.0,
      groupName: 'Perimeter Access',
      lastPingAt: 'Just now',
    });

    toast.success(`Camera node "${name}" registered successfully!`);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" /> Camera Nodes & RTSP Monitoring
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage biometric camera hardware, RTSP video streams, and network health monitoring.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Register New Camera Node
        </Button>
      </div>

      {/* Grid of Camera Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cameras.map((cam) => (
          <Card key={cam.id} glass className="overflow-hidden flex flex-col justify-between group">
            {/* Stream Snapshot Frame */}
            <div className="relative aspect-16/9 bg-slate-950">
              <img src={cam.streamUrl} alt={cam.name} className="w-full h-full object-cover brightness-90" />
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <Badge
                  variant={cam.status === 'online' ? 'success' : cam.status === 'warning' ? 'warning' : 'danger'}
                  pulse={cam.status === 'online'}
                  className="bg-slate-950/80 backdrop-blur-md"
                >
                  {cam.status.toUpperCase()}
                </Badge>
              </div>
              <div className="absolute bottom-2 right-2 bg-slate-950/80 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                {cam.fps} FPS | {cam.resolution}
              </div>
            </div>

            {/* Info */}
            <CardHeader className="pb-2">
              <CardTitle className="text-base truncate">{cam.name}</CardTitle>
              <CardDescription>{cam.location} • IP: {cam.ipAddress}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-2 text-xs py-0">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> Bitrate</span>
                <span className="font-mono text-slate-900 dark:text-white font-medium">{cam.bitrate}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> Storage</span>
                <span className="font-mono text-slate-900 dark:text-white font-medium">{cam.storageUsedGB} GB</span>
              </div>
            </CardContent>

            <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between mt-3">
              <Button variant="ghost" size="sm" onClick={() => deleteCamera(cam.id)} className="text-rose-500 hover:text-rose-600">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                Stream Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Add Camera Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Biometric Camera Node"
        description="Add a new IP / RTSP video camera feed to the facial recognition network."
      >
        <form onSubmit={handleAddCamera} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Camera Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Science Wing Entrance Camera 04"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Physical Location
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Building B Level 2 Lobby"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              IP Address
            </label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="192.168.1.115"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              RTSP Stream / Snapshot URL
            </label>
            <input
              type="text"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Node
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
