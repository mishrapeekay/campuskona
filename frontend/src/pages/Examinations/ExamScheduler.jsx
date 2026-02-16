import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Save,
  Calendar,
  Clock,
  Users,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  ChevronLeft,
  Wrench,
  Bot,
  Loader2,
  CalendarDays
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
  getExaminations,
  getAvailableExamHalls,
  createExamScheduleConfig,
  triggerExamScheduleGeneration,
  getExamScheduleRunProgress,
  getExamScheduleRunById,
  applyExamScheduleRun,
  rollbackExamScheduleRun,
} from '../../api/examinations';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  const subdomain = localStorage.getItem('tenant_subdomain') || 'default';
  return {
    Authorization: `Bearer ${token}`,
    'X-Tenant': subdomain,
    'Content-Type': 'application/json',
  };
};

const DAYS_OPTIONS = [
  { value: 'MONDAY', label: 'Mon' },
  { value: 'TUESDAY', label: 'Tue' },
  { value: 'WEDNESDAY', label: 'Wed' },
  { value: 'THURSDAY', label: 'Thu' },
  { value: 'FRIDAY', label: 'Fri' },
  { value: 'SATURDAY', label: 'Sat' },
];

const ALGORITHM_OPTIONS = [
  { value: 'HYBRID', label: 'Hybrid CSP + Optimization (Recommended)' },
  { value: 'CSP_BACKTRACK', label: 'CSP Backtracking Only' },
  { value: 'GENETIC', label: 'Genetic Algorithm' },
];

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function StepConfigure({
  config, setConfig, examinations, examHalls,
  classes, subjects, loading,
}) {
  const toggleDay = (day) => {
    setConfig(prev => ({
      ...prev,
      exam_days: prev.exam_days.includes(day)
        ? prev.exam_days.filter(d => d !== day)
        : [...prev.exam_days, day],
    }));
  };

  const toggleClass = (id) => {
    setConfig(prev => ({
      ...prev,
      classes: prev.classes.includes(id)
        ? prev.classes.filter(c => c !== id)
        : [...prev.classes, id],
    }));
  };

  const toggleHall = (id) => {
    setConfig(prev => ({
      ...prev,
      exam_halls: prev.exam_halls.includes(id)
        ? prev.exam_halls.filter(h => h !== id)
        : [...prev.exam_halls, id],
    }));
  };

  const toggleHeavy = (id) => {
    setConfig(prev => ({
      ...prev,
      heavy_subjects: prev.heavy_subjects.includes(id)
        ? prev.heavy_subjects.filter(s => s !== id)
        : [...prev.heavy_subjects, id],
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            Basic Configuration
          </CardTitle>
          <CardDescription>Set up the fundamental parameters for the exam schedule.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Config Name</label>
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={config.name}
                onChange={e => setConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Mid-Term Exam Schedule"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Examination</label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={config.examination}
                onChange={e => setConfig(prev => ({ ...prev, examination: parseInt(e.target.value) || '' }))}
              >
                <option value="">Select examination...</option>
                {examinations.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Start Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={config.start_date}
                  onChange={e => setConfig(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">End Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={config.end_date}
                  onChange={e => setConfig(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Exam Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OPTIONS.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={`
                                        inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2
                                        ${config.exam_days.includes(d.value) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-background'}
                                    `}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Session Timings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Morning Start</label>
              <input
                type="time"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={config.morning_start}
                onChange={e => setConfig(prev => ({ ...prev, morning_start: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Morning End</label>
              <input
                type="time"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={config.morning_end}
                onChange={e => setConfig(prev => ({ ...prev, morning_end: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Afternoon Start</label>
              <input
                type="time"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={config.afternoon_start}
                onChange={e => setConfig(prev => ({ ...prev, afternoon_start: e.target.value || null }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Afternoon End</label>
              <input
                type="time"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={config.afternoon_end}
                onChange={e => setConfig(prev => ({ ...prev, afternoon_end: e.target.value || null }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Participating Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
              {classes.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleClass(c.id)}
                  className={`
                                        inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                                        ${config.classes.includes(c.id) ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80' : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'}
                                    `}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Exam Halls
            </CardTitle>
          </CardHeader>
          <CardContent>
            {examHalls.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No exam halls available.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
                {examHalls.map(h => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => toggleHall(h.id)}
                    className={`
                                            inline-flex flex-col items-start rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent
                                            ${config.exam_halls.includes(h.id) ? 'border-primary ring-1 ring-primary bg-primary/5' : 'bg-card'}
                                        `}
                  >
                    <span className="font-semibold">{h.code}</span>
                    <span className="text-xs text-muted-foreground">{h.seating_capacity} seats</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Constraints & Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Min Gap (days)</label>
              <input
                type="number" min="0" max="5"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={config.min_gap_between_exams}
                onChange={e => setConfig(prev => ({ ...prev, min_gap_between_exams: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Max Exams/Day</label>
              <input
                type="number" min="1" max="3"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={config.max_exams_per_day}
                onChange={e => setConfig(prev => ({ ...prev, max_exams_per_day: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Algorithm</label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={config.algorithm}
                onChange={e => setConfig(prev => ({ ...prev, algorithm: e.target.value }))}
              >
                {ALGORITHM_OPTIONS.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Heavy Subjects (avoid consecutive days)</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleHeavy(s.id)}
                  className={`
                                        inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                                        ${config.heavy_subjects.includes(s.id) ? 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80' : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'}
                                    `}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StepGenerate({ runId, progress, result, onGenerate, onApply, onRollback, generating }) {
  return (
    <div className="space-y-6">
      {!runId && !generating && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Bot className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Generate Schedule</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              The AI will use constraint satisfaction and genetic algorithms to create
              an optimal exam schedule that avoids conflicts and balances workload.
            </p>
            <Button onClick={onGenerate} size="lg" className="px-8">
              <Play className="w-4 h-4 mr-2" />
              Start Generation
            </Button>
          </CardContent>
        </Card>
      )}

      {(generating || (progress && progress.status && !['COMPLETED', 'FAILED'].includes(progress.status))) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-muted/20 stroke-current"
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <circle
                    className="text-primary stroke-current transition-all duration-500 ease-in-out"
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * (progress?.progress_percent || 0)) / 100}
                    transform="rotate(-90 50 50)"
                  ></circle>
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-sm font-bold text-primary">
                  {Math.round(progress?.progress_percent || 0)}%
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg animate-pulse">Generating Schedule...</h3>
                <p className="text-sm text-muted-foreground mt-1">{progress?.progress_message || 'Initializing AI model...'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {progress?.status === 'FAILED' && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">Generation Failed</h3>
            <p className="text-muted-foreground mb-6">{progress?.error_message || 'An unexpected error occurred.'}</p>
            <Button variant="destructive" onClick={onGenerate}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Generation
            </Button>
          </CardContent>
        </Card>
      )}

      {result && progress?.status === 'COMPLETED' && (
        <div className="space-y-6">
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Schedule Generated Automatically
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background rounded-lg p-4 text-center border shadow-sm">
                  <div className="text-2xl font-bold text-primary">{result.summary?.total_exams || 0}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Total Exams</div>
                </div>
                <div className="bg-background rounded-lg p-4 text-center border shadow-sm">
                  <div className="text-2xl font-bold text-primary">{result.summary?.total_days || 0}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Total Days</div>
                </div>
                <div className="bg-background rounded-lg p-4 text-center border shadow-sm">
                  <div className="text-2xl font-bold text-primary">{progress?.fitness_score?.toFixed(1) || '-'}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Fitness Score</div>
                </div>
                <div className="bg-background rounded-lg p-4 text-center border shadow-sm">
                  <div className="text-2xl font-bold text-emerald-600">0</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Conflicts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Session</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Class</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subject</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Students</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Halls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(result.exams || []).map((exam, idx) => (
                      <tr key={idx} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{exam.date}</td>
                        <td className="px-4 py-3">
                          <Badge variant={exam.session === 'MORNING' ? 'warning' : 'info'}>
                            {exam.session}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-foreground">{exam.class_name}</td>
                        <td className="px-4 py-3 text-foreground">{exam.subject_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{exam.student_count}</td>
                        <td className="px-4 py-3 text-muted-foreground">{exam.hall_ids?.length || 0} hall(s)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {progress?.warnings?.length > 0 && (
            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Warnings Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm text-amber-800 dark:text-amber-300 space-y-1">
                  {progress.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border mt-4">
            {progress?.status === 'COMPLETED' && (
              <>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onApply}>
                  <Check className="w-4 h-4 mr-2" />
                  Apply Schedule
                </Button>
                <Button variant="outline" className="flex-1" onClick={onGenerate}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </>
            )}
            {progress?.status === 'APPLIED' && (
              <div className="w-full flex items-center justify-between bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 p-4 rounded-lg">
                <span className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Schedule Applied Successfully
                </span>
                <Button variant="destructive" size="sm" onClick={onRollback}>
                  Rollback
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ExamScheduler() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Reference data
  const [examinations, setExaminations] = useState([]);
  const [examHalls, setExamHalls] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Config
  const [config, setConfig] = useState({
    name: '',
    examination: '',
    classes: [],
    sections: [],
    exam_halls: [],
    start_date: '',
    end_date: '',
    exam_days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    morning_start: '09:00',
    morning_end: '12:00',
    afternoon_start: '',
    afternoon_end: '',
    min_gap_between_exams: 1,
    max_exams_per_day: 1,
    avoid_back_to_back_heavy: true,
    heavy_subjects: [],
    algorithm: 'HYBRID',
    max_iterations: 500,
    population_size: 40,
    weight_gap_balance: 0.8,
    weight_heavy_subject_spread: 0.7,
    weight_hall_utilization: 0.5,
    weight_invigilator_balance: 0.6,
  });

  // Generation
  const [configId, setConfigId] = useState(null);
  const [runId, setRunId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const pollRef = useRef(null);

  const { user } = useSelector(state => state.auth);

  // Load reference data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const headers = getHeaders();
        const [examsRes, hallsRes, classesRes, subjectsRes] = await Promise.all([
          fetch(`${API_BASE}/examinations/exams/?status=SCHEDULED`, { headers }).then(r => r.json()),
          getAvailableExamHalls().then(r => r.data).catch(() => ({ results: [] })),
          fetch(`${API_BASE}/academics/classes/`, { headers }).then(r => r.json()),
          fetch(`${API_BASE}/academics/subjects/`, { headers }).then(r => r.json()),
        ]);

        setExaminations(examsRes.results || examsRes || []);
        setExamHalls(hallsRes.results || hallsRes || []);
        setClasses(classesRes.results || classesRes || []);
        setSubjects(subjectsRes.results || subjectsRes || []);
      } catch (err) {
        console.error('Failed to load reference data:', err);
        // toast.error('Failed to load initial data');
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Cleanup polling
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const canNext = () => {
    if (step === 0) {
      return config.name && config.examination && config.classes.length > 0
        && config.exam_halls.length > 0 && config.start_date && config.end_date
        && config.exam_days.length > 0;
    }
    return true;
  };

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setResult(null);
    setProgress(null);

    try {
      let cid = configId;
      if (!cid) {
        const payload = {
          ...config,
          afternoon_start: config.afternoon_start || null,
          afternoon_end: config.afternoon_end || null,
        };
        const res = await createExamScheduleConfig(payload);
        cid = res.data.id;
        setConfigId(cid);
      }

      const genRes = await triggerExamScheduleGeneration(cid);
      const newRunId = genRes.data.run_id;
      setRunId(newRunId);

      pollRef.current = setInterval(async () => {
        try {
          const progressRes = await getExamScheduleRunProgress(newRunId);
          const p = progressRes.data;
          setProgress(p);

          if (['COMPLETED', 'FAILED'].includes(p.status)) {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setGenerating(false);

            if (p.status === 'COMPLETED') {
              const runRes = await getExamScheduleRunById(newRunId);
              setResult(runRes.data.generated_schedule);
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 2000);
    } catch (err) {
      setGenerating(false);
      const msg = err.response?.data?.error || err.message || 'Generation failed';
      toast.error(msg);
    }
  }, [config, configId]);

  const handleApply = useCallback(async () => {
    if (!runId) return;
    try {
      const res = await applyExamScheduleRun(runId);
      toast.success(res.data.message || 'Schedule applied successfully');
      setProgress(prev => ({ ...prev, status: 'APPLIED' }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Apply failed');
    }
  }, [runId]);

  const handleRollback = useCallback(async () => {
    if (!runId) return;
    try {
      const res = await rollbackExamScheduleRun(runId);
      toast.success(res.data.message || 'Rollback successful');
      setProgress(prev => ({ ...prev, status: 'ROLLED_BACK' }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Rollback failed');
    }
  }, [runId]);

  const steps = ['Configuration', 'Review & Generate'];

  return (
    <AnimatedPage>
      <div className="space-y-6 pb-12">
        <PageHeader
          title="AI Exam Scheduler"
          description="Automatically generate an optimal exam schedule using constraint satisfaction."
        />

        {/* Progress Steps */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted -z-10" />
          <div className="flex justify-between w-full max-w-md bg-background px-4">
            {steps.map((label, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <button
                  className={`
                                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                                        ${idx < step ? 'bg-primary border-primary text-primary-foreground' :
                      idx === step ? 'bg-background border-primary text-primary' :
                        'bg-background border-muted text-muted-foreground'}
                                    `}
                  onClick={() => idx < step && setStep(idx)}
                  disabled={idx > step}
                >
                  {idx < step ? <Check className="w-5 h-5" /> : idx + 1}
                </button>
                <span className={`text-xs font-medium ${idx === step ? 'text-primary' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          {step === 0 && (
            <StepConfigure
              config={config}
              setConfig={setConfig}
              examinations={examinations}
              examHalls={examHalls}
              classes={classes}
              subjects={subjects}
              loading={loading}
            />
          )}

          {step === 1 && (
            <StepGenerate
              runId={runId}
              progress={progress}
              result={result}
              onGenerate={handleGenerate}
              onApply={handleApply}
              onRollback={handleRollback}
              generating={generating}
            />
          )}

          {/* Navigation Footer */}
          <div className="flex justify-between pt-6 border-t mt-6">
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {step < steps.length - 1 && (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
              >
                Next Step
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
