import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import * as genAPI from '../../api/timetableGenerator';
import * as timetableAPI from '../../api/timetable';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Cpu, ChevronLeft, ChevronRight, Sparkles, RotateCcw, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

const STEPS = ['Configure', 'Requirements', 'Availability', 'Generate'];

const DAYS = [
  { key: 'MONDAY', label: 'Mon' },
  { key: 'TUESDAY', label: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wed' },
  { key: 'THURSDAY', label: 'Thu' },
  { key: 'FRIDAY', label: 'Fri' },
  { key: 'SATURDAY', label: 'Sat' },
];

const ALGORITHMS = [
  { value: 'HYBRID', label: 'Hybrid CSP + GA (Recommended)' },
  { value: 'CSP_BACKTRACK', label: 'Constraint Satisfaction Only' },
  { value: 'GENETIC', label: 'Genetic Algorithm Only' },
];

export default function TimetableGenerator() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1: Config
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [config, setConfig] = useState({
    name: '',
    academic_year: '',
    classes: [],
    sections: [],
    working_days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
    algorithm: 'HYBRID',
    max_iterations: 1000,
    population_size: 50,
    weight_workload_balance: 0.8,
    weight_subject_spread: 0.7,
    weight_teacher_preference: 0.6,
    weight_room_optimization: 0.5,
    weight_no_consecutive_heavy: 0.7,
  });

  // Step 2: Requirements
  const [requirements, setRequirements] = useState([]);

  // Step 3: Availability
  const [availability, setAvailability] = useState([]);

  // Step 4: Generation
  const [generationRun, setGenerationRun] = useState(null);
  const [progress, setProgress] = useState({ percent: 0, message: '' });
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const pollRef = useRef(null);

  // Load reference data
  useEffect(() => {
    loadReferenceData();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const loadReferenceData = async () => {
    try {
      const [yearsRes, classesRes, subjectsRes, teachersRes] = await Promise.all([
        fetch('/api/v1/academics/academic-years/', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/v1/academics/classes/', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/v1/academics/subjects/', { headers: getHeaders() }).then(r => r.json()),
        fetch('/api/v1/staff/', { headers: getHeaders() }).then(r => r.json()),
      ]);
      setAcademicYears(yearsRes.results || yearsRes || []);
      setClasses(classesRes.results || classesRes || []);
      setSubjects(subjectsRes.results || subjectsRes || []);
      setTeachers(teachersRes.results || teachersRes || []);
    } catch (err) {
      console.error('Failed to load reference data:', err);
    }
  };

  const getHeaders = () => {
    const token = localStorage.getItem('access_token');
    const tenant = localStorage.getItem('tenant_subdomain');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (tenant) headers['X-Tenant-Subdomain'] = tenant;
    return headers;
  };

  // Load sections when classes change
  useEffect(() => {
    if (config.classes.length > 0 && config.academic_year) {
      loadSections();
    }
  }, [config.classes, config.academic_year]);

  const loadSections = async () => {
    try {
      const res = await fetch(
        `/api/v1/academics/sections/?academic_year=${config.academic_year}`,
        { headers: getHeaders() }
      );
      const data = await res.json();
      setSections(data.results || data || []);
    } catch (err) {
      console.error('Failed to load sections:', err);
    }
  };

  // Step navigation
  const canNext = () => {
    if (step === 0) return config.name && config.academic_year && config.classes.length > 0;
    if (step === 1) return requirements.length > 0;
    if (step === 2) return true;
    return false;
  };

  const handleNext = () => {
    if (step === 0) {
      loadRequirements();
    }
    if (step === 1) {
      saveRequirements();
      loadAvailability();
    }
    if (step === 2) {
      saveAvailability();
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  // ========== Step 1: Config ==========
  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const toggleWorkingDay = (day) => {
    setConfig(prev => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter(d => d !== day)
        : [...prev.working_days, day],
    }));
  };

  const toggleClass = (classId) => {
    setConfig(prev => ({
      ...prev,
      classes: prev.classes.includes(classId)
        ? prev.classes.filter(c => c !== classId)
        : [...prev.classes, classId],
    }));
  };

  // ========== Step 2: Requirements ==========
  const loadRequirements = async () => {
    try {
      const res = await genAPI.getSubjectRequirements({
        academic_year: config.academic_year,
      });
      const data = res.data?.results || res.data || [];
      if (data.length > 0) {
        setRequirements(data);
      } else {
        const initial = [];
        for (const classId of config.classes) {
          const cls = classes.find(c => String(c.id) === String(classId));
          for (const subj of subjects) {
            initial.push({
              _key: `${classId}-${subj.id}`,
              academic_year: config.academic_year,
              class_obj: classId,
              class_name: cls?.name || '',
              subject: subj.id,
              subject_name: subj.name,
              teacher: '',
              periods_per_week: 5,
              requires_lab: false,
              consecutive_periods: 1,
            });
          }
        }
        setRequirements(initial);
      }
    } catch {
      toast.error('Failed to load requirements');
    }
  };

  const updateRequirement = (key, field, value) => {
    setRequirements(prev =>
      prev.map(r => (r._key || r.id) === key ? { ...r, [field]: value } : r)
    );
  };

  const removeRequirement = (key) => {
    setRequirements(prev => prev.filter(r => (r._key || r.id) !== key));
  };

  const saveRequirements = async () => {
    const byClass = {};
    for (const req of requirements) {
      const cid = req.class_obj;
      if (!byClass[cid]) byClass[cid] = [];
      byClass[cid].push({
        subject: req.subject,
        periods_per_week: req.periods_per_week,
        teacher: req.teacher || null,
        requires_lab: req.requires_lab,
        consecutive_periods: req.consecutive_periods,
      });
    }

    for (const [classId, reqs] of Object.entries(byClass)) {
      try {
        await genAPI.bulkCreateSubjectRequirements({
          academic_year: config.academic_year,
          class_obj: classId,
          requirements: reqs,
        });
      } catch (err) {
        console.error('Failed to save requirements for class:', classId, err);
      }
    }
  };

  // ========== Step 3: Availability ==========
  const loadAvailability = async () => {
    try {
      const res = await genAPI.getTeacherAvailability({
        academic_year: config.academic_year,
      });
      const data = res.data?.results || res.data || [];
      if (data.length > 0) {
        setAvailability(data);
      } else {
        const teacherIds = [...new Set(requirements.map(r => r.teacher).filter(Boolean))];
        const initial = [];
        for (const tid of teacherIds) {
          const teacher = teachers.find(t => String(t.id) === String(tid));
          for (const day of DAYS) {
            initial.push({
              _key: `${tid}-${day.key}`,
              academic_year: config.academic_year,
              teacher: tid,
              teacher_name: teacher ? `${teacher.first_name} ${teacher.last_name}` : tid,
              day_of_week: day.key,
              is_available: true,
              max_periods_per_day: 6,
              max_consecutive_periods: 3,
            });
          }
        }
        setAvailability(initial);
      }
    } catch {
      toast.error('Failed to load availability');
    }
  };

  const updateAvailability = (key, field, value) => {
    setAvailability(prev =>
      prev.map(a => (a._key || a.id) === key ? { ...a, [field]: value } : a)
    );
  };

  const saveAvailability = async () => {
    const byTeacher = {};
    for (const a of availability) {
      const tid = a.teacher;
      if (!byTeacher[tid]) byTeacher[tid] = [];
      byTeacher[tid].push({
        day_of_week: a.day_of_week,
        is_available: a.is_available,
        max_periods_per_day: a.max_periods_per_day,
        max_consecutive_periods: a.max_consecutive_periods,
      });
    }

    for (const [teacherId, avails] of Object.entries(byTeacher)) {
      try {
        await genAPI.bulkSetTeacherAvailability({
          academic_year: config.academic_year,
          teacher: teacherId,
          availability: avails,
        });
      } catch (err) {
        console.error('Failed to save availability for teacher:', teacherId, err);
      }
    }
  };

  // ========== Step 4: Generate ==========
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const configPayload = {
        name: config.name,
        academic_year: config.academic_year,
        classes: config.classes,
        sections: config.sections,
        working_days: config.working_days,
        algorithm: config.algorithm,
        max_iterations: config.max_iterations,
        population_size: config.population_size,
        weight_workload_balance: config.weight_workload_balance,
        weight_subject_spread: config.weight_subject_spread,
        weight_teacher_preference: config.weight_teacher_preference,
        weight_room_optimization: config.weight_room_optimization,
        weight_no_consecutive_heavy: config.weight_no_consecutive_heavy,
      };

      const configRes = await genAPI.createGenerationConfig(configPayload);
      const savedConfigId = configRes.data.id;

      const runRes = await genAPI.triggerGeneration(savedConfigId);
      setGenerationRun(runRes.data);
      setProgress({ percent: 0, message: 'Starting...' });

      pollRef.current = setInterval(async () => {
        try {
          const progRes = await genAPI.getGenerationProgress(runRes.data.id);
          const p = progRes.data;
          setProgress({ percent: p.progress_percent, message: p.progress_message });
          setGenerationRun(prev => ({ ...prev, ...p }));

          if (p.status === 'COMPLETED' || p.status === 'FAILED') {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setLoading(false);

            if (p.status === 'COMPLETED') {
              toast.success(`Timetable generated! Score: ${p.fitness_score}/100`);
              loadPreview(runRes.data.id);
              loadAnalysis(runRes.data.id);
            } else {
              toast.error(p.error_message || 'Generation failed.');
            }
          }
        } catch {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setLoading(false);
        }
      }, 2000);
    } catch (err) {
      setLoading(false);
      toast.error('Failed to start generation: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCancel = async () => {
    if (generationRun?.id) {
      try {
        await genAPI.cancelGeneration(generationRun.id);
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        setLoading(false);
        toast.info('Generation cancelled.');
      } catch {
        toast.error('Failed to cancel.');
      }
    }
  };

  const loadPreview = async (runId) => {
    try {
      const res = await genAPI.getGenerationPreview(runId);
      setPreview(res.data);
    } catch {
      console.error('Failed to load preview');
    }
  };

  const loadAnalysis = async (runId) => {
    try {
      const res = await genAPI.getGenerationAnalysis(runId);
      setAnalysis(res.data);
    } catch {
      console.error('Failed to load analysis');
    }
  };

  const handleApply = async () => {
    if (!generationRun?.id) return;
    try {
      setLoading(true);
      const res = await genAPI.applyGeneration(generationRun.id);
      toast.success(res.data.message || 'Timetable applied!');
      setGenerationRun(prev => ({ ...prev, status: 'APPLIED' }));
    } catch (err) {
      toast.error('Failed to apply: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    if (!generationRun?.id) return;
    try {
      setLoading(true);
      const res = await genAPI.rollbackGeneration(generationRun.id);
      toast.success(res.data.message || 'Rolled back!');
      setGenerationRun(prev => ({ ...prev, status: 'ROLLED_BACK' }));
    } catch (err) {
      toast.error('Failed to rollback: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDER ==========
  return (
    <AnimatedPage>
      <div className="space-y-6 max-w-7xl mx-auto">
        <PageHeader
          title="AI Timetable Generator"
          description="Automatically generate conflict-free timetables using AI scheduling algorithms"
        />

        {/* Stepper */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              {STEPS.map((label, idx) => (
                <React.Fragment key={label}>
                  <div className="flex items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${idx <= step
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {idx + 1}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${idx <= step ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                      {label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 rounded transition-colors ${idx < step ? 'bg-primary' : 'bg-muted'
                      }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {step === 0 && (
              <StepConfigure
                config={config}
                academicYears={academicYears}
                classes={classes}
                onConfigChange={handleConfigChange}
                onToggleClass={toggleClass}
                onToggleDay={toggleWorkingDay}
              />
            )}

            {step === 1 && (
              <StepRequirements
                requirements={requirements}
                teachers={teachers}
                onUpdate={updateRequirement}
                onRemove={removeRequirement}
              />
            )}

            {step === 2 && (
              <StepAvailability
                availability={availability}
                onUpdate={updateAvailability}
              />
            )}

            {step === 3 && (
              <StepGenerate
                config={config}
                generationRun={generationRun}
                progress={progress}
                preview={preview}
                analysis={analysis}
                loading={loading}
                onGenerate={handleGenerate}
                onCancel={handleCancel}
                onApply={handleApply}
                onRollback={handleRollback}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handleBack}
            disabled={step === 0}
            variant="outline"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          {step < STEPS.length - 1 && (
            <Button
              onClick={handleNext}
              disabled={!canNext()}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function StepConfigure({ config, academicYears, classes, onConfigChange, onToggleClass, onToggleDay }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Configuration</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Config Name</label>
          <input
            type="text"
            value={config.name}
            onChange={e => onConfigChange('name', e.target.value)}
            placeholder="e.g., AY 2025-26 Full Schedule"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Academic Year</label>
          <select
            value={config.academic_year}
            onChange={e => onConfigChange('academic_year', e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select...</option>
            {academicYears.map(ay => (
              <option key={ay.id} value={ay.id}>{ay.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Algorithm</label>
          <select
            value={config.algorithm}
            onChange={e => onConfigChange('algorithm', e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {ALGORITHMS.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Classes */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Select Classes</label>
        <div className="flex flex-wrap gap-2">
          {classes.map(cls => (
            <button
              key={cls.id}
              onClick={() => onToggleClass(cls.id)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${config.classes.includes(cls.id)
                  ? 'bg-primary/10 border-primary/40 text-primary'
                  : 'bg-card border-input text-muted-foreground hover:bg-muted'
                }`}
            >
              {cls.name || cls.display_name}
            </button>
          ))}
        </div>
      </div>

      {/* Working Days */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Working Days</label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map(day => (
            <button
              key={day.key}
              onClick={() => onToggleDay(day.key)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${config.working_days.includes(day.key)
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-card border-input text-muted-foreground hover:bg-muted'
                }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Weights */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Advanced Settings
        </summary>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'weight_workload_balance', label: 'Workload Balance' },
            { key: 'weight_subject_spread', label: 'Subject Spread' },
            { key: 'weight_teacher_preference', label: 'Teacher Preference' },
            { key: 'weight_room_optimization', label: 'Room Optimization' },
            { key: 'weight_no_consecutive_heavy', label: 'No Consecutive Heavy' },
          ].map(w => (
            <div key={w.key}>
              <label className="block text-sm text-muted-foreground">
                {w.label}: <span className="text-foreground font-medium">{config[w.key]}</span>
              </label>
              <input
                type="range"
                min="0" max="1" step="0.1"
                value={config[w.key]}
                onChange={e => onConfigChange(w.key, parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Max Iterations</label>
            <input
              type="number"
              value={config.max_iterations}
              onChange={e => onConfigChange('max_iterations', parseInt(e.target.value) || 1000)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Population Size</label>
            <input
              type="number"
              value={config.population_size}
              onChange={e => onConfigChange('population_size', parseInt(e.target.value) || 50)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </details>
    </div>
  );
}

function StepRequirements({ requirements, teachers, onUpdate, onRemove }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Subject Period Requirements</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Define how many periods per week each subject needs for each class.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Class</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Subject</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Teacher</th>
              <th className="px-3 py-2 text-center font-medium text-muted-foreground">Periods/Week</th>
              <th className="px-3 py-2 text-center font-medium text-muted-foreground">Lab?</th>
              <th className="px-3 py-2 text-center font-medium text-muted-foreground">Consecutive</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requirements.map(req => {
              const key = req._key || req.id;
              return (
                <tr key={key} className="hover:bg-muted/50 transition-colors">
                  <td className="px-3 py-2 text-foreground">{req.class_name}</td>
                  <td className="px-3 py-2 text-foreground">{req.subject_name}</td>
                  <td className="px-3 py-2">
                    <select
                      value={req.teacher || ''}
                      onChange={e => onUpdate(key, 'teacher', e.target.value || null)}
                      className="w-full rounded-lg border border-input bg-background text-sm text-foreground px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Select teacher...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.first_name} {t.last_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="number"
                      min="1" max="20"
                      value={req.periods_per_week}
                      onChange={e => onUpdate(key, 'periods_per_week', parseInt(e.target.value) || 1)}
                      className="w-16 text-center rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={req.requires_lab}
                      onChange={e => onUpdate(key, 'requires_lab', e.target.checked)}
                      className="rounded border-input text-primary accent-primary"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="number"
                      min="1" max="4"
                      value={req.consecutive_periods}
                      onChange={e => onUpdate(key, 'consecutive_periods', parseInt(e.target.value) || 1)}
                      className="w-16 text-center rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => onRemove(key)}
                      className="text-destructive hover:text-destructive/80 text-xs font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {requirements.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No requirements. Go back and select classes first.
        </div>
      )}
    </div>
  );
}

function StepAvailability({ availability, onUpdate }) {
  // Group by teacher
  const grouped = {};
  for (const a of availability) {
    const tid = a.teacher;
    if (!grouped[tid]) {
      grouped[tid] = { name: a.teacher_name || tid, days: {} };
    }
    grouped[tid].days[a.day_of_week] = a;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Teacher Availability</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Set each teacher's availability per day. Unchecked days will be excluded.
      </p>

      <div className="space-y-4">
        {Object.entries(grouped).map(([tid, { name, days }]) => (
          <div key={tid} className="border border-border rounded-xl p-4 bg-muted/20">
            <h3 className="font-medium text-foreground mb-3">{name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {DAYS.map(day => {
                const avail = days[day.key];
                if (!avail) return null;
                const key = avail._key || avail.id;
                return (
                  <div key={day.key} className="text-center">
                    <div className="text-xs font-medium text-muted-foreground mb-1">{day.label}</div>
                    <label className="flex items-center justify-center gap-1 mb-1">
                      <input
                        type="checkbox"
                        checked={avail.is_available}
                        onChange={e => onUpdate(key, 'is_available', e.target.checked)}
                        className="rounded border-input text-primary accent-primary"
                      />
                      <span className="text-xs text-foreground">Available</span>
                    </label>
                    {avail.is_available && (
                      <div className="text-xs space-y-1">
                        <div>
                          <label className="text-muted-foreground">Max/day:</label>
                          <input
                            type="number"
                            min="1" max="10"
                            value={avail.max_periods_per_day}
                            onChange={e => onUpdate(key, 'max_periods_per_day', parseInt(e.target.value) || 6)}
                            className="w-12 text-center rounded border border-input bg-background text-xs text-foreground ml-1 focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="text-muted-foreground">Max consec:</label>
                          <input
                            type="number"
                            min="1" max="8"
                            value={avail.max_consecutive_periods}
                            onChange={e => onUpdate(key, 'max_consecutive_periods', parseInt(e.target.value) || 3)}
                            className="w-12 text-center rounded border border-input bg-background text-xs text-foreground ml-1 focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {availability.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No teachers to configure. Assign teachers in the Requirements step.
        </div>
      )}
    </div>
  );
}

function StepGenerate({ config, generationRun, progress, preview, analysis, loading, onGenerate, onCancel, onApply, onRollback }) {
  const isRunning = loading && generationRun && !['COMPLETED', 'FAILED', 'APPLIED', 'ROLLED_BACK'].includes(generationRun.status);
  const isCompleted = generationRun?.status === 'COMPLETED';
  const isFailed = generationRun?.status === 'FAILED';
  const isApplied = generationRun?.status === 'APPLIED';

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Generate Timetable</h2>

      {/* Summary */}
      <div className="bg-muted/50 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-foreground mb-2">Configuration Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
          <div><span className="font-medium text-foreground">Name:</span> {config.name}</div>
          <div><span className="font-medium text-foreground">Algorithm:</span> {config.algorithm}</div>
          <div><span className="font-medium text-foreground">Classes:</span> {config.classes.length}</div>
          <div><span className="font-medium text-foreground">Days:</span> {config.working_days.length}</div>
        </div>
      </div>

      {/* Generate Button */}
      {!generationRun && (
        <Button
          onClick={onGenerate}
          disabled={loading}
          className="w-full py-3"
          size="lg"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Starting...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate Timetable</>
          )}
        </Button>
      )}

      {/* Progress */}
      {isRunning && (
        <div className="mt-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>{progress.message || 'Processing...'}</span>
            <span className="text-primary font-medium">{progress.percent}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <button
            onClick={onCancel}
            className="mt-3 text-sm text-destructive hover:text-destructive/80 font-medium transition-colors"
          >
            Cancel Generation
          </button>
        </div>
      )}

      {/* Failed */}
      {isFailed && (
        <div className="mt-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <h3 className="text-destructive font-medium flex items-center gap-2">
            <XCircle className="w-5 h-5" /> Generation Failed
          </h3>
          <p className="text-destructive/80 text-sm mt-1">{generationRun.error_message}</p>
          <Button
            onClick={onGenerate}
            variant="destructive"
            size="sm"
            className="mt-3"
          >
            <RotateCcw className="w-4 h-4 mr-1" /> Retry
          </Button>
        </div>
      )}

      {/* Completed */}
      {isCompleted && (
        <div className="mt-6 space-y-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <h3 className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Generation Complete
            </h3>
            <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-emerald-600 dark:text-emerald-400">Fitness Score:</span>
                <span className="ml-1 font-bold text-foreground">{generationRun.fitness_score}/100</span>
              </div>
              <div>
                <span className="text-emerald-600 dark:text-emerald-400">Duration:</span>
                <span className="ml-1 text-foreground">{generationRun.duration_seconds?.toFixed(1)}s</span>
              </div>
              <div>
                <span className="text-emerald-600 dark:text-emerald-400">Conflicts:</span>
                <span className="ml-1 text-foreground">{generationRun.conflicts_found}</span>
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview && <TimetablePreview preview={preview} />}

          {/* Analysis */}
          {analysis && <TimetableAnalysis analysis={analysis} />}

          {/* Apply */}
          <div className="flex gap-3">
            <Button
              onClick={onApply}
              disabled={loading}
              variant="success"
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Apply to Timetable
            </Button>
            <Button
              onClick={onGenerate}
              disabled={loading}
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Regenerate
            </Button>
          </div>
        </div>
      )}

      {/* Applied */}
      {isApplied && (
        <div className="mt-6 bg-primary/10 border border-primary/20 rounded-xl p-4">
          <h3 className="text-primary font-medium flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Timetable Applied
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            The generated timetable has been applied. You can view it in the Timetable View page.
          </p>
          <Button
            onClick={onRollback}
            disabled={loading}
            variant="outline"
            size="sm"
            className="mt-3 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
          >
            <RotateCcw className="w-4 h-4 mr-1" /> Rollback
          </Button>
        </div>
      )}
    </div>
  );
}

function TimetablePreview({ preview }) {
  const sections = preview?.timetable?.sections || {};

  return (
    <div>
      <h3 className="text-md font-semibold text-foreground mb-3">Preview</h3>
      {Object.entries(sections).map(([sectionId, sectionData]) => (
        <div key={sectionId} className="mb-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            {sectionData.class_name} - {sectionData.section_name}
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-border text-xs">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border px-2 py-1 text-left text-muted-foreground">Day</th>
                  {(sectionData.days?.[Object.keys(sectionData.days)[0]] || []).map((_, idx) => (
                    <th key={idx} className="border border-border px-2 py-1 text-center text-muted-foreground">P{idx + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(sectionData.days || {}).map(([day, slots]) => (
                  <tr key={day}>
                    <td className="border border-border px-2 py-1 font-medium text-muted-foreground">{day.slice(0, 3)}</td>
                    {slots.map((slot, idx) => (
                      <td key={idx} className={`border border-border px-2 py-1 text-center text-foreground ${slot.subject_name ? 'bg-primary/5' : 'bg-muted/50'}`}>
                        {slot.subject_name || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function TimetableAnalysis({ analysis }) {
  return (
    <div>
      <h3 className="text-md font-semibold text-foreground mb-3">Analysis</h3>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-primary">{analysis.summary?.total_teachers || 0}</div>
          <div className="text-xs text-muted-foreground">Teachers</div>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-primary">{analysis.summary?.total_sections || 0}</div>
          <div className="text-xs text-muted-foreground">Sections</div>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-primary">{analysis.fitness_score?.toFixed(1) || 0}</div>
          <div className="text-xs text-muted-foreground">Fitness Score</div>
        </div>
      </div>

      {analysis.potential_issues?.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
          <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Observations
          </h4>
          <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
            {analysis.potential_issues.map((issue, idx) => (
              <li key={idx}>- {issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
