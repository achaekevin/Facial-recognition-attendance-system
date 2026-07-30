import React, { useState, useRef } from 'react';
import { User as UserIcon, Camera, Lock, KeyRound, CheckCircle2, Upload, ShieldCheck, Mail, Phone, BadgeCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, updatePassword } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Details Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [employeeOrStudentId, setEmployeeOrStudentId] = useState(user?.employeeOrStudentId || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Credentials / Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageResult = reader.result as string;
        setAvatar(imageResult);
        updateUser({ avatar: imageResult });
        toast.success('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Full name and email address are required.');
      return;
    }

    updateUser({ name, email, phone, employeeOrStudentId, avatar });
    toast.success('Biometric profile details updated!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter current password.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    updatePassword(newPassword);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Account login credentials updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-primary" /> My Biometric Profile & Security Credentials
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage personal contact info, profile photo, and login security credentials.
        </p>
      </div>

      {/* Profile Details & Photo Section */}
      <Card glass className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-primary" /> Personal Profile Details
          </CardTitle>
          <CardDescription>Update profile avatar image, full name, and phone contact info.</CardDescription>
        </CardHeader>

        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="relative group">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/30 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary/20 to-indigo-500/20 border-4 border-primary/30 flex items-center justify-center text-primary shadow-xl">
                <UserIcon className="w-12 h-12" />
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all ring-2 ring-white dark:ring-slate-900"
              title="Upload New Profile Picture"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfileImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || 'Registered User'}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <Badge variant="primary" className="capitalize">
                Role: {user?.role ? user.role.replace('_', ' ') : 'User'}
              </Badge>
              <Badge variant="success">ID: {user?.employeeOrStudentId || 'N/A'}</Badge>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                Phone Contact Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                Employee / Student Badge ID
              </label>
              <input
                type="text"
                value={employeeOrStudentId}
                onChange={(e) => setEmployeeOrStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Security Credentials Section */}
      <Card glass className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-500" /> Security Login Credentials
          </CardTitle>
          <CardDescription>Update system login password for secure authentication.</CardDescription>
        </CardHeader>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="enter current password..."
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="enter new password..."
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="confirm new password..."
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="outline" leftIcon={<ShieldCheck className="w-4 h-4" />}>
              Update Password Credentials
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
