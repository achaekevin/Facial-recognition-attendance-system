import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBiometricStore } from '../../store/useBiometricStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, ScanFace, Mail, Phone, Building2, Calendar, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, attendance } = useBiometricStore();

  const user = users.find((u) => u.id === id) || users[0];
  const userAttendance = attendance.filter((a) => a.userId === user.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Nav */}
      <button
        onClick={() => navigate('/users')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to User Directory
      </button>

      {/* User Banner Header Card */}
      <Card glass className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-28 h-28 rounded-3xl object-cover border-4 border-primary/20 shadow-xl shrink-0"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
              <Badge variant="primary" className="capitalize">
                {user.category}
              </Badge>
              <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                {user.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-4">
              ID: {user.employeeOrStudentId} • Enrolled on {user.registeredAt}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-4 h-4 text-primary" /> {user.email}
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="w-4 h-4 text-primary" /> {user.phone}
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Building2 className="w-4 h-4 text-primary" /> {user.departmentName}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Biometric Face Template Gallery & Confidence Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card glass className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanFace className="w-5 h-5 text-primary" /> Enrolled Face Vector Thumbnails
            </CardTitle>
            <CardDescription>Multi-angle biometric image embeddings</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {user.faceImageUrls.map((url, idx) => (
              <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-square group">
                <img src={url} alt={`Face Pose ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute bottom-1 left-1 right-1 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white text-center font-mono">
                  Pose 0{idx + 1} Vector
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card glass className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Biometric Score</CardTitle>
            <CardDescription>Average Recognition Confidence</CardDescription>
          </CardHeader>
          <CardContent className="text-center my-auto py-6">
            <div className="w-32 h-32 rounded-full border-8 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                {user.accuracyScore}%
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4" /> 3D Liveness Verified
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance History */}
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" /> Recent Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userAttendance.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent attendance records logged.</p>
            ) : (
              userAttendance.map((rec) => (
                <div key={rec.id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={rec.recognitionImageUrl} alt="Scan" className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{rec.cameraName}</p>
                      <p className="text-slate-500 dark:text-slate-400">{rec.location} • {rec.date} at {rec.clockIn}</p>
                    </div>
                  </div>
                  <Badge variant={rec.status === 'present' ? 'success' : 'warning'}>
                    {rec.status.toUpperCase()} ({rec.confidenceScore}%)
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
