import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { 
  Play, Clock, User, Camera, CheckCircle2, Database, 
  Brain, Shield, ClipboardCheck, Save, Filter, 
  ChevronRight, History, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface RecognitionEvent {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  department: string;
  camera_id: string;
  camera_name: string;
  location: string;
  confidence_score: number;
  clock_in: string;
  status: string;
  snapshot_url: string;
  timestamp: string;
  date: string;
}

interface TimelineStep {
  step: number;
  title: string;
  description: string;
  timestamp: string;
  status: string;
  icon: string;
  details: Record<string, any>;
}

interface TimelineData {
  event_id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    department: string;
  };
  camera: {
    id: string;
    name: string;
    location: string;
  };
  timeline: TimelineStep[];
  total_duration: string;
  overall_status: string;
  confidence_score: number;
}

export const RecognitionReplayPage: React.FC = () => {
  const [events, setEvents] = useState<RecognitionEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<RecognitionEvent | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [playingStep, setPlayingStep] = useState<number>(-1);

  useEffect(() => {
    fetchEvents();
  }, [filterDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/replay/events?date=${filterDate}&limit=20`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load recognition events');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async (eventId: string) => {
    try {
      const response = await fetch(`/api/v1/replay/event/${eventId}/timeline`);
      const data = await response.json();
      setTimelineData(data);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      toast.error('Failed to load event timeline');
    }
  };

  const handleEventClick = async (event: RecognitionEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    setPlayingStep(-1);
    await fetchTimeline(event.id);
  };

  const playTimeline = () => {
    if (!timelineData) return;
    
    setPlayingStep(0);
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= timelineData.timeline.length) {
        clearInterval(interval);
        setPlayingStep(-1);
      } else {
        setPlayingStep(currentStep);
      }
    }, 800);
  };

  const getStepIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      'user-enter': User,
      'scan-face': Camera,
      'brain': Brain,
      'database': Database,
      'check-circle': CheckCircle2,
      'shield-check': Shield,
      'clipboard-check': ClipboardCheck,
      'save': Save,
      'camera': Camera
    };
    return icons[iconName] || CheckCircle2;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            Recognition Replay
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Replay and audit recognition events with detailed timeline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card
            key={event.id}
            glass
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => handleEventClick(event)}
          >
            <div className="relative aspect-video bg-slate-950 rounded-t-xl overflow-hidden">
              <img
                src={event.snapshot_url || event.user_avatar || `https://ui-avatars.com/api/?name=${event.user_name}`}
                alt={event.user_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="success">{event.confidence_score}%</Badge>
              </div>
              <div className="absolute bottom-2 left-2 bg-slate-950/80 text-white px-2 py-1 rounded text-xs">
                {event.clock_in}
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={event.user_avatar || `https://ui-avatars.com/api/?name=${event.user_name}`}
                  alt={event.user_name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {event.user_name}
                  </p>
                  <p className="text-xs text-slate-500">{event.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Camera className="w-3 h-3" />
                <span className="truncate">{event.camera_name}</span>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500">{event.date}</span>
                <Button variant="ghost" size="sm" className="text-xs">
                  <Play className="w-3 h-3 mr-1" />
                  Replay
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && !loading && (
        <Card glass className="p-12 text-center">
          <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No Events Found
          </h3>
          <p className="text-sm text-slate-500">
            No recognition events for {filterDate}
          </p>
        </Card>
      )}

      {/* Timeline Modal */}
      {selectedEvent && timelineData && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setPlayingStep(-1);
          }}
          title="Recognition Event Timeline"
          description={`Event replay for ${selectedEvent.user_name}`}
        >
          <div className="space-y-6">
            {/* Event Header */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <img
                src={timelineData.user.avatar || `https://ui-avatars.com/api/?name=${timelineData.user.name}`}
                alt={timelineData.user.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {timelineData.user.name}
                </h3>
                <p className="text-sm text-slate-500">{timelineData.user.department}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="success">
                    {timelineData.confidence_score}% Confidence
                  </Badge>
                  <Badge variant="secondary">
                    {timelineData.total_duration}
                  </Badge>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={playTimeline}
                leftIcon={<Play className="w-4 h-4" />}
                disabled={playingStep >= 0}
              >
                {playingStep >= 0 ? 'Playing...' : 'Play Timeline'}
              </Button>
            </div>

            {/* Timeline Steps */}
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800" />

              <div className="space-y-4">
                {timelineData.timeline.map((step, idx) => {
                  const StepIcon = getStepIcon(step.icon);
                  const isActive = playingStep === idx || playingStep === -1;
                  const isPast = playingStep > idx && playingStep !== -1;
                  
                  return (
                    <div
                      key={step.step}
                      className={`relative transition-all duration-300 ${
                        isActive ? 'opacity-100' : isPast ? 'opacity-100' : 'opacity-30'
                      }`}
                    >
                      {/* Step Circle */}
                      <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isPast ? 'bg-green-500 scale-100' :
                        playingStep === idx ? 'bg-primary scale-110 animate-pulse' :
                        'bg-slate-300 dark:bg-slate-700'
                      }`}>
                        <StepIcon className="w-5 h-5 text-white" />
                      </div>

                      {/* Step Content */}
                      <div className="ml-16 pb-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {step.step}. {step.title}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {step.description}
                              </p>
                            </div>
                            <span className="text-xs text-slate-500 font-mono">
                              {new Date(step.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          {/* Step Details */}
                          {(playingStep === idx || playingStep === -1) && (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(step.details).map(([key, value]) => (
                                  <div key={key} className="text-xs">
                                    <span className="text-slate-500">{key.replace(/_/g, ' ')}:</span>
                                    <span className="ml-1 font-medium text-slate-900 dark:text-white">
                                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arrow to next step */}
                      {idx < timelineData.timeline.length - 1 && (
                        <div className="absolute left-5 bottom-0 text-slate-400">
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-900 dark:text-green-300">
                  Recognition Complete
                </p>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                Attendance successfully recorded for {timelineData.user.name} at{' '}
                {timelineData.camera.location} with {timelineData.confidence_score}% confidence.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-2xl">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading events...</p>
          </div>
        </div>
      )}
    </div>
  );
};
