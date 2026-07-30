import React, { useState } from 'react';
import { CalendarDays, Clock, Plus, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'sonner';

export const SchedulePage: React.FC = () => {
  const [shifts, setShifts] = useState([
    { id: '1', name: 'Standard Morning Shift', start: '08:00', end: '17:00', grace: 15, late: 30, activeDays: 'Mon - Fri' },
    { id: '2', name: 'Academic Lecture Block A', start: '09:00', end: '12:00', grace: 10, late: 15, activeDays: 'Mon, Wed, Fri' },
    { id: '3', name: 'Night Security Guard Shift', start: '22:00', end: '06:00', grace: 20, late: 30, activeDays: 'All Days' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    setShifts([
      ...shifts,
      { id: Date.now().toString(), name: shiftName, start: startTime, end: endTime, grace: 15, late: 30, activeDays: 'Mon - Fri' },
    ]);
    toast.success(`Shift policy "${shiftName}" created!`);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" /> Schedules & Shift Policy Rules
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure working hours, class timetables, late grace periods, and holiday calendars.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Create Shift Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shifts.map((s) => (
          <Card key={s.id} glass className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="primary" className="font-mono text-xs">
                  {s.start} - {s.end}
                </Badge>
                <Badge variant="secondary">{s.activeDays}</Badge>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{s.name}</h3>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center justify-between">
                  <span>Grace Period:</span>
                  <span className="font-mono font-bold text-emerald-500">{s.grace} Mins</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>Late Threshold:</span>
                  <span className="font-mono font-bold text-amber-500">{s.late} Mins</span>
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Shift & Attendance Rule"
        description="Specify timetable boundaries and late penalties."
      >
        <form onSubmit={handleCreateShift} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Shift / Timetable Name
            </label>
            <input
              type="text"
              required
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              placeholder="e.g. Afternoon Lab Shift"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Shift
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
