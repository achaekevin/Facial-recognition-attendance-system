import React, { useState, useEffect } from 'react';
import { UnknownFaceRecord } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useBiometricStore } from '../../store/useBiometricStore';
import { 
  ShieldAlert, UserCheck, Ban, Eye, CheckCircle2, Search, 
  FileText, AlertCircle, Users, Filter, ArrowUpDown, 
  GitCompare, Sparkles, Clock, Camera, MapPin, XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface SimilarUser {
  user_id: string;
  user_name: string;
  department: string;
  similarity_score: number;
  confidence: string;
  avatar?: string;
}

export const UnknownFacesPage: React.FC = () => {
  const { unknownFaces, resolveUnknownFace, users } = useBiometricStore();
  const [selectedRecord, setSelectedRecord] = useState<UnknownFaceRecord | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [assignedUserId, setAssignedUserId] = useState(users[0]?.id || '');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [similarUsers, setSimilarUsers] = useState<SimilarUser[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'priority'>('date');
  
  // Investigation queue stats
  const [queueStats, setQueueStats] = useState({
    total: 0,
    high_priority: 0,
    medium_priority: 0,
    low_priority: 0,
    pending: 0,
    under_investigation: 0
  });

  useEffect(() => {
    loadQueueStats();
  }, [unknownFaces]);

  const loadQueueStats = () => {
    const pending = unknownFaces.filter(f => f.status === 'unassigned').length;
    const investigating = unknownFaces.filter(f => f.status === 'pending').length;
    
    const highPriority = unknownFaces.filter(f => 
      f.confidenceScore < 30 && (f.status === 'unassigned' || f.status === 'pending')
    ).length;
    
    const mediumPriority = unknownFaces.filter(f => 
      f.confidenceScore >= 30 && f.confidenceScore < 50 && (f.status === 'unassigned' || f.status === 'pending')
    ).length;
    
    const lowPriority = unknownFaces.filter(f => 
      f.confidenceScore >= 50 && (f.status === 'unassigned' || f.status === 'pending')
    ).length;

    setQueueStats({
      total: unknownFaces.length,
      high_priority: highPriority,
      medium_priority: mediumPriority,
      low_priority: lowPriority,
      pending: pending,
      under_investigation: investigating
    });
  };

  const searchSimilarFaces = async (faceId: string) => {
    setLoadingSimilar(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSimilar: SimilarUser[] = users.slice(0, 5).map(user => ({
        user_id: user.id,
        user_name: user.name,
        department: user.departmentName || 'Unknown',
        similarity_score: 0.6 + Math.random() * 0.35,
        confidence: Math.random() > 0.5 ? 'high' : 'medium',
        avatar: user.avatar
      }));
      
      mockSimilar.sort((a, b) => b.similarity_score - a.similarity_score);
      setSimilarUsers(mockSimilar);
      
    } catch (error) {
      toast.error('Failed to search similar faces');
      console.error(error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleResolve = async (status: string) => {
    if (!selectedRecord) return;
    
    try {
      resolveUnknownFace(
        selectedRecord.id, 
        status as UnknownFaceRecord['status'], 
        status === 'assigned' ? assignedUserId : undefined
      );

      const targetUser = users.find((u) => u.id === assignedUserId);
      
      if (status === 'assigned') {
        toast.success('✅ Identity Confirmed!', {
          description: `Face assigned to ${targetUser?.name}. Investigation closed.`
        });
      } else if (status === 'blacklisted') {
        toast.error('🚫 Security Alert Triggered!', {
          description: 'Individual added to blacklist. Security team notified.'
        });
      } else if (status === 'whitelisted') {
        toast.success('✅ Approved for Future Enrollment', {
          description: 'Individual whitelisted for registration.'
        });
      } else if (status === 'rejected') {
        toast.info('False Positive Marked', {
          description: 'Record archived as false detection.'
        });
      }

      setIsResolveModalOpen(false);
      setResolutionNotes('');
      
    } catch (error) {
      toast.error('Failed to resolve investigation');
      console.error(error);
    }
  };

  const openInvestigation = (face: UnknownFaceRecord) => {
    setSelectedRecord(face);
    setIsResolveModalOpen(true);
    searchSimilarFaces(face.id);
  };

  const openComparison = (face: UnknownFaceRecord, similarUser: SimilarUser) => {
    setSelectedRecord(face);
    setAssignedUserId(similarUser.user_id);
    setIsComparisonModalOpen(true);
  };

  const getPriorityBadge = (confidence: number) => {
    if (confidence < 30) return { label: 'HIGH', variant: 'error' as const, icon: AlertCircle };
    if (confidence < 50) return { label: 'MEDIUM', variant: 'warning' as const, icon: AlertCircle };
    return { label: 'LOW', variant: 'secondary' as const, icon: AlertCircle };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unassigned': return { label: 'PENDING', variant: 'warning' as const };
      case 'pending': return { label: 'INVESTIGATING', variant: 'primary' as const };
      case 'assigned': return { label: 'IDENTIFIED', variant: 'success' as const };
      case 'blacklisted': return { label: 'BLACKLISTED', variant: 'error' as const };
      case 'rejected': return { label: 'FALSE POSITIVE', variant: 'secondary' as const };
      default: return { label: status.toUpperCase(), variant: 'secondary' as const };
    }
  };

  let filteredFaces = unknownFaces;
  
  if (filterStatus !== 'all') {
    filteredFaces = filteredFaces.filter(f => f.status === filterStatus);
  }
  
  filteredFaces = [...filteredFaces].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return a.confidenceScore - b.confidenceScore;
      case 'priority':
        return a.confidenceScore - b.confidenceScore;
      case 'date':
      default:
        return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime();
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" /> Investigation Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Advanced unknown face investigation with biometric similarity matching
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card glass className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{queueStats.total}</p>
        </Card>

        <Card glass className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-semibold text-red-500 uppercase">High</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{queueStats.high_priority}</p>
        </Card>

        <Card glass className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-semibold text-yellow-500 uppercase">Medium</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{queueStats.medium_priority}</p>
        </Card>

        <Card glass className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-blue-500 uppercase">Low</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{queueStats.low_priority}</p>
        </Card>

        <Card glass className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-semibold text-orange-500 uppercase">Pending</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{queueStats.pending}</p>
        </Card>

        <Card glass className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-semibold text-purple-500 uppercase">Active</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{queueStats.under_investigation}</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="unassigned">Pending</option>
            <option value="pending">Investigating</option>
            <option value="assigned">Identified</option>
            <option value="blacklisted">Blacklisted</option>
            <option value="rejected">False Positive</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'confidence' | 'priority')}
            className="px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
          >
            <option value="date">Recent First</option>
            <option value="priority">Priority (High First)</option>
            <option value="confidence">Confidence (Low First)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaces.map((face) => {
          const priority = getPriorityBadge(face.confidenceScore);
          const statusBadge = getStatusBadge(face.status);
          
          return (
            <Card key={face.id} glass className="overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div className="relative aspect-4/3 bg-slate-950">
                <img src={face.snapshotUrl} alt="Unknown Face" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 flex gap-2">
                  <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                  <Badge variant={priority.variant} className="flex items-center gap-1">
                    <priority.icon className="w-3 h-3" />
                    {priority.label}
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2 bg-slate-950/80 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                  {face.confidenceScore}%
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-base truncate flex items-center gap-2">
                  <Camera className="w-4 h-4 text-slate-500" />
                  {face.cameraName}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {face.location} • {face.capturedAt}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 text-xs py-0">
                {face.candidates.length > 0 ? (
                  <div>
                    <p className="font-semibold text-slate-400 uppercase text-[10px] mb-2">AI Matches:</p>
                    <div className="space-y-1.5">
                      {face.candidates.slice(0, 2).map((candidate, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                          <img src={candidate.avatar} alt="Candidate" className="w-7 h-7 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate text-xs">{candidate.name}</p>
                            <p className="text-[10px] text-slate-500">{candidate.score}% Match</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1"
                            onClick={() => openComparison(face, {
                              user_id: users.find(u => u.name === candidate.name)?.id || '',
                              user_name: candidate.name,
                              department: '',
                              similarity_score: candidate.score / 100,
                              confidence: 'high'
                            })}
                          >
                            <GitCompare className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">No candidates above threshold</p>
                )}
              </CardContent>

              <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openInvestigation(face)}
                  leftIcon={<Search className="w-3.5 h-3.5" />}
                >
                  Investigate
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filteredFaces.length === 0 && (
        <Card glass className="p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No Unknown Faces Found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filterStatus === 'all' 
              ? 'Investigation queue is empty.'
              : `No faces with status: ${filterStatus}`
            }
          </p>
        </Card>
      )}

      {selectedRecord && (
        <Modal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          title="Investigation & Resolution Center"
          description="Review biometric similarity matches and resolve investigation"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <img 
                src={selectedRecord.snapshotUrl} 
                alt="Snapshot" 
                className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-300 dark:border-slate-700" 
              />
              <div className="flex-1 text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-white text-base">{selectedRecord.cameraName}</p>
                <p className="text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedRecord.location}
                </p>
                <p className="font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedRecord.capturedAt}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={getStatusBadge(selectedRecord.status).variant}>
                    {getStatusBadge(selectedRecord.status).label}
                  </Badge>
                  <Badge variant="secondary">{selectedRecord.confidenceScore}%</Badge>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Similarity Matches
                </label>
                {loadingSimilar && <span className="text-xs text-slate-500">Analyzing...</span>}
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {similarUsers.length > 0 ? (
                  similarUsers.map((user, idx) => (
                    <div 
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        assignedUserId === user.user_id
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 dark:border-slate-800 hover:border-primary/50'
                      }`}
                      onClick={() => setAssignedUserId(user.user_id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.user_name}`} 
                            alt={user.user_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {assignedUserId === user.user_id && (
                            <CheckCircle2 className="w-4 h-4 text-primary absolute -bottom-1 -right-1 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-white">{user.user_name}</p>
                          <p className="text-xs text-slate-500">{user.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{(user.similarity_score * 100).toFixed(1)}%</p>
                        <Badge variant={user.confidence === 'high' ? 'success' : 'warning'} className="text-[10px]">
                          {user.confidence}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    {loadingSimilar ? 'Searching...' : 'No similar users found'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Manual User Selection
              </label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.departmentName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Resolution Notes
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Add investigation notes or resolution details..."
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl min-h-[80px]"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={() => handleResolve('rejected')}>
                <XCircle className="w-4 h-4 mr-2" />
                False Positive
              </Button>
              <Button variant="secondary" onClick={() => handleResolve('whitelisted')}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Whitelist
              </Button>
              <Button variant="destructive" onClick={() => handleResolve('blacklisted')}>
                <Ban className="w-4 h-4 mr-2" />
                Blacklist
              </Button>
              <Button variant="primary" onClick={() => handleResolve('assigned')}>
                <UserCheck className="w-4 h-4 mr-2" />
                Confirm Identity
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {selectedRecord && isComparisonModalOpen && (
        <Modal
          isOpen={isComparisonModalOpen}
          onClose={() => setIsComparisonModalOpen(false)}
          title="Side-by-Side Comparison"
          description="Compare unknown face with registered user for verification"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Unknown Face</p>
                <img 
                  src={selectedRecord.snapshotUrl} 
                  alt="Unknown" 
                  className="w-full aspect-square object-cover rounded-2xl border-2 border-slate-300 dark:border-slate-700"
                />
                <div className="mt-2 space-y-1">
                  <Badge variant="warning">Confidence: {selectedRecord.confidenceScore}%</Badge>
                  <p className="text-xs text-slate-500">{selectedRecord.capturedAt}</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Registered User</p>
                <img 
                  src={users.find(u => u.id === assignedUserId)?.avatar || ''} 
                  alt="Registered" 
                  className="w-full aspect-square object-cover rounded-2xl border-2 border-primary"
                />
                <div className="mt-2 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {users.find(u => u.id === assignedUserId)?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {users.find(u => u.id === assignedUserId)?.departmentName}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsComparisonModalOpen(false)}>
                Back
              </Button>
              <Button variant="primary" onClick={() => {
                setIsComparisonModalOpen(false);
                handleResolve('assigned');
              }}>
                <UserCheck className="w-4 h-4 mr-2" />
                Confirm Match
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
