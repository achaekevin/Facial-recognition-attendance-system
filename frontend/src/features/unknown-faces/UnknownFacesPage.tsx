import React, { useState } from 'react';
import { UnknownFaceRecord } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useBiometricStore } from '../../store/useBiometricStore';
import { ShieldAlert, UserCheck, Ban, Eye, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const UnknownFacesPage: React.FC = () => {
  const { unknownFaces, resolveUnknownFace, users } = useBiometricStore();
  const [selectedRecord, setSelectedRecord] = useState<UnknownFaceRecord | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [assignedUserId, setAssignedUserId] = useState(users[0]?.id || '');

  const handleResolve = (status: UnknownFaceRecord['status']) => {
    if (!selectedRecord) return;
    resolveUnknownFace(selectedRecord.id, status, status === 'assigned' ? assignedUserId : undefined);

    const targetUser = users.find((u) => u.id === assignedUserId);
    if (status === 'assigned') {
      toast.success(`Identity confirmed! Face snapshot assigned to ${targetUser?.name}.`);
    } else if (status === 'blacklisted') {
      toast.error('Target added to Security Blacklist & Alert Triggered!');
    } else {
      toast.info(`Record updated to ${status}.`);
    }

    setIsResolveModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" /> Unknown Face Incident Resolution
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review low-confidence biometric detections, assign identity matches, or flag security blacklists.
          </p>
        </div>
      </div>

      {/* Grid of Unknown Faces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {unknownFaces.map((face) => (
          <Card key={face.id} glass className="overflow-hidden flex flex-col justify-between">
            <div className="relative aspect-4/3 bg-slate-950">
              <img src={face.snapshotUrl} alt="Unknown Face" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2">
                <Badge variant={face.status === 'unassigned' ? 'warning' : 'danger'}>
                  {face.status.toUpperCase()}
                </Badge>
              </div>
              <div className="absolute bottom-2 right-2 bg-slate-950/80 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                Confidence: {face.confidenceScore}%
              </div>
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-base truncate">{face.cameraName}</CardTitle>
              <CardDescription>{face.location} • Captured: {face.capturedAt}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-2 text-xs py-0">
              {face.candidates.length > 0 ? (
                <div>
                  <p className="font-semibold text-slate-400 uppercase text-[10px]">Top AI Match Candidate:</p>
                  <div className="flex items-center gap-2 mt-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <img src={face.candidates[0].avatar} alt="Candidate" className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{face.candidates[0].name}</p>
                      <p className="text-[10px] text-slate-500">{face.candidates[0].score}% Similarity</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No candidates above 40% threshold.</p>
              )}
            </CardContent>

            <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRecord(face);
                  setIsResolveModalOpen(true);
                }}
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                Review & Resolve
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Resolution Modal */}
      {selectedRecord && (
        <Modal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          title="Resolve Unknown Face Incident"
          description="Review candidates and assign identity or flag security watchlist."
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <img src={selectedRecord.snapshotUrl} alt="Snapshot" className="w-20 h-20 rounded-2xl object-cover" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">{selectedRecord.cameraName}</p>
                <p className="text-slate-500">{selectedRecord.location}</p>
                <p className="font-mono text-slate-400">Captured at {selectedRecord.capturedAt}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Assign Candidate Identity
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

            <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={() => handleResolve('rejected')}>
                Ignore False Trigger
              </Button>
              <Button variant="destructive" onClick={() => handleResolve('blacklisted')} leftIcon={<Ban className="w-4 h-4" />}>
                Flag Blacklist
              </Button>
              <Button variant="primary" onClick={() => handleResolve('assigned')} leftIcon={<UserCheck className="w-4 h-4" />}>
                Confirm Identity Match
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
