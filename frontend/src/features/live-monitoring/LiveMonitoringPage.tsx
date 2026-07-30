import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { 
  Activity, Camera, Users, ShieldAlert, CheckCircle2, 
  AlertTriangle, Clock, Radio, TrendingUp, Eye, Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface MonitoringStats {
  cameras: {
    total: number;
    active: number;
    offline: number;
  };
  users: {
    total: number;
    active_today: number;
  };
  attendance: {
    today_total: number;
    recent_hour: number;
    average_confidence: number;
  };
  unknown_faces: {
    last_24h: number;
  };
  system: {
    status: string;
    last_update: string;
  };
}

interface LiveFeedItem {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  department: string;
  clock_in: string;
  confidence: number;
  camera_name: string;
  location: string;
  status: string;
  timestamp: string;
}

interface UnknownFaceAlert {
  id: string;
  camera_id: string;
  camera_name: string;
  location: string;
  confidence_score: number;
  snapshot_url: string;
  status: string;
  captured_at: string;
}

export const LiveMonitoringPage: React.FC = () => {
  const [stats, setStats] = useState<MonitoringStats>({
    cameras: { total: 0, active: 0, offline: 0 },
    users: { total: 0, active_today: 0 },
    attendance: { today_total: 0, recent_hour: 0, average_confidence: 0 },
    unknown_faces: { last_24h: 0 },
    system: { status: 'loading', last_update: '' }
  });
  
  const [liveFeed, setLiveFeed] = useState<LiveFeedItem[]>([]);
  const [unknownFaces, setUnknownFaces] = useState<UnknownFaceAlert[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // WebSocket connection
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/api/v1/ws`;
    
    try {
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
        toast.success('Real-time monitoring connected');
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
        setWsConnected(false);
      };
      
      websocket.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 5000);
      };
      
      setWs(websocket);
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setWsConnected(false);
    }
  };

  const handleWebSocketMessage = (message: any) => {
    const { type, data } = message;
    
    switch (type) {
      case 'monitoring_stats':
        // Update statistics in real-time
        setStats(prev => ({
          cameras: {
            total: prev.cameras.total,
            active: data.active_cameras || prev.cameras.active,
            offline: data.offline_cameras || prev.cameras.offline
          },
          users: {
            total: prev.users.total,
            active_today: data.active_users || prev.users.active_today
          },
          attendance: {
            today_total: data.total_attendance_today || prev.attendance.today_total,
            recent_hour: data.live_detections || prev.attendance.recent_hour,
            average_confidence: prev.attendance.average_confidence
          },
          unknown_faces: {
            last_24h: data.unknown_faces || prev.unknown_faces.last_24h
          },
          system: {
            status: 'operational',
            last_update: data.last_update || new Date().toISOString()
          }
        }));
        break;
        
      case 'attendance':
        // Add new attendance to live feed in real-time
        const newAttendance: LiveFeedItem = {
          id: data.user_id + '-' + Date.now(),
          user_id: data.user_id,
          user_name: data.user_name,
          user_avatar: data.avatar,
          department: data.department,
          clock_in: data.clock_in,
          confidence: data.confidence,
          camera_name: data.camera_name,
          location: data.location,
          status: data.status,
          timestamp: data.timestamp
        };
        
        setLiveFeed(prev => [newAttendance, ...prev.slice(0, 19)]);
        
        // Show toast notification for new detection
        toast.success(`${data.user_name} checked in`, {
          description: `${data.location} • ${data.confidence}% confidence`
        });
        break;
        
      case 'unknown_face':
        // Add unknown face alert in real-time
        const newUnknown: UnknownFaceAlert = {
          id: data.face_id,
          camera_id: data.camera_id,
          camera_name: data.camera_name,
          location: data.location,
          confidence_score: data.confidence,
          snapshot_url: data.snapshot_url,
          status: 'unassigned',
          captured_at: data.timestamp
        };
        
        setUnknownFaces(prev => [newUnknown, ...prev.slice(0, 4)]);
        
        // Show alert notification
        toast.error('Unknown face detected!', {
          description: `${data.camera_name} • ${data.location}`
        });
        break;
        
      case 'camera_status':
        // Camera status changed
        toast.info(`Camera ${data.camera_id} is now ${data.status}`, {
          description: data.location
        });
        fetchMonitoringStats(); // Refresh stats
        break;
        
      case 'detection':
        // Live detection event (more frequent than attendance)
        console.log('Live detection:', data);
        break;
        
      case 'system_alert':
        // System alerts
        const toastMethod = data.severity === 'error' ? toast.error : 
                           data.severity === 'warning' ? toast.warning : toast.info;
        toastMethod(data.alert_type, {
          description: data.message
        });
        break;
        
      default:
        console.log('Unknown WebSocket message type:', type);
    }
  };

  // Fetch initial monitoring stats
  useEffect(() => {
    fetchMonitoringStats();
    fetchLiveFeed();
    fetchUnknownFaces();
    
    // Poll every 30 seconds as fallback (less frequent since WebSocket handles real-time)
    const interval = setInterval(() => {
      if (!wsConnected) {
        fetchMonitoringStats();
        fetchLiveFeed();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [wsConnected]);

  const fetchMonitoringStats = async () => {
    try {
      const response = await fetch('/api/v1/monitoring/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching monitoring stats:', error);
    }
  };

  const fetchLiveFeed = async () => {
    try {
      const response = await fetch('/api/v1/monitoring/live-feed?limit=20');
      const data = await response.json();
      setLiveFeed(data.feed || []);
    } catch (error) {
      console.error('Error fetching live feed:', error);
    }
  };

  const fetchUnknownFaces = async () => {
    try {
      const response = await fetch('/api/v1/monitoring/unknown-faces-alert?limit=5');
      const data = await response.json();
      setUnknownFaces(data.alerts || []);
    } catch (error) {
      console.error('Error fetching unknown faces:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'operational': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-primary animate-pulse" />
            Live Monitoring Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time system monitoring with WebSocket updates
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={wsConnected ? 'success' : 'secondary'} className="animate-pulse">
            <Activity className="w-3 h-3 mr-1" />
            {wsConnected ? 'Live Connected' : 'Polling Mode'}
          </Badge>
          <Badge variant={getStatusColor(stats.system.status)}>
            System: {stats.system.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card glass className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Cameras</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.cameras.active}</p>
          <p className="text-xs text-slate-500 mt-1">of {stats.cameras.total} total</p>
        </Card>

        <Card glass className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-xs font-semibold text-red-500 uppercase">Offline</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.cameras.offline}</p>
          <p className="text-xs text-slate-500 mt-1">cameras down</p>
        </Card>

        <Card glass className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-xs font-semibold text-green-500 uppercase">Active Users</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.users.active_today}</p>
          <p className="text-xs text-slate-500 mt-1">checked in today</p>
        </Card>

        <Card glass className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-500 uppercase">Attendance</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{stats.attendance.today_total}</p>
          <p className="text-xs text-slate-500 mt-1">records today</p>
        </Card>

        <Card glass className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-semibold text-orange-500 uppercase">Live Detections</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{stats.attendance.recent_hour}</p>
          <p className="text-xs text-slate-500 mt-1">last hour</p>
        </Card>

        <Card glass className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span className="text-xs font-semibold text-rose-500 uppercase">Unknown</span>
          </div>
          <p className="text-3xl font-bold text-rose-600">{stats.unknown_faces.last_24h}</p>
          <p className="text-xs text-slate-500 mt-1">last 24h</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Attendance Feed */}
        <Card glass className="lg:col-span-2">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
                Live Attendance Feed
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                {liveFeed.length} Recent
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
              {liveFeed.length > 0 ? (
                liveFeed.map((item, idx) => (
                  <div 
                    key={item.id || idx}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex items-center gap-4"
                  >
                    <img 
                      src={item.user_avatar || `https://ui-avatars.com/api/?name=${item.user_name}`}
                      alt={item.user_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {item.user_name}
                        </p>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      </div>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.department} • {item.location}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.clock_in}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          {item.camera_name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <Badge variant="success" className="mb-1">
                        {item.confidence}%
                      </Badge>
                      <p className="text-xs text-slate-400 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No recent detections</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unknown Faces Alert Panel */}
        <Card glass className="flex flex-col">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Unknown Faces Alert
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 p-0">
            <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
              {unknownFaces.length > 0 ? (
                unknownFaces.map((face, idx) => (
                  <div 
                    key={face.id || idx}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <img 
                        src={face.snapshot_url}
                        alt="Unknown Face"
                        className="w-16 h-16 rounded-lg object-cover border-2 border-rose-500"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="error" className="text-xs">
                            UNKNOWN
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {face.confidence_score}%
                          </Badge>
                        </div>
                        
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {face.camera_name}
                        </p>
                        
                        <p className="text-xs text-slate-500 mt-0.5">
                          {face.location}
                        </p>
                        
                        <p className="text-xs text-slate-400 font-mono mt-1">
                          {new Date(face.captured_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No unknown faces detected</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Performance */}
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            System Performance
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Average Recognition Confidence
              </p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-primary">
                  {stats.attendance.average_confidence.toFixed(1)}%
                </p>
                <Badge variant="success" className="mb-1">Excellent</Badge>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Camera Network Health
              </p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-primary">
                  {stats.cameras.total > 0 
                    ? ((stats.cameras.active / stats.cameras.total) * 100).toFixed(0) 
                    : 0}%
                </p>
                <Badge 
                  variant={stats.cameras.offline === 0 ? 'success' : 'warning'} 
                  className="mb-1"
                >
                  {stats.cameras.offline === 0 ? 'Optimal' : 'Check Required'}
                </Badge>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                User Engagement Rate
              </p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-primary">
                  {stats.users.total > 0 
                    ? ((stats.users.active_today / stats.users.total) * 100).toFixed(0) 
                    : 0}%
                </p>
                <Badge variant="secondary" className="mb-1">Today</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
