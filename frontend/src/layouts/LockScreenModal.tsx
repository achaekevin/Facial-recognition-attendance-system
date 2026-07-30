import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, KeyRound, ScanFace, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';

export const LockScreenModal: React.FC = () => {
  const { user, isLocked, unlockScreen } = useAuthStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [biometricUnlocking, setBiometricUnlocking] = useState(false);

  if (!isLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockScreen(password)) {
      setPassword('');
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleSimulatedFaceUnlock = () => {
    setBiometricUnlocking(true);
    setTimeout(() => {
      unlockScreen('biometric_pass');
      setBiometricUnlocking(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center text-white"
        >
          {/* Avatar & Lock Icon */}
          <div className="relative w-24 h-24 mx-auto mb-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover border-4 border-primary/50 shadow-xl"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-primary/10 border-4 border-primary/40 flex items-center justify-center text-primary shadow-xl">
                <UserIcon className="w-12 h-12" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-primary text-white shadow-md">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <h3 className="text-xl font-bold">{user?.name || 'Session Locked'}</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">Enter password or scan face to unlock terminal</p>

          {/* Form */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Enter password (e.g. password321)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-medium">Invalid credentials. Try entering 4+ characters.</p>
            )}

            <Button type="submit" variant="primary" className="w-full py-2.5 font-semibold">
              Unlock Terminal
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500">or use biometric</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleSimulatedFaceUnlock}
            isLoading={biometricUnlocking}
            leftIcon={<ScanFace className="w-4 h-4 text-emerald-400" />}
            className="w-full border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            Scan Registered Face ID
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
