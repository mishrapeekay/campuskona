import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Modal, Spinner, Table } from '../../../components/common';
import { privacyAPI } from '../../../api/privacy';
import showToast from '../../../utils/toast';
import { formatDateTime } from '../../../utils/dateUtils';

const AlertsPanel = ({ onAlertResolved }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [resolving, setResolving] = useState(false);
    const [filter, setFilter] = useState('pending'); // pending, resolved, all

    useEffect(() => {
        loadAlerts();
    }, [filter]);

    const loadAlerts = async () => {
        try {
            setLoading(true);
            const endpoint = filter === 'pending'
                ? privacyAPI.getPendingAlerts
                : privacyAPI.getAlerts;

            const params = filter === 'all' ? {} : { status: filter.toUpperCase() };
            const response = await endpoint(params);

            setAlerts(response.data.results || response.data || []);
        } catch (error) {
            showToast.error('Failed to load alerts');
            console.error('Alerts error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolveAlert = async () => {
        if (!resolutionNotes.trim()) {
            showToast.error('Please provide resolution notes');
            return;
        }

        try {
            setResolving(true);
            await privacyAPI.resolveAlert(selectedAlert.id, {
                resolution_notes: resolutionNotes,
            });

            showToast.success('Alert resolved successfully');
            setShowResolveModal(false);
            setSelectedAlert(null);
            setResolutionNotes('');
            loadAlerts();

            if (onAlertResolved) {
                onAlertResolved();
            }
        } catch (error) {
            showToast.error('Failed to resolve alert');
            console.error('Resolve alert error:', error);
        } finally {
            setResolving(false);
        }
    };

    const handleMarkFalsePositive = async (alert) => {
        if (!window.confirm('Mark this alert as a false positive? This will unflag all related accesses.')) {
            return;
        }

        try {
            await privacyAPI.markAlertFalsePositive(alert.id);
            showToast.success('Alert marked as false positive');
            loadAlerts();

            if (onAlertResolved) {
                onAlertResolved();
            }
        } catch (error) {
            showToast.error('Failed to mark alert as false positive');
        }
    };

    const handleAssignAlert = async (alert, userId) => {
        try {
            await privacyAPI.assignAlert(alert.id, { assigned_to: userId });
            showToast.success('Alert assigned successfully');
            loadAlerts();
        } catch (error) {
            showToast.error('Failed to assign alert');
        }
    };

    const getSeverityBadge = (severity) => {
        const variants = {
            'LOW': 'info',
            'MEDIUM': 'warning',
            'HIGH': 'danger',
            'CRITICAL': 'danger',
        };

        const icons = {
            'LOW': 'ℹ️',
            'MEDIUM': '⚠️',
            'HIGH': '🔴',
            'CRITICAL': '🚨',
        };

        return (
            <Badge variant={variants[severity] || 'secondary'}>
                {icons[severity]} {severity}
            </Badge>
        );
    };

    const getStatusBadge = (status) => {
        const variants = {
            'PENDING': 'warning',
            'INVESTIGATING': 'info',
            'RESOLVED': 'success',
            'FALSE_POSITIVE': 'secondary',
        };

        return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const getAlertTypeDisplay = (type) => {
        const displays = {
            'UNUSUAL_HOURS': 'Unusual Hours Access',
            'BULK_ACCESS': 'Bulk Access Detected',
            'NO_CONSENT': 'No Valid Consent',
            'EXPORT_ANOMALY': 'Export Anomaly',
            'MULTIPLE_FAILURES': 'Multiple Access Failures',
            'SUSPICIOUS_PATTERN': 'Suspicious Pattern',
        };
        return displays[type] || type;
    };

    const columns = [
        {
            header: 'Alert Type',
            accessor: (alert) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">
                        {getAlertTypeDisplay(alert.alert_type)}
                    </div>
                    <div className="text-xs text-gray-500">
                        ID: {alert.alert_id?.substring(0, 8)}
                    </div>
                </div>
            ),
        },
        {
            header: 'Severity',
            accessor: (alert) => getSeverityBadge(alert.severity),
        },
        {
            header: 'User',
            accessor: (alert) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">{alert.user_name}</div>
                    <div className="text-xs text-gray-500">
                        {alert.affected_students_count} student(s) affected
                    </div>
                </div>
            ),
        },
        {
            header: 'Description',
            accessor: (alert) => (
                <div className="text-sm text-gray-700 max-w-md">
                    {alert.description}
                </div>
            ),
        },
        {
            header: 'Detected',
            accessor: (alert) => (
                <div className="text-sm text-gray-600">
                    {formatDateTime(alert.detected_at)}
                </div>
            ),
        },
        {
            header: 'Status',
            accessor: (alert) => getStatusBadge(alert.status),
        },
        {
            header: 'Actions',
            accessor: (alert) => (
                <div className="flex gap-2">
                    {alert.status === 'PENDING' && (
                        <>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                    setSelectedAlert(alert);
                                    setShowResolveModal(true);
                                }}
                            >
                                Resolve
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleMarkFalsePositive(alert)}
                            >
                                False Positive
                            </Button>
                        </>
                    )}
                    {alert.status === 'RESOLVED' && (
                        <Badge variant="success">✓ Resolved</Badge>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
            <Card>
                <div className="flex gap-4">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            filter === 'pending'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        🚨 Pending Alerts
                    </button>
                    <button
                        onClick={() => setFilter('resolved')}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            filter === 'resolved'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        ✓ Resolved
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            filter === 'all'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        📋 All Alerts
                    </button>
                </div>
            </Card>

            {/* Alerts Table */}
            <Card
                title={`Access Pattern Alerts (${alerts.length})`}
                actions={
                    <Button variant="primary" size="sm" onClick={loadAlerts}>
                        🔄 Refresh
                    </Button>
                }
            >
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-4">✅</div>
                        <p className="text-lg font-medium">
                            {filter === 'pending'
                                ? 'No pending alerts'
                                : filter === 'resolved'
                                ? 'No resolved alerts'
                                : 'No alerts found'}
                        </p>
                        <p className="text-sm mt-2">
                            {filter === 'pending' && 'All suspicious activities have been reviewed'}
                        </p>
                    </div>
                ) : (
                    <Table columns={columns} data={alerts} className="text-sm" />
                )}
            </Card>

            {/* Alert Detection Rules */}
            <Card title="Alert Detection Rules" collapsible defaultCollapsed={true}>
                <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">⚠️</div>
                            <div>
                                <h4 className="font-semibold text-yellow-900">Unusual Hours Access</h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Triggered when sensitive data is accessed between 22:00 and 06:00
                                </p>
                                <div className="text-xs text-yellow-600 mt-2">
                                    Severity: <Badge variant="warning">MEDIUM</Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">📊</div>
                            <div>
                                <h4 className="font-semibold text-orange-900">Bulk Access Detection</h4>
                                <p className="text-sm text-orange-700 mt-1">
                                    Triggered when 20+ sensitive fields are accessed within 5 minutes
                                </p>
                                <div className="text-xs text-orange-600 mt-2">
                                    Severity: <Badge variant="warning">MEDIUM</Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">🚫</div>
                            <div>
                                <h4 className="font-semibold text-red-900">No Valid Consent</h4>
                                <p className="text-sm text-red-700 mt-1">
                                    Triggered when data is accessed without valid parental consent
                                </p>
                                <div className="text-xs text-red-600 mt-2">
                                    Severity: <Badge variant="danger">HIGH</Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">📤</div>
                            <div>
                                <h4 className="font-semibold text-purple-900">Export Anomaly</h4>
                                <p className="text-sm text-purple-700 mt-1">
                                    Triggered when unusual export patterns are detected
                                </p>
                                <div className="text-xs text-purple-600 mt-2">
                                    Severity: <Badge variant="danger">HIGH</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Resolve Alert Modal */}
            <Modal
                isOpen={showResolveModal}
                onClose={() => {
                    setShowResolveModal(false);
                    setSelectedAlert(null);
                    setResolutionNotes('');
                }}
                title="Resolve Alert"
                size="lg"
            >
                {selectedAlert && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-md p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Alert Type:</span>
                                    <div className="font-medium mt-1">
                                        {getAlertTypeDisplay(selectedAlert.alert_type)}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Severity:</span>
                                    <div className="mt-1">
                                        {getSeverityBadge(selectedAlert.severity)}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600">User:</span>
                                    <div className="font-medium mt-1">
                                        {selectedAlert.user_name}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Detected At:</span>
                                    <div className="font-medium mt-1">
                                        {formatDateTime(selectedAlert.detected_at)}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <span className="text-gray-600 text-sm">Description:</span>
                                <div className="mt-1 text-gray-900">
                                    {selectedAlert.description}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Resolution Notes *
                            </label>
                            <textarea
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                rows={5}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe the investigation and resolution actions taken..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Provide details about why this alert occurred and what actions were taken.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowResolveModal(false);
                                    setSelectedAlert(null);
                                    setResolutionNotes('');
                                }}
                                disabled={resolving}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleResolveAlert}
                                disabled={resolving || !resolutionNotes.trim()}
                            >
                                {resolving ? (
                                    <>
                                        <Spinner size="sm" className="mr-2" />
                                        Resolving...
                                    </>
                                ) : (
                                    '✓ Resolve Alert'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AlertsPanel;
