import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Link, Plus, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: '',
    config: {}
  });

  useEffect(() => {
    fetchIntegrations();
    fetchTypes();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/integrations/list');
      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/integrations/types');
      const data = await response.json();
      setTypes(data.types || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/integrations/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIntegration)
      });
      if (response.ok) {
        setShowDialog(false);
        fetchIntegrations();
        setNewIntegration({ name: '', type: '', config: {} });
        toast.success('Integration created successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create integration');
    }
  };

  const handleTest = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/integrations/${id}/test`, { method: 'POST' });
      toast.success('Test completed successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Test failed');
    }
  };

  const handleSync = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/integrations/${id}/sync`, { method: 'POST' });
      toast.success('Sync completed successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Sync failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Link className="w-6 h-6 text-primary" /> API Integrations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect with HR, Payroll, and Communication systems
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowDialog(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Add Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {types.slice(0, 4).map((type) => (
          <Card key={type.id}>
            <h3 className="font-semibold text-slate-900 dark:text-white">{type.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{type.description}</p>
            <div className="mt-3">
              <Badge variant="info">
                {integrations.filter(i => i.type === type.id).length} configured
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Configured Integrations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Last Sync</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map((integration) => (
                <tr key={integration.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 px-4 text-slate-900 dark:text-white">{integration.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant="info">{integration.type}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {integration.is_active ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <Badge variant={integration.is_active ? 'success' : 'default'}>
                        {integration.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {integration.last_sync ? new Date(integration.last_sync).toLocaleString() : 'Never'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleTest(integration.id)}>
                        Test
                      </Button>
                      <Button size="sm" variant="outline" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => handleSync(integration.id)}>
                        Sync
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {integrations.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-slate-500 dark:text-slate-400">
                    No integrations configured yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title="Add New Integration"
        description="Configure a new enterprise system integration"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Integration Name
            </label>
            <input
              type="text"
              value={newIntegration.name}
              onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              placeholder="e.g., Workday HR System"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Integration Type
            </label>
            <select
              value={newIntegration.type}
              onChange={(e) => setNewIntegration({ ...newIntegration, type: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              <option value="">Select type...</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configuration fields will be available after selecting type
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Integration
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IntegrationsPage;
