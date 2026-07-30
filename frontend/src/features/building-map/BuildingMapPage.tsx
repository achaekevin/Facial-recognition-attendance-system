import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { 
  MapPin, Camera, Activity, AlertTriangle, CheckCircle2, 
  Maximize2, X, Building2, Layers, Eye, Radio
} from 'lucide-react';
import { toast } from 'sonner';

interface CameraPosition {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  resolution: string;
  fps: number;
  stream_url?: string;
  recent_detections: number;
  coordinates: {
    x: number | null;
    y: number | null;
  };
}

export const BuildingMapPage: React.FC = () => {
  const [cameras, setCameras] = useState<CameraPosition[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<CameraPosition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapView, setMapView] = useState<'floor1' | 'floor2' | 'floor3' | 'all'>('all');
  const [showOffline, setShowOffline] = useState(true);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    fetchCameras();
    connectWebSocket();
    
    const interval = setInterval(fetchCameras, 30000); // Fallback polling
    
    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, []);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/api/v1/ws`;
    
    try {
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('Building Map WebSocket connected');
      };
      
      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      websocket.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        setTimeout(connectWebSocket, 5000);
      };
      
      setWs(websocket);
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (message: any) => {
    const { type, data } = message;
    
    switch (type) {
      case 'camera_status':
        // Update camera status in real-time
        setCameras(prev => prev.map(cam => 
          cam.id === data.camera_id 
            ? { ...cam, status: data.status }
            : cam
        ));
        break;
        
      case 'detection':
      case 'attendance':
        // Increment recent detections count for the camera
        setCameras(prev => prev.map(cam => 
          cam.id === data.camera_id 
            ? { ...cam, recent_detections: cam.recent_detections + 1 }
            : cam
        ));
        break;
        
      default:
        break;
    }
  };

  const fetchCameras = async () => {
    try {
      const response = await fetch('/api/v1/monitoring/active-cameras');
      const data = await response.json();
      setCameras(data.cameras || []);
    } catch (error) {
      console.error('Error fetching cameras:', error);
      toast.error('Failed to load camera data');
    }
  };

  const handleCameraClick = (camera: CameraPosition) => {
    setSelectedCamera(camera);
    setIsModalOpen(true);
  };

  const getCamerasByFloor = (floor: string) => {
    // Mock floor assignment - in real app, this would come from backend
    const floorMap: { [key: string]: string[] } = {
      floor1: ['CAM-001', 'CAM-002', 'CAM-003'],
      floor2: ['CAM-004', 'CAM-005', 'CAM-006'],
      floor3: ['CAM-007', 'CAM-008']
    };
    
    if (floor === 'all') return cameras;
    
    return cameras.filter(cam => {
      const camNum = cam.id.split('-')[1];
      return floorMap[floor]?.includes(`CAM-${camNum}`);
    });
  };

  const getDefaultPosition = (index: number, total: number) => {
    // Distribute cameras in a grid if no coordinates provided
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      x: 15 + (col * 30),
      y: 15 + (row * 30)
    };
  };

  const displayedCameras = getCamerasByFloor(mapView).filter(
    cam => showOffline || cam.status === 'online'
  );

  const onlineCameras = displayedCameras.filter(c => c.status === 'online').length;
  const offlineCameras = displayedCameras.filter(c => c.status === 'offline').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Interactive Building Map
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Campus camera network visualization with live status
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="success">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {onlineCameras} Online
          </Badge>
          <Badge variant="error">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {offlineCameras} Offline
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <Card glass className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Floor View:</span>
            <div className="flex gap-1">
              {['all', 'floor1', 'floor2', 'floor3'].map((floor) => (
                <Button
                  key={floor}
                  variant={mapView === floor ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setMapView(floor as any)}
                >
                  {floor === 'all' ? 'All Floors' : `Floor ${floor.slice(-1)}`}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showOffline"
              checked={showOffline}
              onChange={(e) => setShowOffline(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <label htmlFor="showOffline" className="text-sm text-slate-700 dark:text-slate-300">
              Show Offline Cameras
            </label>
          </div>
        </div>
      </Card>

      {/* Interactive Map Canvas */}
      <Card glass className="overflow-hidden">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Campus Map - {mapView === 'all' ? 'All Floors' : `Floor ${mapView.slice(-1)}`}
            </span>
            <Badge variant="secondary" className="text-xs">
              {displayedCameras.length} Cameras
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="relative w-full bg-slate-50 dark:bg-slate-900/50" style={{ height: '600px' }}>
            {/* Building Layout Grid */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-300 dark:text-slate-700" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Building Outline */}
              <rect 
                x="10%" 
                y="10%" 
                width="80%" 
                height="80%" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="text-slate-400 dark:text-slate-600"
                rx="8"
              />
            </svg>

            {/* Camera Markers */}
            <div className="absolute inset-0" style={{ zIndex: 1 }}>
              {displayedCameras.map((camera, index) => {
                const pos = camera.coordinates.x && camera.coordinates.y
                  ? { x: camera.coordinates.x, y: camera.coordinates.y }
                  : getDefaultPosition(index, displayedCameras.length);

                return (
                  <div
                    key={camera.id}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`
                    }}
                    onClick={() => handleCameraClick(camera)}
                  >
                    {/* Camera Marker */}
                    <div className={`relative ${
                      camera.status === 'online' 
                        ? 'animate-pulse-subtle' 
                        : ''
                    }`}>
                      {/* Status Ring */}
                      <div className={`absolute inset-0 rounded-full ${
                        camera.status === 'online'
                          ? 'bg-emerald-500/20 animate-ping'
                          : 'bg-red-500/20'
                      }`} />
                      
                      {/* Camera Icon */}
                      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 transition-transform group-hover:scale-110 ${
                        camera.status === 'online'
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'bg-red-500 border-red-600 text-white'
                      }`}>
                        <Camera className="w-5 h-5" />
                        
                        {/* Activity Indicator */}
                        {camera.recent_detections > 0 && camera.status === 'online' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white">
                            {camera.recent_detections}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Camera Label - shows on hover */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-slate-900 dark:bg-slate-800 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap text-xs">
                        <p className="font-bold">{camera.name}</p>
                        <p className="text-slate-300">{camera.location}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={camera.status === 'online' ? 'success' : 'error'} className="text-[10px]">
                            {camera.status.toUpperCase()}
                          </Badge>
                          {camera.recent_detections > 0 && (
                            <Badge variant="warning" className="text-[10px]">
                              {camera.recent_detections} detections
                            </Badge>
                          )}
                        </div>
                      </div>
                      {/* Arrow pointer */}
                      <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 z-10">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">Legend</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Camera className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Online Camera</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <Camera className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Offline Camera</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center relative">
                    <Camera className="w-3 h-3 text-white" />
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full text-white text-[8px] flex items-center justify-center">
                      5
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Active Detections</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera Detail Modal */}
      {selectedCamera && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Camera: ${selectedCamera.name}`}
          description={selectedCamera.location}
        >
          <div className="space-y-4">
            {/* Camera Feed Preview */}
            <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden">
              {selectedCamera.stream_url ? (
                <iframe
                  src={selectedCamera.stream_url}
                  className="w-full h-full"
                  title={`${selectedCamera.name} Feed`}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Live feed preview</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedCamera.status === 'online' ? 'Stream active' : 'Camera offline'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Status Overlay */}
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge 
                  variant={selectedCamera.status === 'online' ? 'success' : 'error'}
                  pulse={selectedCamera.status === 'online'}
                >
                  {selectedCamera.status.toUpperCase()}
                </Badge>
                <Badge variant="secondary">
                  <Radio className="w-3 h-3 mr-1" />
                  {selectedCamera.fps} FPS
                </Badge>
              </div>
            </div>

            {/* Camera Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Resolution</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedCamera.resolution}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Frame Rate</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedCamera.fps} FPS
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Recent Detections</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedCamera.recent_detections} (last hour)
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Location</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {selectedCamera.location}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button 
                variant="primary" 
                leftIcon={<Eye className="w-4 h-4" />}
                disabled={selectedCamera.status === 'offline'}
              >
                View Full Feed
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
