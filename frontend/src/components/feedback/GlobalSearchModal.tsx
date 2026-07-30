import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Camera, Building2, UserCheck, HelpCircle, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBiometricStore } from '../../store/useBiometricStore';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { users, cameras, departments, visitors, unknownFaces } = useBiometricStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open signal
        }
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredUsers = query
    ? users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))
    : users.slice(0, 3);

  const filteredCameras = query
    ? cameras.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.location.toLowerCase().includes(query.toLowerCase()))
    : cameras.slice(0, 2);

  const filteredDepts = query
    ? departments.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()) || d.code.toLowerCase().includes(query.toLowerCase()))
    : departments.slice(0, 2);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Search Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="relative w-full max-w-2xl bg-card border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Search Input Bar */}
          <div className="relative flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people, cameras, departments, attendance, visitors..."
              className="w-full text-base bg-transparent border-none focus:outline-none text-foreground placeholder:text-slate-400"
            />
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
              ESC
            </kbd>
          </div>

          {/* Search Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {/* Users */}
            {filteredUsers.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Personnel & Students ({filteredUsers.length})
                </h4>
                <div className="space-y-1">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleSelect(`/users/${user.id}`)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.departmentName} • {user.role}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cameras */}
            {filteredCameras.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Cameras ({filteredCameras.length})
                </h4>
                <div className="space-y-1">
                  {filteredCameras.map((cam) => (
                    <div
                      key={cam.id}
                      onClick={() => handleSelect('/cameras')}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            {cam.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{cam.location} • {cam.status}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Departments */}
            {filteredDepts.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Departments ({filteredDepts.length})
                </h4>
                <div className="space-y-1">
                  {filteredDepts.map((dept) => (
                    <div
                      key={dept.id}
                      onClick={() => handleSelect('/departments')}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            {dept.name} ({dept.code})
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{dept.managerName} • {dept.totalUsers} Members</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Tip: Press ESC to exit search</span>
            <span>Enterprise Biometric Search Engine</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
