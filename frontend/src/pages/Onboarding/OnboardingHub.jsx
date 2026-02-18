import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    Download, Upload, CheckCircle2, XCircle, AlertTriangle,
    ChevronDown, ChevronUp, ExternalLink, Loader2, FileSpreadsheet,
    Building2, Users, UserCheck, DollarSign, Calendar, Shield, TrendingUp,
    ArrowRight,
} from 'lucide-react';
import {
    getReadiness,
    getMasterTemplate,
    uploadMasterWorkbook,
    getClassSectionTemplate,
    uploadClassSections,
    getFeeStructureTemplate,
    uploadFeeStructure,
} from '../../api/onboarding';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function downloadBlob(response, filename) {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

function gradeColor(grade) {
    if (grade === 'A') return 'text-green-700 bg-green-100';
    if (grade === 'B') return 'text-blue-700 bg-blue-100';
    if (grade === 'C') return 'text-yellow-700 bg-yellow-100';
    if (grade === 'D') return 'text-orange-700 bg-orange-100';
    return 'text-red-700 bg-red-100';
}

function scoreBarColor(score) {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 30) return 'bg-orange-500';
    return 'bg-red-500';
}

function statusIcon(status) {
    if (status === 'ok') return <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />;
    if (status === 'missing') return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
    if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
    return <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0" />;
}

// ─────────────────────────────────────────────────────────────────
// StepUploadZone — reusable inline upload widget
// ─────────────────────────────────────────────────────────────────

