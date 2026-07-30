import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { LeaveRequest, LeaveType } from '../../types';
import { DataTable } from '../../components/data-display/DataTable';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useBiometricStore } from '../../store/useBiometricStore';
import { useAuthStore } from '../../store/useAuthStore';
import { FileText, Plus, CheckCircle2, XCircle, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

export const LeavePage: React.FC = () => {
  const { leaves, addLeave, updateLeaveStatus, users } = useBiometricStore();
  const { user: currentUser, activeRole } = useAuthStore();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-03');
  const [reason, setReason] = useState('');

  // Check if current user role has permission to approve or reject leave requests
  const canApproveLeave = activeRole === 'super_admin' || activeRole === 'hr_admin' || activeRole === 'lecturer_teacher';

  const columns: ColumnDef<LeaveRequest>[] = [
    {
      accessorKey: 'userName',
      header: 'Applicant Roster',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img src={row.original.userAvatar} alt={row.original.userName} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{row.original.userName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{row.original.department}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'leaveType',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="primary" className="capitalize">
          {row.original.leaveType}
        </Badge>
      ),
    },
    {
      accessorKey: 'totalDays',
      header: 'Duration',
      cell: ({ row }) => (
        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
          {row.original.startDate} to {row.original.endDate} ({row.original.totalDays} Days)
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Approval Status',
      cell: ({ row }) => {
        const st = row.original.status;
        return (
          <Badge variant={st === 'approved' ? 'success' : st === 'rejected' ? 'danger' : 'warning'}>
            {st.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const l = row.original;
        
        if (l.status !== 'pending') {
          return (
            <span className="text-xs text-slate-400 font-mono">
              {l.approvedBy ? `Decided by ${l.approvedBy}` : 'Decided'}
            </span>
          );
        }

        // Students / employees cannot approve their own or other leave requests
        if (!canApproveLeave) {
          return (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium italic">
              Awaiting HR / Faculty Approval
            </span>
          );
        }

        const approverName = currentUser?.name || (
          activeRole === 'super_admin' 
            ? 'Super Admin' 
            : activeRole === 'hr_admin' 
            ? 'HR Manager' 
            : 'Faculty Instructor'
        );

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                updateLeaveStatus(l.id, 'approved', approverName);
                toast.success(`Approved leave request for ${l.userName}`);
              }}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              Approve
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                updateLeaveStatus(l.id, 'rejected', approverName);
                toast.error(`Rejected leave request for ${l.userName}`);
              }}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error('Please state a reason for your leave request.');
      return;
    }

    const activeUser = currentUser || (users.length > 0 ? users[0] : null);

    const userId = activeUser?.id || `usr-${Date.now()}`;
    const userName = activeUser?.name || 'Registered Student';
    const userAvatar = activeUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    const department = activeUser?.departmentName || (activeUser as any)?.department || 'Computer Science Dept';

    // Calculate duration in days dynamically
    let totalDays = 1;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      totalDays = diffDays > 0 ? diffDays : 1;
    }

    addLeave({
      userId,
      userName,
      userAvatar,
      department,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason: reason.trim(),
    });

    toast.success(`Leave application submitted for approval! (${totalDays} day${totalDays > 1 ? 's' : ''})`);
    setReason('');
    setIsApplyModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Leave Application & Approvals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Request medical, annual, or emergency leave and review team approvals.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsApplyModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Apply for Leave
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={leaves}
        searchPlaceholder="Search leave requests..."
        exportFilename="leave_applications"
      />

      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Leave Application"
        description="Select dates and type for administrative approval."
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Leave Category
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none transition-all"
            >
              <option value="annual">Annual Paid Leave</option>
              <option value="medical">Medical / Sick Leave</option>
              <option value="emergency">Emergency Family Leave</option>
              <option value="unpaid">Unpaid Personal Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Reason Justification
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State reason for absence..."
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
