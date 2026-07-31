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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [hostInput, setHostInput] = useState('');
  const [hostUserId, setHostUserId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [showHostSuggestions, setShowHostSuggestions] = useState(false);

  // Filter users based on input
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(hostInput.toLowerCase()) ||
    u.departmentName?.toLowerCase().includes(hostInput.toLowerCase()) ||
    u.email?.toLowerCase().includes(hostInput.toLowerCase())
  );

  const columns: ColumnDef<VisitorRecord>[] = [
    {
      accessorKey: 'fullName',
      header: 'Visitor Details',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.faceImageUrl ? (
          <img src={row.original.faceImageUrl} alt={row.original.fullName} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/30">
            {row.original.fullName.charAt(0)}
          </div>
        )}
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

  const handleRegisterVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!fullName.trim()) {
      toast.error('Please enter visitor full name');
      return;
    }

    if (!hostUserId) {
      toast.error('Please select a host official');
      return;
    }

    setIsSubmitting(true);

    try {
      const host = users.find((u) => u.id === hostUserId);
      
      if (!host) {
        throw new Error('Selected host not found');
      }

      addVisitor({
        fullName: fullName.trim(),
        email: `${fullName.toLowerCase().replace(/\s+/g, '.')}@guest.org`,
        phone: '+1 (555) 998-1122',
        company: company.trim() || 'Independent Guest',
        hostUserId: host.id,
        hostName: host.name,
        purpose: purpose.trim() || 'Official Meeting',
        expectedArrival: new Date().toISOString(),
        expectedDeparture: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
        faceImageUrl: '',
        status: 'checked_in',
      });

      // Success notification with confetti effect
      toast.success(`✅ Visitor badge issued successfully!`, {
        description: `${fullName} has been registered and checked in. Host: ${host.name}`,
        duration: 5000,
      });

      // Reset form
      setFullName('');
      setCompany('');
      setHostInput('');
      setHostUserId('');
      setPurpose('');
      setIsRegModalOpen(false);
      
    } catch (error) {
      console.error('Error registering visitor:', error);
      toast.error('Failed to register visitor', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectHost = (userId: string, userName: string) => {
    setHostUserId(userId);
    setHostInput(userName);
    setShowHostSuggestions(false);
  };

  const resetForm = () => {
    setFullName('');
    setCompany('');
    setHostInput('');
    setHostUserId('');
    setPurpose('');
    setShowHostSuggestions(false);
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
        onClose={resetForm}
        title="Visitor Registration & Fast Pass"
        description="Capture face image and assign institutional host."
      >
        <form onSubmit={handleRegisterVisitor} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Visitor Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sophia Martinez"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              disabled={isSubmitting}
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
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Host Official *
            </label>
            <input
              type="text"
              required
              value={hostInput}
              onChange={(e) => {
                setHostInput(e.target.value);
                setShowHostSuggestions(true);
                setHostUserId(''); // Clear selection when typing
              }}
              onFocus={() => setShowHostSuggestions(true)}
              placeholder="Type to search for host by name, department, or email..."
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              disabled={isSubmitting}
              autoComplete="off"
            />
            
            {/* Dropdown suggestions */}
            {showHostSuggestions && hostInput && filteredUsers.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {filteredUsers.slice(0, 10).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => selectHost(user.id, user.name)}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user.departmentName} • {user.role}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No results message */}
            {showHostSuggestions && hostInput && filteredUsers.length === 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-3">
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  No hosts found matching "{hostInput}"
                </p>
              </div>
            )}

            {/* Selected host indicator */}
            {hostUserId && (
              <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Host selected: {users.find(u => u.id === hostUserId)?.name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Purpose of Visit
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Guest Lecture & Lab Tour"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={isSubmitting || !hostUserId}
              leftIcon={isSubmitting ? <Sparkles className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
            >
              {isSubmitting ? 'Issuing Badge...' : 'Issue Visitor Badge'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
