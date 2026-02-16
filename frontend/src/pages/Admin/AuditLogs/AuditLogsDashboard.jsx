import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Table, Spinner } from '../../../components/common';
import { privacyAPI } from '../../../api/privacy';
import showToast from '../../../utils/toast';
import { formatDateTime } from '../../../utils/dateUtils';
import AccessSummaryStats from './AccessSummaryStats';
import AuditLogsTable from './AuditLogsTable';
import AlertsPanel from './AlertsPanel';

const AuditLogsDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total_accesses: 0,
        flagged_accesses: 0,
        unique_users: 0,
        pending_alerts: 0,
    });

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await privacyAPI.getAuditLogsSummary({ days: 7 });
            setStats(response.data);
        } catch (error) {
            showToast.error('Failed to load dashboard statistics');
            console.error('Dashboard stats error:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'audit-logs', label: 'Audit Logs', icon: '📝' },
        { id: 'alerts', label: 'Alerts', icon: '🚨' },
        { id: 'compliance', label: 'Compliance Reports', icon: '📈' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        DPDP Compliance Dashboard
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Monitor sensitive data access and privacy compliance
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={loadDashboardStats}
                    className="flex items-center gap-2"
                >
                    🔄 Refresh
                </Button>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Accesses (7d)</p>
                            <p className="text-3xl font-bold text-blue-900 mt-2">
                                {stats.total_accesses.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-4xl">👁️</div>
                    </div>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-600 font-medium">Flagged Accesses</p>
                            <p className="text-3xl font-bold text-yellow-900 mt-2">
                                {stats.flagged_accesses.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-4xl">⚠️</div>
                    </div>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Unique Users</p>
                            <p className="text-3xl font-bold text-purple-900 mt-2">
                                {stats.unique_users.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-4xl">👥</div>
                    </div>
                </Card>

                <Card className="bg-red-50 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-600 font-medium">Pending Alerts</p>
                            <p className="text-3xl font-bold text-red-900 mt-2">
                                {stats.pending_alerts.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-4xl">🚨</div>
                    </div>
                </Card>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                px-4 py-2 text-sm font-medium border-b-2 transition-colors
                                ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <AccessSummaryStats onRefresh={loadDashboardStats} />
                )}

                {activeTab === 'audit-logs' && (
                    <AuditLogsTable />
                )}

                {activeTab === 'alerts' && (
                    <AlertsPanel onAlertResolved={loadDashboardStats} />
                )}

                {activeTab === 'compliance' && (
                    <ComplianceReports />
                )}
            </div>
        </div>
    );
};

const ComplianceReports = () => {
    const [reportType, setReportType] = useState('');
    const [generating, setGenerating] = useState(false);

    const reportTypes = [
        { value: 'monthly_audit', label: 'Monthly Audit Report' },
        { value: 'consent_status', label: 'Consent Status Report' },
        { value: 'access_by_user', label: 'Access by User Report' },
        { value: 'data_subject_requests', label: 'Data Subject Requests Report' },
    ];

    const handleGenerateReport = async () => {
        if (!reportType) {
            showToast.error('Please select a report type');
            return;
        }

        try {
            setGenerating(true);
            // API call to generate report
            showToast.success('Report generation started. You will receive it via email.');
        } catch (error) {
            showToast.error('Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Card title="Compliance Reports">
            <div className="space-y-6">
                <div>
                    <p className="text-sm text-gray-600 mb-4">
                        Generate compliance reports for DPDP Act 2023 auditing and record-keeping requirements.
                    </p>

                    <div className="max-w-md space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Report Type
                            </label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Choose Report --</option>
                                {reportTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleGenerateReport}
                            disabled={generating || !reportType}
                            className="w-full"
                        >
                            {generating ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Generating...
                                </>
                            ) : (
                                '📄 Generate Report'
                            )}
                        </Button>
                    </div>
                </div>

                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
                    <div className="text-sm text-gray-500">
                        No reports generated yet.
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default AuditLogsDashboard;
