import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { DataTable } from '../../components/data-display/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useBiometricStore } from '../../store/useBiometricStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Clock, Eye, Plus, Trash2, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export const AttendancePage: React.FC = () => {
  const { activeRole } = useAuthStore();
  const { attendance, addAttendance, deleteAttendance, users } = useBiometricStore();
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Manual Clock In State
  const [manualUser, setManualUser] = useState(users[0]?.id || '');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('present');
  const [manualNotes, setManualNotes] = useState('');

  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      accessorKey: 'userName',
      header: 'Member Roster',
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div className="flex items-center gap-3">
            {a.userAvatar ? (
              <img src={a.userAvatar} alt={a.userName} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/30 font-bold text-xs shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{a.userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{a.department}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'clockIn',
      header: 'Clock In / Out',
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div className="font-mono text-xs text-slate-700 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-white">In: {a.clockIn}</p>
            <p className="text-slate-400">Out: {a.clockOut || '---'}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'cameraName',
      header: 'Scanner & Location',
      cell: ({ row }) => (
        <div className="text-xs text-slate-700 dark:text-slate-300">
          <p className="font-medium">{row.original.cameraName}</p>
          <p className="text-slate-400">{row.original.location}</p>
        </div>
      ),
    },
    {
      accessorKey: 'confidenceScore',
      header: 'Match Score',
      cell: ({ row }) => (
        <Badge variant={row.original.confidenceScore >= 90 ? 'success' : 'warning'}>
          {row.original.confidenceScore}% Match
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Attendance Status',
      cell: ({ row }) => {
        const st = row.original.status;
        return (
          <Badge
            variant={
              st === 'present'
                ? 'success'
                : st === 'late'
                ? 'warning'
                : st === 'absent'
                ? 'danger'
                : 'info'
            }
          >
            {st.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const rec = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedRecord(rec);
                setIsDetailModalOpen(true);
              }}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Details
            </Button>
            {activeRole === 'super_admin' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-rose-500"
                onClick={() => {
                  setSelectedRecord(rec);
                  setIsDeleteModalOpen(true);
                }}
                title="Delete Attendance Record"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const handleManualClockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find((u) => u.id === manualUser) || users[0];

    if (!targetUser) {
      toast.error('No enrolled users found in system.');
      return;
    }

    addAttendance({
      userId: targetUser.id,
      userName: targetUser.name,
      userCategory: targetUser.category,
      userAvatar: targetUser.avatar,
      department: targetUser.departmentName,
      date: new Date().toISOString().split('T')[0],
      clockIn: new Date().toLocaleTimeString(),
      status: manualStatus,
      confidenceScore: 100,
      recognitionImageUrl: targetUser.avatar || '',
      cameraName: 'Admin Manual Override Terminal',
      cameraId: 'cam-manual',
      location: 'HR Administration Desk',
      deviceUsed: 'Web Admin Console',
      notes: manualNotes || 'Manual administrative entry',
      approvalStatus: 'approved',
      approvedBy: 'Super Admin',
    });

    toast.success(`Manual attendance entry logged for ${targetUser.name}!`);
    setIsManualModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" /> Attendance Logs & Verification
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time biometric attendance records, late arrival flags, and manual override queue.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsManualModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Manual Clock In Override
        </Button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={attendance}
        searchPlaceholder="Search by user, camera, status..."
        exportFilename="daily_attendance_logs"
      />

      {/* Record Details Modal */}
      {selectedRecord && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Attendance Record - ${selectedRecord.userName}`}
          description={`Logged on ${selectedRecord.date} at ${selectedRecord.clockIn}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              {selectedRecord.recognitionImageUrl ? (
                <img
                  src={selectedRecord.recognitionImageUrl}
                  alt="Captured Snapshot"
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/30 font-bold text-xs shrink-0">
                  <UserIcon className="w-8 h-8" />
                </div>
              )}
              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedRecord.userName}</p>
                <p className="text-slate-500 dark:text-slate-400">{selectedRecord.department}</p>
                <Badge variant={selectedRecord.confidenceScore >= 90 ? 'success' : 'warning'}>
                  Biometric Match: {selectedRecord.confidenceScore}%
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-card border border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-mono">Clock In Time</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{selectedRecord.clockIn}</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-mono">Clock Out Time</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{selectedRecord.clockOut || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-mono">Camera Device</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedRecord.cameraName}</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-mono">Terminal Location</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedRecord.location}</p>
              </div>
            </div>

            {selectedRecord.notes && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                <strong>System Note:</strong> {selectedRecord.notes}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Record Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Attendance Record"
        description="As Super Admin, confirm permanent deletion of this attendance log."
      >
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          Are you sure you want to delete attendance record for <span className="font-bold text-slate-900 dark:text-white">{selectedRecord?.userName}</span> logged at {selectedRecord?.clockIn}?
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (selectedRecord) {
                deleteAttendance(selectedRecord.id);
                toast.success(`Deleted attendance record for ${selectedRecord.userName}.`);
                setIsDeleteModalOpen(false);
              }
            }}
          >
            Confirm Delete Record
          </Button>
        </div>
      </Modal>

      {/* Manual Clock In Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Manual Attendance Override Entry"
        description="Override biometric scanner entry for an enrolled member."
      >
        <form onSubmit={handleManualClockInSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Select User
            </label>
            <select
              value={manualUser}
              onChange={(e) => setManualUser(e.target.value)}
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Status Flag
            </label>
            <select
              value={manualStatus}
              onChange={(e) => setManualStatus(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              <option value="present">Present (On Time)</option>
              <option value="late">Late Arrival</option>
              <option value="overtime">Overtime</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Justification Notes
            </label>
            <textarea
              rows={3}
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              placeholder="e.g. Card key failure or verified medical note..."
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Log Attendance Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
