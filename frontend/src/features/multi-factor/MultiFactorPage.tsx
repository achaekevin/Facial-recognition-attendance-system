import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Shield, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';

const MultiFactorPage: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    factors: [] as string[],
    applies_to: 'all'
  });

  const availableFactors = [
    { id: 'face', label: 'Facial Recognition', description: 'Biometric face verification' },
    { id: 'geofence', label: 'Geofence', description: 'Location verification' },
    { id: 'device', label: 'Device Fingerprint', description: 'Trusted device check' },
    { id: 'qr', label: 'QR Code', description: 'Scan QR code' },
    { id: 'pin', label: 'PIN Code', description: 'Personal identification number' }
  ];

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/multi-factor/policies');
      const data = await response.json();
      setPolicies(data.policies || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreatePolicy = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/multi-factor/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPolicy)
      });
      if (response.ok) {
        setShowDialog(false);
        fetchPolicies();
        setNewPolicy({ name: '', factors: [], applies_to: 'all' });
        toast.success('Policy created successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create policy');
    }
  };

  const toggleFactor = (factorId: string) => {
    setNewPolicy(prev => ({
      ...prev,
      factors: prev.factors.includes(factorId)
        ? prev.factors.filter(f => f !== factorId)
        : [...prev.factors, factorId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> Multi-Factor Attendance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure multi-factor verification policies
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowDialog(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Create Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies.map((policy) => (
          <Card key={policy.id}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">{policy.name}</h3>
              <Badge variant={policy.is_active ? 'success' : 'default'}>
                {policy.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {policy.factors.map((factor: string) => (
                  <Badge key={factor} variant="info">{factor}</Badge>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Applies to: <span className="font-semibold">{policy.applies_to}</span>
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title="Create Multi-Factor Policy"
        description="Configure verification requirements"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Policy Name
            </label>
            <input
              type="text"
              value={newPolicy.name}
              onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
              placeholder="e.g. High Security Policy"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Required Factors
            </label>
            <div className="space-y-2">
              {availableFactors.map((factor) => (
                <label
                  key={factor.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={newPolicy.factors.includes(factor.id)}
                    onChange={() => toggleFactor(factor.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{factor.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{factor.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Applies To
            </label>
            <select
              value={newPolicy.applies_to}
              onChange={(e) => setNewPolicy({ ...newPolicy, applies_to: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              <option value="all">All Employees</option>
              <option value="managers">Managers Only</option>
              <option value="remote">Remote Workers</option>
              <option value="contractors">Contractors</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreatePolicy} leftIcon={<Save className="w-4 h-4" />}>
            Create Policy
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default MultiFactorPage;
