import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { AuditLogEntry } from '../../types';
import { DataTable } from '../../components/data-display/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useBiometricStore } from '../../store/useBiometricStore';
import { History, ShieldCheck, Terminal } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useBiometricStore();

  const columns: ColumnDef<AuditLogEntry>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {row.original.timestamp}
        </span>
      ),
    },
    {
      accessorKey: 'actorName',
      header: 'Administrator / Actor',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white text-xs">{row.original.actorName}</p>
          <p className="text-[10px] text-slate-400 uppercase font-mono">{row.original.actorRole}</p>
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action Event',
      cell: ({ row }) => (
        <Badge variant="primary" className="font-mono text-[10px]">
          {row.original.action}
        </Badge>
      ),
    },
    {
      accessorKey: 'details',
      header: 'Event Description',
      cell: ({ row }) => (
        <p className="text-xs text-slate-700 dark:text-slate-300 max-w-md truncate">
          {row.original.details}
        </p>
      ),
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-400">{row.original.ipAddress}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-6 h-6 text-primary" /> Immutable Security Audit Logs
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Trace administrative changes, camera configuration edits, and manual attendance overrides.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={auditLogs}
        searchPlaceholder="Search audit logs by actor, action, IP..."
        exportFilename="security_audit_logs"
      />
    </div>
  );
};
