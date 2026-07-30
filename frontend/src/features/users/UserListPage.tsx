import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { User } from '../../types';
import { DataTable } from '../../components/data-display/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useBiometricStore } from '../../store/useBiometricStore';
import { Eye, Trash2, Ban, CheckCircle, Sparkles, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const UserListPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, toggleUserStatus, deleteUser } = useBiometricStore();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const filteredUsers = categoryFilter === 'all'
    ? users
    : users.filter((u) => u.category === categoryFilter);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Identity Roster',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            {u.avatar ? (
              <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/30 font-bold text-xs shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/users/${u.id}`)}>
                {u.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: 'departmentName',
      header: 'Department / Faculty',
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {row.original.departmentName}
        </span>
      ),
    },
    {
      accessorKey: 'accuracyScore',
      header: 'Biometric Confidence',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${row.original.accuracyScore}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            {row.original.accuracyScore}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const st = row.original.status;
        return (
          <Badge
            variant={st === 'active' ? 'success' : st === 'suspended' ? 'danger' : 'warning'}
            pulse={st === 'active'}
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
        const u = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-primary"
              onClick={() => navigate(`/users/${u.id}`)}
              title="View Biometric Profile"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-amber-500"
              onClick={() => {
                toggleUserStatus(u.id);
                toast.success(`Updated ${u.name} status to ${u.status === 'active' ? 'suspended' : 'active'}`);
              }}
              title={u.status === 'active' ? 'Suspend User' : 'Activate User'}
            >
              {u.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-rose-500"
              onClick={() => {
                setSelectedUser(u);
                setIsDeleteModalOpen(true);
              }}
              title="Delete User"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            User Directory & Biometrics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage students, employees, lecturers, visitors, and contractor biometric profiles.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/face-enrollment')}
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Enroll New User
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'student', 'employee', 'lecturer', 'visitor', 'contractor'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all border ${
              categoryFilter === cat
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-card text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat}s
          </button>
        ))}
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        searchPlaceholder="Search by name, email, department..."
        exportFilename="users_directory"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete User Roster Record"
        description="Are you sure you want to remove this user and purge their biometric face embeddings?"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          Removing <span className="font-bold text-slate-900 dark:text-white">{selectedUser?.name}</span> will permanently delete their profile and biometric template vectors from the database.
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (selectedUser) {
                deleteUser(selectedUser.id);
                toast.success(`Deleted ${selectedUser.name} from directory.`);
                setIsDeleteModalOpen(false);
              }
            }}
          >
            Confirm Delete & Purge
          </Button>
        </div>
      </Modal>
    </div>
  );
};
