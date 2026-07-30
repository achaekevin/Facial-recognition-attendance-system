import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Key, Database, Mail, Bell, Server } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useBiometricStore } from '../../store/useBiometricStore';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useBiometricStore();
  const [recThreshold, setRecThreshold] = useState(settings.recognitionThreshold || 85);
  const [livenessEnabled, setLivenessEnabled] = useState(settings.enableLivenessDetection);

  const handleSave = () => {
    updateSettings({
      recognitionThreshold: recThreshold,
      enableLivenessDetection: livenessEnabled,
    });
    toast.success('System biometric parameters updated!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" /> System Settings & Biometric Parameters
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure face matching threshold, anti-spoofing liveness filters, API keys, and gateways.
        </p>
      </div>

      {/* Biometric Threshold Card */}
      <Card glass className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" /> Biometric Recognition Engine Threshold
          </CardTitle>
          <CardDescription>Minimum confidence match required to confirm identity.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Face Vector Match Sensitivity Threshold: <span className="text-primary font-mono text-base">{recThreshold}%</span>
              </label>
              <Badge variant={recThreshold >= 85 ? 'success' : 'warning'}>
                {recThreshold >= 85 ? 'High Security' : 'Balanced'}
              </Badge>
            </div>
            <input
              type="range"
              min={60}
              max={99}
              value={recThreshold}
              onChange={(e) => setRecThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">3D Dual-Sensor Liveness Filter (Anti-Spoofing)</p>
              <p className="text-xs text-slate-500">Prevent identity theft via printed photographs or digital screen displays.</p>
            </div>
            <input
              type="checkbox"
              checked={livenessEnabled}
              onChange={(e) => setLivenessEnabled(e.target.checked)}
              className="w-5 h-5 accent-primary rounded cursor-pointer"
            />
          </div>
        </CardContent>
        <CardFooter className="px-0 flex justify-end">
          <Button variant="primary" onClick={handleSave}>
            Save Parameters
          </Button>
        </CardFooter>
      </Card>

      {/* API Key Management */}
      <Card glass className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" /> Active API SDK Keys
          </CardTitle>
          <CardDescription>Hardware camera terminal SDK keys</CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-3">
          {settings.apiKeys.map((k) => (
            <div key={k.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{k.name}</p>
                <p className="font-mono text-slate-400 mt-0.5">{k.key}</p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
