import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Label } from '@/ui/primitives/label';
import { Input } from '@/ui/primitives/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/ui/primitives/select';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Calendar, Users, TrendingUp, Download, Filter, Loader2, FileBarChart, PieChart, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { fetchClasses, fetchSections } from '../../store/slices/academicsSlice';
import client from '../../api/client';
import showToast, { getErrorMessage } from '../../utils/toast';

const AttendanceReports = () => {
    const dispatch = useDispatch();
    const { classes, sections } = useSelector((state) => state.academics);

    const [reportType, setReportType] = useState('daily');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchClasses());
    }, [dispatch]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchSections({ class_instance: selectedClass }));
            setSelectedSection('');
        }
    }, [selectedClass, dispatch]);

    const handleGenerateReport = async () => {
        setLoading(true);
        try {
            let response;
            const params = {
                date: startDate, // For single date queries
            };

            // Add date range for multi-day reports
            if (reportType === 'monthly' || endDate !== startDate) {
                params.date__gte = startDate;
                params.date__lte = endDate;
                delete params.date;
            }

            if (selectedClass) params.class_id = selectedClass;
            if (selectedSection) params.section_id = selectedSection;

            if (reportType === 'daily' || reportType === 'monthly') {
                // Fetch attendance records
                response = await client.get('/attendance/student-attendance/', { params });

                const data = response.data.results || response.data;
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    showToast.info('No attendance records found for the selected filters.');
                    setReportData(null);
                } else {
                    processAttendanceData(data);
                }
            } else if (reportType === 'summary') {
                // Fetch summary data
                response = await client.get('/attendance/student-attendance/student_summary/', { params });
                setReportData(response.data);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            showToast.error('Failed to generate report: ' + getErrorMessage(error));
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const processAttendanceData = (data) => {
        // Group by status
        const summary = {
            total: data.length,
            present: data.filter(d => d.status === 'PRESENT').length,
            absent: data.filter(d => d.status === 'ABSENT').length,
            late: data.filter(d => d.status === 'LATE').length,
            halfDay: data.filter(d => d.status === 'HALF_DAY').length,
            leave: data.filter(d => d.status === 'LEAVE').length,
        };

        summary.percentage = summary.total > 0
            ? ((summary.present + summary.late + summary.halfDay) / summary.total * 100).toFixed(2)
            : 0;

        setReportData({ summary, records: data });
    };

    const handleExport = async (format) => {
        try {
            const params = {
                report_type: reportType,
                start_date: startDate,
                end_date: endDate,
                format: format,
            };

            if (selectedClass) params.class_id = selectedClass;
            if (selectedSection) params.section_id = selectedSection;

            const response = await client.post(
                '/attendance/student-attendance/export_report/',
                params,
                { responseType: 'blob' }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_report_${startDate}_${endDate}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast.success(`Report exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Error exporting report:', error);
            showToast.error('Failed to export report');
        }
    };

    const StatCard = ({ title, value, subtext, icon: Icon, colorClass, bgClass }) => (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <h3 className="text-2xl font-bold mt-1">{value}</h3>
                        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
                    </div>
                    <div className={`p-3 rounded-full ${bgClass}`}>
                        <Icon className={`w-6 h-6 ${colorClass}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Attendance Reports"
                    description="Analyze student attendance patterns"
                    breadcrumbs={[
                        { label: 'Attendance', href: '/attendance' },
                        { label: 'Reports', active: true }
                    ]}
                />

                <Card>
                    <CardHeader className="pb-4 border-b border-border">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="w-5 h-5 text-primary" />
                            Report Configuration
                        </CardTitle>
                        <CardDescription>Select parameters to generate attendance reports.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
                            <div className="space-y-2">
                                <Label>Report Type</Label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily Report</SelectItem>
                                        <SelectItem value="monthly">Monthly Report</SelectItem>
                                        <SelectItem value="summary">Summary Report</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Select Class</Label>
                                <Select value={selectedClass} onValueChange={setSelectedClass}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Classes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Classes</SelectItem>
                                        {(Array.isArray(classes) ? classes : []).map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Select Section</Label>
                                <Select
                                    value={selectedSection}
                                    onValueChange={setSelectedSection}
                                    disabled={!selectedClass}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Sections" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Sections</SelectItem>
                                        {(Array.isArray(sections) ? sections : []).map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            {(reportType === 'monthly' || reportType === 'summary') && (
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                    />
                                </div>
                            )}

                            <div className="md:col-span-1 lg:col-span-1">
                                <Button
                                    onClick={handleGenerateReport}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FileBarChart className="w-4 h-4 mr-2" />
                                            Generate Report
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {reportData && reportData.summary && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h2 className="text-xl font-semibold tracking-tight">Report Summary</h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export CSV
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Average Attendance"
                                value={`${reportData.summary.percentage}%`}
                                subtext="Overall attendance rate"
                                icon={TrendingUp}
                                colorClass="text-primary"
                                bgClass="bg-primary/10"
                            />
                            <StatCard
                                title="Present"
                                value={reportData.summary.present}
                                subtext="Students present"
                                icon={CheckCircle}
                                colorClass="text-emerald-500"
                                bgClass="bg-emerald-500/10"
                            />
                            <StatCard
                                title="Absent"
                                value={reportData.summary.absent}
                                subtext="Students absent"
                                icon={XCircle}
                                colorClass="text-destructive"
                                bgClass="bg-destructive/10"
                            />
                            <StatCard
                                title="Late / Leave"
                                value={reportData.summary.late + reportData.summary.leave}
                                subtext={`${reportData.summary.late} Late, ${reportData.summary.leave} On Leave`}
                                icon={Clock}
                                colorClass="text-amber-500"
                                bgClass="bg-amber-500/10"
                            />
                        </div>

                        {reportData.records && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detailed Records</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-medium">
                                                <tr>
                                                    <th className="px-6 py-3 text-left">Date</th>
                                                    <th className="px-6 py-3 text-left">Student</th>
                                                    <th className="px-6 py-3 text-left">Class</th>
                                                    <th className="px-6 py-3 text-left">Status</th>
                                                    <th className="px-6 py-3 text-left">Remarks</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {reportData.records.slice(0, 50).map((record, index) => (
                                                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium">{record.student_name}</div>
                                                            <div className="text-xs text-muted-foreground">{record.admission_number}</div>
                                                        </td>
                                                        <td className="px-6 py-4">{record.class_name} - {record.section_name}</td>
                                                        <td className="px-6 py-4">
                                                            <Badge
                                                                variant="outline"
                                                                className={`
                                                                    ${record.status === 'PRESENT' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : ''}
                                                                    ${record.status === 'ABSENT' ? 'text-destructive bg-destructive/10 border-destructive/20' : ''}
                                                                    ${record.status === 'LATE' ? 'text-amber-600 bg-amber-50 border-amber-200' : ''}
                                                                    ${record.status === 'LEAVE' ? 'text-violet-600 bg-violet-50 border-violet-200' : ''}
                                                                `}
                                                            >
                                                                {record.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-muted-foreground">{record.remarks || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {reportData.records.length > 50 && (
                                            <div className="p-4 text-center text-sm text-muted-foreground bg-muted/20">
                                                Showing first 50 records. Export to view all data.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
};

export default AttendanceReports;
