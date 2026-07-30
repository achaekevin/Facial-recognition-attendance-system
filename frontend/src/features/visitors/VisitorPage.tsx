import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { VisitorRecord } from '../../types';
import { DataTable } from '../../components/data-display/DataTable';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useBiometricStore } from '../../store/useBiometricStore';
import { UserCheck, Plus, LogOut, QrCode, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const VisitorPage: React.FC = () => {
  const { visitors, addVisitor, checkoutVisitor, users } = useBiometricStore();
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [hostUserId, setHostUserId] = useState(users[0]?.id || '');
  const [purpose, setPurpose] = useState('');

  const columns: ColumnDef<VisitorRecord>[] = [
    {
      accessorKey: 'fullName',
      header: 'Visitor Details',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img src={row.original.faceImageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80'} alt={row.original.fullName} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{row.original.fullName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{row.original.company} • {row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'badgeNumber',
      header: 'Digital Badge',
      cell: ({ row }) => (
        <Badge variant="primary" className="font-mono text-xs">
          {row.original.badgeNumber}
        </Badge>
      ),
    },
    {
      accessorKey: 'hostName',
      header: 'Host & Purpose',
      cell: ({ row }) => (
        <div className="text-xs">
          <p className="font-medium text-slate-900 dark:text-white">Host: {row.original.hostName}</p>
          <p className="text-slate-400">{row.original.purpose}</p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const st = row.original.status;
        return (
          <Badge variant={st === 'checked_in' ? 'success' : 'secondary'}>
            {st.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const v = row.original;
        if (v.status === 'checked_out') return <span className="text-xs text-slate-400">Checked Out</span>;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              checkoutVisitor(v.id);
              toast.success(`${v.fullName} checked out of premises.`);
            }}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Check Out
          </Button>
        );
      },
    },
  ];

  const handleRegisterVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    const host = users.find((u) => u.id === hostUserId) || users[0];

    addVisitor({
      fullName,
      email: `${fullName.toLowerCase().replace(' ', '.')}@guest.org`,
      phone: '+1 (555) 998-1122',
      company: company || 'Independent Guest',
      hostUserId: host.id,
      hostName: host.name,
      purpose: purpose || 'Official Meeting',
      expectedArrival: '2026-07-28 14:00',
      expectedDeparture: '2026-07-28 17:00',
      faceImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      status: 'checked_in',
    });

    toast.success(`Visitor badge issued for ${fullName}!`);
    setIsRegModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-primary" /> Visitor Fast Pass Registration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pre-register guests, capture visitor biometric faces, and issue temporary gate badges.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsRegModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Register Visitor
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={visitors}
        searchPlaceholder="Search visitor name, company, host..."
        exportFilename="visitor_log"
      />

      <Modal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        title="Visitor Registration & Fast Pass"
        description="Capture face image and assign institutional host."
      >
        <form onSubmit={handleRegisterVisitor} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Visitor Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sophia Martinez"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Organization / Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. BioTech Solutions"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Host Official
            </label>
            <select
              value={hostUserId}
              onChange={(e) => setHostUserId(e.target.value)}
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
              Purpose of Visit
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Guest Lecture & Lab Tour"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsRegModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Issue Visitor Badge
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