function StepUploadZone({ templateFn, uploadFn, templateFilename, accept = '.xlsx,.xls,.csv', onSuccess }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);
    const inputRef = useRef();

    const handleTemplate = async () => {
        setDownloadingTemplate(true);
        try {
            const resp = await templateFn();
            downloadBlob(resp, templateFilename);
        } catch {
            setError('Could not download template. Please try again.');
        } finally {
            setDownloadingTemplate(false);
        }
    };

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setProgress(0);
        setResult(null);
        setError(null);
        try {
            const resp = await uploadFn(file, (pct) => setProgress(pct));
            setResult(resp.data || resp);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err?.response?.data?.error || 'Upload failed. Please check your file and try again.');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-3 mt-4">
            <div className="flex gap-2 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTemplate}
                    disabled={downloadingTemplate}
                >
                    {downloadingTemplate
                        ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        : <Download className="w-4 h-4 mr-1" />}
                    Download Template
                </Button>

                <Button
                    variant="default"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                >
                    {uploading
                        ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        : <Upload className="w-4 h-4 mr-1" />}
                    {uploading ? `Uploading ${progress}%` : 'Upload File'}
                </Button>
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFile}
                    className="hidden"
                />
            </div>

            {/* Progress */}
            {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    {error}
                </div>
            )}

            {/* Result */}
            {result && !error && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1 text-sm">
                    <p className="font-semibold text-green-800 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Upload Successful
                    </p>
                    {/* Classes+Sections result */}
                    {result.classes_created !== undefined && (
                        <p className="text-green-700">
                            Classes: {result.classes_created} created, {result.classes_existing} existing
                            &nbsp;|&nbsp;
                            Sections: {result.sections_created} created, {result.sections_existing} existing
                        </p>
                    )}
                    {/* Fee result */}
                    {result.fee_structures_created !== undefined && (
                        <p className="text-green-700">
                            Categories: {result.categories_created} created
                            &nbsp;|&nbsp;
                            Fee Structures: {result.fee_structures_created} created, {result.fee_structures_updated} updated
                        </p>
                    )}
                    {/* Students/Staff result */}
                    {result.imported !== undefined && (
                        <p className="text-green-700">{result.message}</p>
                    )}
                    {/* Warnings */}
                    {result.warnings?.length > 0 && (
                        <div className="mt-2">
                            <p className="font-medium text-yellow-700">{result.warnings.length} warnings:</p>
                            {result.warnings.slice(0, 5).map((w, i) => (
                                <p key={i} className="text-yellow-600 text-xs">Row {w.row}: {w.warning}</p>
                            ))}
                            {result.warnings.length > 5 && (
                                <p className="text-xs text-yellow-500">...and {result.warnings.length - 5} more</p>
                            )}
                        </div>
                    )}
                    {/* Errors */}
                    {result.errors?.length > 0 && (
                        <div className="mt-2">
                            <p className="font-medium text-red-700">{result.errors.length} errors:</p>
                            {result.errors.slice(0, 5).map((e, i) => (
                                <p key={i} className="text-red-600 text-xs">Row {e.row}: {e.error}</p>
                            ))}
                        </div>
                    )}
                    {/* DPDP flags */}
                    {result.dpdp_flags?.length > 0 && (
                        <div className="mt-2 bg-violet-50 border border-violet-200 rounded p-2">
                            <p className="font-medium text-violet-700">⚠ DPDP Sensitive Columns Detected</p>
                            {result.dpdp_flags.map((f, i) => (
                                <p key={i} className="text-violet-600 text-xs">{f.message}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Expandable step card
// ─────────────────────────────────────────────────────────────────

function StepCard({ number, icon: Icon, title, description, statusKey, checks, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    const check = checks?.[statusKey] || {};
    const stepStatus = check.status || 'missing';

    return (
        <Card className={`border-l-4 ${stepStatus === 'ok' ? 'border-l-green-500' : stepStatus === 'warning' ? 'border-l-yellow-400' : 'border-l-gray-200'}`}>
            <button
                type="button"
                className="w-full text-left"
                onClick={() => setOpen(o => !o)}
            >
                <CardHeader className="py-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                                ${stepStatus === 'ok' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {stepStatus === 'ok' ? '✓' : number}
                            </div>
                            <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            <div>
                                <CardTitle className="text-base">{title}</CardTitle>
                                <CardDescription className="text-sm">{description}</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {statusIcon(stepStatus)}
                            {check.count !== undefined && (
                                <Badge variant="secondary">{check.count}</Badge>
                            )}
                            {check.detail && stepStatus !== 'ok' && (
                                <span className="text-xs text-muted-foreground hidden sm:block">{check.detail}</span>
                            )}
                            {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                    </div>
                </CardHeader>
            </button>
            {open && (
                <CardContent className="pt-0 pb-5 border-t border-border">
                    {children}
                </CardContent>
            )}
        </Card>
    );
}

// ─────────────────────────────────────────────────────────────────
// Main OnboardingHub
// ─────────────────────────────────────────────────────────────────

const OnboardingHub = () => {
    const [readiness, setReadiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [masterUploading, setMasterUploading] = useState(false);
    const [masterProgress, setMasterProgress] = useState(0);
    const [masterResult, setMasterResult] = useState(null);
    const [masterError, setMasterError] = useState(null);
    const [downloadingMaster, setDownloadingMaster] = useState(false);
    const masterInputRef = useRef();

    const fetchReadiness = async () => {
        try {
            const resp = await getReadiness();
            setReadiness(resp.data);
        } catch {
            // non-fatal
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReadiness();
    }, []);

    const handleMasterTemplate = async () => {
        setDownloadingMaster(true);
        try {
            const resp = await getMasterTemplate();
            downloadBlob(resp, 'CampusKona_Onboarding_Workbook.xlsx');
        } catch {
            // silent
        } finally {
            setDownloadingMaster(false);
        }
    };

    const handleMasterFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setMasterUploading(true);
        setMasterProgress(0);
        setMasterResult(null);
        setMasterError(null);
        try {
            const resp = await uploadMasterWorkbook(file, (pct) => setMasterProgress(pct));
            setMasterResult(resp.data || resp);
            fetchReadiness(); // refresh score
        } catch (err) {
            setMasterError(err?.response?.data?.error || 'Upload failed.');
        } finally {
            setMasterUploading(false);
            if (masterInputRef.current) masterInputRef.current.value = '';
        }
    };

    const score = readiness?.score ?? 0;
    const grade = readiness?.grade ?? 'F';
    const checks = readiness?.checks ?? {};

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="School Setup"
                    description="Get your school operational in 6 steps. Download the Magic Excel workbook, fill it in, and upload it once."
                    breadcrumbs={[{ label: 'System' }, { label: 'School Setup', active: true }]}
                />

                {/* ── Readiness Score Banner ── */}
                <Card className="overflow-hidden">
                    <div className={`h-2 ${scoreBarColor(score)} transition-all duration-1000`} style={{ width: `${score}%` }} />
                    <CardContent className="pt-4 pb-5">
                        {loading ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Calculating readiness score...
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-gray-200 bg-white shadow-sm">
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-gray-900 leading-none">{score}</p>
                                            <p className="text-xs text-gray-400">/ 100</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${gradeColor(grade)}`}>
                                                Grade {grade}
                                            </span>
                                            <Badge variant={readiness?.ready_for_operations ? 'success' : 'secondary'}>
                                                {readiness?.ready_for_operations ? '✓ Ready for operations' : 'Setup incomplete'}
                                            </Badge>
                                        </div>
                                        <p className="font-semibold text-gray-800">{readiness?.phase}</p>
                                        {readiness?.next_action && (
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                Next: {readiness.next_action}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="sm:ml-auto">
                                    <Button variant="outline" size="sm" onClick={fetchReadiness}>
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        Refresh Score
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Magic Excel Card ── */}
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="w-6 h-6 text-primary" />
                            Magic Excel — Onboard Your School in One File
                        </CardTitle>
                        <CardDescription>
                            Download the master workbook. Fill in 4 sheets (Classes, Fees, Students, Staff).
                            Upload it here. Your school is ready.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3 flex-wrap">
                            <Button onClick={handleMasterTemplate} disabled={downloadingMaster} size="lg">
                                {downloadingMaster
                                    ? <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    : <Download className="w-5 h-5 mr-2" />}
                                Download Master Workbook (.xlsx)
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => masterInputRef.current?.click()}
                                disabled={masterUploading}
                            >
                                {masterUploading
                                    ? <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    : <Upload className="w-5 h-5 mr-2" />}
                                {masterUploading ? `Processing… ${masterProgress}%` : 'Upload Completed Workbook'}
                            </Button>
                            <input
                                ref={masterInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleMasterFile}
                                className="hidden"
                            />
                        </div>

                        {masterUploading && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${masterProgress}%` }} />
                            </div>
                        )}

                        {masterError && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                                {masterError}
                            </div>
                        )}

                        {masterResult && !masterError && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2 text-sm">
                                <p className="font-semibold text-green-800 text-base flex items-center gap-1">
                                    <CheckCircle2 className="w-5 h-5" /> Master Workbook Processed
                                </p>
                                <p className="text-green-700">Total records created: <strong>{masterResult.total_records}</strong></p>
                                {masterResult.classes_sections && (
                                    <p className="text-green-700">
                                        Classes: {masterResult.classes_sections.classes_created} new |
                                        Sections: {masterResult.classes_sections.sections_created} new
                                    </p>
                                )}
                                {masterResult.fee_structure && (
                                    <p className="text-green-700">
                                        Fee Structures: {masterResult.fee_structure.fee_structures_created} created
                                    </p>
                                )}
                                {masterResult.students && (
                                    <p className="text-green-700">Students: {masterResult.students.imported} imported</p>
                                )}
                                {masterResult.staff && (
                                    <p className="text-green-700">Staff: {masterResult.staff.imported} imported</p>
                                )}
                                {masterResult.ready_for_operations && (
                                    <p className="font-semibold text-green-800 mt-2">
                                        ✓ Your school is ready for operations!
                                    </p>
                                )}
                            </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                            Prefer to upload step-by-step? Expand the sections below.
                        </p>
                    </CardContent>
                </Card>

                {/* ── 6 Step Cards ── */}
                <div className="space-y-3">
                    {/* Step 1: Academic Year */}
                    <StepCard
                        number="1"
                        icon={Calendar}
                        title="Academic Year"
                        description="Set up the current academic year (e.g. 2025-2026)"
                        statusKey="academic_year"
                        checks={checks}
                    >
                        <div className="mt-4 space-y-3">
                            {checks.academic_year?.status === 'ok' ? (
                                <p className="text-sm text-green-700 font-medium">
                                    ✓ Academic year: <strong>{checks.academic_year.detail}</strong>
                                </p>
                            ) : (
                                <p className="text-sm text-red-600">
                                    No current academic year found. Create one in Settings.
                                </p>
                            )}
                            <Link to="/settings">
                                <Button variant="outline" size="sm">
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Go to Settings
                                </Button>
                            </Link>
                        </div>
                    </StepCard>

                    {/* Step 2: Classes & Sections */}
                    <StepCard
                        number="2"
                        icon={Building2}
                        title="Classes & Sections"
                        description="Upload all classes (LKG–Class 12) and their sections (A, B, C…)"
                        statusKey="classes"
                        checks={checks}
                        defaultOpen={checks.classes?.status === 'missing'}
                    >
                        <p className="text-sm text-muted-foreground mt-4">
                            Download the template, fill in one row per section. LKG → class_order=-2, UKG → -1, Class 1 → 1, etc.
                        </p>
                        <StepUploadZone
                            templateFn={getClassSectionTemplate}
                            uploadFn={uploadClassSections}
                            templateFilename="classes_sections_template.xlsx"
                            accept=".xlsx,.xls,.csv"
                            onSuccess={fetchReadiness}
                        />
                        {checks.sections?.count > 0 && (
                            <p className="text-xs text-green-600 mt-2">
                                Currently: {checks.classes?.count} classes · {checks.sections?.count} sections
                            </p>
                        )}
                    </StepCard>

                    {/* Step 3: Fee Structure */}
                    <StepCard
                        number="3"
                        icon={DollarSign}
                        title="Fee Structure"
                        description="Define fee categories and amounts per class"
                        statusKey="fee_structure"
                        checks={checks}
                        defaultOpen={checks.fee_structure?.status === 'missing' && checks.classes?.status === 'ok'}
                    >
                        <p className="text-sm text-muted-foreground mt-4">
                            Use <code className="bg-gray-100 px-1 rounded">class_name=ALL</code> to apply a fee to every class.
                            Supported frequencies: MONTHLY, QUARTERLY, HALF_YEARLY, ANNUAL, ONE_TIME.
                        </p>
                        <StepUploadZone
                            templateFn={getFeeStructureTemplate}
                            uploadFn={uploadFeeStructure}
                            templateFilename="fee_structure_template.xlsx"
                            accept=".xlsx,.xls,.csv"
                            onSuccess={fetchReadiness}
                        />
                        {checks.fee_structure?.count > 0 && (
                            <p className="text-xs text-green-600 mt-2">
                                {checks.fee_structure.count} fee structures active
                            </p>
                        )}
                    </StepCard>

                    {/* Step 4: Staff */}
                    <StepCard
                        number="4"
                        icon={UserCheck}
                        title="Staff"
                        description="Upload teachers, admins, and support staff"
                        statusKey="staff"
                        checks={checks}
                    >
                        <div className="mt-4 space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Staff accounts are created with auto-generated login credentials.
                                Employee IDs are auto-assigned if blank.
                            </p>
                            <Link to="/staff/bulk-upload">
                                <Button variant="default" size="sm">
                                    <ArrowRight className="w-4 h-4 mr-1" />
                                    Go to Staff Bulk Upload
                                </Button>
                            </Link>
                            {checks.staff?.count > 0 && (
                                <p className="text-xs text-green-600">{checks.staff.count} staff members uploaded</p>
                            )}
                        </div>
                    </StepCard>

                    {/* Step 5: Students */}
                    <StepCard
                        number="5"
                        icon={Users}
                        title="Students"
                        description="Upload all student records with DPDP compliance checks"
                        statusKey="students"
                        checks={checks}
                    >
                        <div className="mt-4 space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Admission numbers are auto-generated if blank. Sensitive columns (Aadhaar, Religion, Caste)
                                are flagged and require parental consent.
                            </p>
                            <Link to="/students/bulk-upload">
                                <Button variant="default" size="sm">
                                    <ArrowRight className="w-4 h-4 mr-1" />
                                    Go to Student Bulk Upload
                                </Button>
                            </Link>
                            {checks.students?.count > 0 && (
                                <p className="text-xs text-green-600">{checks.students.count} students enrolled</p>
                            )}
                        </div>
                    </StepCard>

                    {/* Step 6: DPDP */}
                    <StepCard
                        number="6"
                        icon={Shield}
                        title="DPDP Compliance"
                        description="Parent consent collection and Data Processing Agreement"
                        statusKey="dpdp_compliance"
                        checks={checks}
                    >
                        <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="font-semibold text-gray-800 mb-1">Parent Consent</p>
                                    <p className="text-muted-foreground text-xs">
                                        {checks.parent_consent?.rate
                                            ? `${checks.parent_consent.rate} consent rate`
                                            : 'Not started — send WhatsApp notices to parents'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="font-semibold text-gray-800 mb-1">Data Processing Agreement</p>
                                    <p className="text-muted-foreground text-xs">
                                        Sign the DPA with CampusKona to formalise your DPDP obligations
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <Link to="/compliance/dashboard">
                                    <Button variant="outline" size="sm">
                                        <Shield className="w-4 h-4 mr-1" />
                                        Compliance Hub
                                    </Button>
                                </Link>
                                <Link to="/communication/notices">
                                    <Button variant="outline" size="sm">
                                        Send Parent Notices
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </StepCard>
                </div>

                {/* ── Readiness Checks Detail ── */}
                {readiness && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Detailed Readiness Checks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(checks).map(([key, check]) => (
                                    <div key={key} className="flex items-center gap-2 text-sm py-1">
                                        {statusIcon(check.status)}
                                        <span className="capitalize font-medium text-gray-700">
                                            {key.replace(/_/g, ' ')}
                                        </span>
                                        {check.count !== undefined && (
                                            <Badge variant="secondary" className="ml-auto">{check.count}</Badge>
                                        )}
                                        {check.detail && (
                                            <span className="text-xs text-muted-foreground ml-1 hidden lg:block">{check.detail}</span>
                                        )}
                                        {check.rate && (
                                            <span className="text-xs text-muted-foreground ml-1">{check.rate}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AnimatedPage>
    );
};

export default OnboardingHub;
