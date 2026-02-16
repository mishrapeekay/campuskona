import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    fetchTemplates,
    generateReport,
    selectTemplates,
    selectReportGenerating,
} from '../../store/slices/reportsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Loader2, CheckCircle2 } from 'lucide-react';
import showToast from '../../utils/toast';

const MODULE_OPTIONS = [
    { value: 'STUDENTS', label: 'Students' },
    { value: 'ACADEMICS', label: 'Academics' },
    { value: 'ATTENDANCE', label: 'Attendance' },
    { value: 'FEE', label: 'Fee & Finance' },
    { value: 'EXAM', label: 'Examinations' },
    { value: 'LIBRARY', label: 'Library' },
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'HOSTEL', label: 'Hostel' },
    { value: 'HR_PAYROLL', label: 'HR & Payroll' },
    { value: 'ADMISSIONS', label: 'Admissions' },
    { value: 'CUSTOM', label: 'Custom' },
];

const FORMAT_OPTIONS = [
    { value: 'PDF', label: 'PDF' },
    { value: 'EXCEL', label: 'Excel' },
    { value: 'CSV', label: 'CSV' },
];

const ReportBuilder = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const templates = useSelector(selectTemplates);
    const generating = useSelector(selectReportGenerating);

    const [formData, setFormData] = useState({
        name: '',
        module: searchParams.get('module') || 'STUDENTS',
        template_id: searchParams.get('template') || '',
        output_format: 'PDF',
        parameters: {},
    });
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        dispatch(fetchTemplates({ module: formData.module, is_active: true }));
    }, [dispatch, formData.module]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            showToast.warning('Please enter a report name');
            return;
        }

        try {
            await dispatch(generateReport(formData)).unwrap();
            setSuccess(true);
            showToast.success('Report generation started!');
            setTimeout(() => navigate('/reports/generated'), 1500);
        } catch (err) {
            showToast.error('Failed to generate report: ' + (err.message || 'Unknown error'));
        }
    };

    const moduleTemplates = templates?.filter(t => t.module === formData.module) || [];

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Report Builder"
                    description="Configure and generate a new report"
                    action={
                        <Button variant="outline" onClick={() => navigate('/reports')}>
                            Back
                        </Button>
                    }
                />

                {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Report generation started! Redirecting to generated reports...</span>
                    </div>
                )}

                <form onSubmit={handleGenerate} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Report Configuration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Report Name <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="e.g., Monthly Attendance Report"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Module <span className="text-destructive">*</span>
                                    </label>
                                    <select
                                        value={formData.module}
                                        onChange={(e) => handleChange('module', e.target.value)}
                                        className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        {MODULE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Template (Optional)
                                    </label>
                                    <select
                                        value={formData.template_id}
                                        onChange={(e) => handleChange('template_id', e.target.value)}
                                        className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="">No template (custom)</option>
                                        {moduleTemplates.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Output Format
                                    </label>
                                    <select
                                        value={formData.output_format}
                                        onChange={(e) => handleChange('output_format', e.target.value)}
                                        className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        {FORMAT_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => navigate('/reports')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={generating || !formData.name}>
                            {generating ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                            ) : (
                                'Generate Report'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AnimatedPage>
    );
};

export default ReportBuilder;
