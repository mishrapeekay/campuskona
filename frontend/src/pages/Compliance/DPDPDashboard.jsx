import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Skeleton } from '@/ui/primitives/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/ui/primitives/dialog';
import { privacyAPI } from '../../api/privacy';
import { toast } from 'react-toastify';
import {
    ShieldCheck,
    Users,
    FileWarning,
    FilePenLine,
    Eye,
    RefreshCw,
    Lightbulb,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Loader2
} from 'lucide-react';

/**
 * DPDP Compliance Dashboard - Specialized for DPDP Coordinators
 */
const DPDPDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState(null);
    const [sectionDetails, setSectionDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const response = await privacyAPI.getComplianceSummary();
            setSummary(response.data);
        } catch (error) {
            toast.error('Failed to fetch compliance summary');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Workstream I: Document download helpers
    const downloadPDF = async (path, filename, errorMsg) => {
        try {
            const response = await fetch(`/api/v1${path}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                toast.error(data.error || errorMsg);
                return;
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link); link.click();
            window.URL.revokeObjectURL(url); document.body.removeChild(link);
        } catch (err) {
            toast.error(errorMsg);
        }
    };

    const handleDownloadDPA = () => {
        toast.info('Preparing Data Processing Agreement...');
        downloadPDF('/privacy/generate-dpa/', 'CampusKona_DPA.pdf', 'Failed to download DPA');
    };

    const handleDownloadPrivacyNotice = () => {
        toast.info('Preparing Privacy Notice...');
        downloadPDF('/privacy/generate-privacy-notice/', 'CampusKona_PrivacyNotice.pdf', 'Failed to download Privacy Notice');
    };

    const handleDownloadCertificate = () => {
        toast.info('Preparing Compliance Certificate...');
        downloadPDF('/privacy/compliance-certificate/', 'CampusKona_Compliance_Certificate.pdf', 'Certificate not available. Ensure 80%+ consent rate.');
    };

    const handleViewSection = async (sectionId) => {
        try {
            setSelectedSection(sectionId);
            setIsModalOpen(true);
            setDetailsLoading(true);
            const response = await privacyAPI.getSectionComplianceDetails(sectionId);
            setSectionDetails(response.data);
        } catch (error) {
            toast.error('Failed to fetch section details');
        } finally {
            setDetailsLoading(false);
        }
    };

    if (loading) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </div>
                    <Skeleton className="h-64" />
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6 pb-12">
                <PageHeader
                    title="DPDP Compliance Hub"
                    description="Data Steward Workspace: Class-wise privacy monitoring"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Compliance' }
                    ]}
                    action={
                        <div className="flex gap-2 flex-wrap">
                            {/* Workstream I: DPDP Document Downloads */}
                            <Button variant="outline" size="sm" onClick={handleDownloadDPA} title="Download Data Processing Agreement">
                                📄 DPA
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownloadPrivacyNotice} title="Download Privacy Notice for Parents">
                                🔒 Privacy Notice
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownloadCertificate} title="Download DPDP Compliance Certificate">
                                🏆 Certificate
                            </Button>
                            <Button variant="outline" onClick={fetchSummary}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <MetricCard
                        title="Aggregated Students"
                        value={summary?.overall_summary?.total_students || 0}
                        icon={Users}
                        color="text-blue-600 dark:text-blue-400"
                        bgColor="bg-blue-500/10"
                    />
                    <MetricCard
                        title="Overall Compliance"
                        value={`${Math.round((summary?.overall_summary?.consents_completed / summary?.overall_summary?.total_students) * 100 || 0)}%`}
                        icon={ShieldCheck}
                        color="text-emerald-600 dark:text-emerald-400"
                        bgColor="bg-emerald-500/10"
                        subtitle="Mandatory Consents Signed"
                    />
                    <MetricCard
                        title="Pending Grievances"
                        value={summary?.overall_summary?.pending_grievances || 0}
                        icon={AlertTriangle}
                        color="text-amber-600 dark:text-amber-400"
                        bgColor="bg-amber-500/10"
                        alert={summary?.overall_summary?.pending_grievances > 0}
                    />
                    <MetricCard
                        title="Correction Requests"
                        value={summary?.overall_summary?.pending_corrections || 0}
                        icon={FilePenLine}
                        color="text-indigo-600 dark:text-indigo-400"
                        bgColor="bg-indigo-500/10"
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Assigned Sections Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Section</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Students</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Compliance Rate</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Grievances</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data Corrections</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {summary?.section_stats?.length > 0 ? (
                                        summary.section_stats.map((row) => (
                                            <tr key={row.section_id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">
                                                    {row.section_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                    {row.total_students}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${row.compliance_rate > 80 ? 'bg-emerald-500' : row.compliance_rate > 50 ? 'bg-amber-500' : 'bg-destructive'}`}
                                                                style={{ width: `${row.compliance_rate}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium text-foreground">{row.compliance_rate}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                    {row.pending_grievances}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                    {row.pending_corrections}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => handleViewSection(row.section_id)}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View Details
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                                No sections assigned for compliance monitoring.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-400 p-6 rounded-lg shadow-sm">
                    <div className="flex gap-4">
                        <Lightbulb className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-amber-900 dark:text-amber-100">Compliance Steward Tip</h4>
                            <p className="text-amber-800 dark:text-amber-200/80 mt-1 text-sm leading-relaxed">
                                "Compliance" is defined as having all <strong>Mandatory Consents</strong> (Face Biometric, Academic Record Processing, and Emergency Communication) signed by the parent. Students with less than 100% compliance may have restricted access to certain school digital services.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section Details Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {sectionDetails ? `Section Detail: ${sectionDetails.section_name}` : "Loading Details..."}
                            </DialogTitle>
                        </DialogHeader>

                        {detailsLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                                <p>Fetching compliance data...</p>
                            </div>
                        ) : (
                            <div className="mt-4 overflow-hidden rounded-md border border-border">
                                <table className="min-w-full divide-y divide-border">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Consents</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Issues</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-card divide-y divide-border">
                                        {sectionDetails?.students && sectionDetails.students.length > 0 ? (
                                            sectionDetails.students.map(student => (
                                                <tr key={student.student_id} className="hover:bg-muted/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-foreground">{student.name}</div>
                                                        <div className="text-xs text-muted-foreground">{student.admission_number}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {student.is_compliant ? (
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-destructive mr-2" />
                                                            )}
                                                            <Badge variant={student.is_compliant ? 'success' : 'destructive'}>
                                                                {student.is_compliant ? 'Compliant' : 'Non-Compliant'}
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-foreground font-medium">{student.consents_given}</span>
                                                        <span className="text-sm text-muted-foreground"> / {student.consents_required}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex gap-2">
                                                            {student.pending_grievances > 0 && (
                                                                <Badge variant="warning">
                                                                    G: {student.pending_grievances}
                                                                </Badge>
                                                            )}
                                                            {student.pending_corrections > 0 && (
                                                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
                                                                    C: {student.pending_corrections}
                                                                </Badge>
                                                            )}
                                                            {student.pending_grievances === 0 && student.pending_corrections === 0 && (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                                            Prompt Parent
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                                                    No students found in this section.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedPage>
    );
};

const MetricCard = ({ title, value, icon: Icon, color, bgColor, subtitle, alert }) => (
    <Card className={`relative overflow-hidden ${alert ? 'border-red-400 ring-1 ring-red-400/50' : ''}`}>
        <CardContent className="p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${bgColor} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
            </div>
        </CardContent>
    </Card>
);

export default DPDPDashboard;
