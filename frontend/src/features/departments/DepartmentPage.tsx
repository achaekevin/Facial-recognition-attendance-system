import React, { useState } from 'react';
import { DepartmentNode } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useBiometricStore } from '../../store/useBiometricStore';
import { Building2, Plus, Users, Camera, ShieldCheck, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export const DepartmentPage: React.FC = () => {
  const { departments, addDepartment } = useBiometricStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [managerName, setManagerName] = useState('');

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    addDepartment({
      name,
      code,
      type: 'school',
      managerName: managerName || 'Unassigned',
      totalUsers: 0,
      totalCameras: 0,
      buildingName: 'Main Campus',
    });

    toast.success(`Department "${name}" created!`);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" /> Departments & Institutional Tree
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage faculties, schools, branches, buildings, classrooms, and biometric security zones.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Add Department Node
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id} glass className="p-5 flex flex-col justify-between hover:border-primary/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="primary" className="font-mono text-xs uppercase">
                  {dept.code}
                </Badge>
                <Badge variant="secondary" className="capitalize text-[10px]">
                  {dept.type}
                </Badge>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{dept.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {dept.buildingName || 'Main Campus'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-4 h-4 text-indigo-500" /> {dept.totalUsers} Members
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Camera className="w-4 h-4 text-emerald-500" /> {dept.totalCameras} Cameras
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Institutional Department Node"
        description="Create a new academic or operational unit."
      >
        <form onSubmit={handleAddDept} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Department Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mechanical Engineering Dept"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Code Identifier
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="MECH"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Head of Department / Manager
            </label>
            <input
              type="text"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder="Dr. Alexander Wright"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
