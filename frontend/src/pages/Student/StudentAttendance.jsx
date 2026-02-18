import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import client from '../../api/client';

const STATUS_CONFIG = {
    PRESENT: { label: 'Present', color: 'success', icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-700' },
    ABSENT: { label: 'Absent', color: 'destructive', icon: XCircle, bg: 'bg-red-100', text: 'text-red-700' },
    LATE: { label: 'Late', color: 'warning', icon: Clock, bg: 'bg-yellow-100', text: 'text-yellow-700' },
    HALF_DAY: { label: 'Half Day', color: 'warning', icon: AlertTriangle, bg: 'bg-orange-100', text: 'text-orange-700' },
    LEAVE: { label: 'Leave', color: 'info', icon: Calendar, bg: 'bg-blue-100', text: 'text-blue-700' },
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const StudentAttendance = () => {
    const { user } = useSelector(state => state.auth);
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

    useEffect(() => {
        fetchAttendance();
    }, [viewYear, viewMonth]);

    const fetchAttendance = async () => {
        setLoading(true);
        setError(null);
        try {
            const startDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`;
            const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
            const endDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${lastDay}`;

            const [recordsRes, summaryRes] = await Promise.all([
                client.get('/attendance/student-attendance/', {
                    params: { date__gte: startDate, date__lte: endDate, page_size: 100 },
                }),
                client.get('/attendance/student-attendance/student_summary/', {
                    params: { date__gte: startDate, date__lte: endDate },
                }),
            ]);

            setRecords(recordsRes.data.results || recordsRes.data || []);
            setSummary(summaryRes.data);
        } catch (err) {
            console.error('Failed to load attendance:', err);
            setError('Could not load attendance data.');
        } finally {
            setLoading(false);
        }
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };

    const nextMonth = () => {
        const next = new Date(viewYear, viewMonth + 1);
        if (next <= today) {
            if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
            else setViewMonth(m => m + 1);
        }
    };

    const isNextDisabled = () => {
        const next = new Date(viewYear, viewMonth + 1);
        return next > today;
    };

    // Build calendar grid
    const buildCalendar = () => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
        const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
        const recordMap = {};
        records.forEach(r => {
            const day = parseInt(r.date?.split('-')[2], 10);
            recordMap[day] = r;
        });

        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= lastDay; d++) cells.push({ day: d, record: recordMap[d] || null });
        return cells;
    };

    const calendarCells = buildCalendar();

    const statCards = summary ? [
        { label: 'Present', value: summary.present ?? 0, icon: CheckCircle, bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
        { label: 'Absent', value: summary.absent ?? 0, icon: XCircle, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
        { label: 'Late', value: summary.late ?? 0, icon: Clock, bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
        { label: 'Leave', value: summary.leave ?? 0, icon: Calendar, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    ] : [];

    const attendancePct = summary && summary.total > 0
        ? (((summary.present ?? 0) + (summary.late ?? 0) + (summary.half_day ?? 0)) / summary.total * 100).toFixed(1)
        : null;

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="My Attendance"
                    description="View your attendance history and monthly summary"
                    breadcrumbs={[{ label: 'Student Portal' }, { label: 'Attendance', active: true }]}
                />

                {/* Month navigator */}
                <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={prevMonth}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-lg font-semibold text-gray-800">
                        {MONTHS[viewMonth]} {viewYear}
                    </h2>
                    <Button variant="outline" size="sm" onClick={nextMonth} disabled={isNextDisabled()}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Summary stat cards */}
                {!loading && summary && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {statCards.map(({ label, value, icon: Icon, bg, text, border }) => (
                            <div key={label} className={`rounded-xl border ${border} ${bg} p-4 flex items-center gap-3`}>
                                <Icon className={`w-6 h-6 ${text} flex-shrink-0`} />
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                                    <p className="text-xs text-gray-500">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Attendance % banner */}
                {!loading && attendancePct !== null && (
                    <Card className={`border-2 ${parseFloat(attendancePct) >= 75 ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
                        <CardContent className="py-4 flex items-center gap-3">
                            <TrendingUp className={`w-6 h-6 ${parseFloat(attendancePct) >= 75 ? 'text-green-600' : 'text-red-600'}`} />
                            <div>
                                <p className="text-sm text-gray-600">Monthly Attendance</p>
                                <p className={`text-2xl font-bold ${parseFloat(attendancePct) >= 75 ? 'text-green-700' : 'text-red-700'}`}>
                                    {attendancePct}%
                                    {parseFloat(attendancePct) < 75 && (
                                        <span className="ml-2 text-sm font-normal text-red-600">⚠ Below 75% threshold</span>
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Calendar */}
                <Card>
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Attendance Calendar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {loading ? (
                            <div className="text-center py-12 text-gray-400">Loading...</div>
                        ) : error ? (
                            <div className="text-center py-8 text-red-500">{error}</div>
                        ) : (
                            <>
                                {/* Day headers */}
                                <div className="grid grid-cols-7 mb-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                        <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                                    ))}
                                </div>
                                {/* Calendar cells */}
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarCells.map((cell, idx) => {
                                        if (!cell) return <div key={idx} />;
                                        const { day, record } = cell;
                                        const status = record?.status;
                                        const cfg = status ? STATUS_CONFIG[status] : null;
                                        const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                                        return (
                                            <div
                                                key={idx}
                                                title={cfg ? cfg.label : 'No record'}
                                                className={`
                                                    aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium
                                                    ${cfg ? `${cfg.bg} ${cfg.text}` : 'bg-gray-50 text-gray-400'}
                                                    ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
                                                `}
                                            >
                                                <span className="text-sm font-bold">{day}</span>
                                                {cfg && <span className="text-[9px] leading-tight text-center">{cfg.label}</span>}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t">
                                    {Object.values(STATUS_CONFIG).map(({ label, bg, text }) => (
                                        <div key={label} className="flex items-center gap-1">
                                            <div className={`w-3 h-3 rounded ${bg}`} />
                                            <span className="text-xs text-gray-500">{label}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded bg-gray-100" />
                                        <span className="text-xs text-gray-500">No record</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Recent records table */}
                {!loading && records.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base">Detailed Records</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="divide-y divide-gray-100">
                                {[...records]
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                                    .map(r => {
                                        const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.ABSENT;
                                        const Icon = cfg.icon;
                                        return (
                                            <div key={r.id} className="flex items-center justify-between py-3">
                                                <div className="flex items-center gap-3">
                                                    <Icon className={`w-4 h-4 ${cfg.text}`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                        </p>
                                                        {r.remarks && <p className="text-xs text-gray-500">{r.remarks}</p>}
                                                    </div>
                                                </div>
                                                <Badge variant={cfg.color}>{cfg.label}</Badge>
                                            </div>
                                        );
                                    })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!loading && records.length === 0 && !error && (
                    <Card>
                        <CardContent className="py-12 text-center text-gray-400">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No attendance records for {MONTHS[viewMonth]} {viewYear}.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AnimatedPage>
    );
};

export default StudentAttendance;
