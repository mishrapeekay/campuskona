import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Pagination } from '../../../components/common';
import { privacyAPI } from '../../../api/privacy';
import showToast from '../../../utils/toast';
import { formatDateTime } from '../../../utils/dateUtils';

const AuditLogsTable = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 25,
        total: 0,
    });
    const [filters, setFilters] = useState({
        user: '',
        student: '',
        field_name: '',
        access_type: '',
        is_flagged: '',
        date_from: '',
        date_to: '',
    });

    useEffect(() => {
        loadAuditLogs();
    }, [pagination.page, filters]);

    const loadAuditLogs = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                page_size: pagination.pageSize,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '')
                ),
            };

            const response = await privacyAPI.getAuditLogs(params);
            setLogs(response.data.results || []);
            setPagination((prev) => ({
                ...prev,
                total: response.data.count || 0,
            }));
        } catch (error) {
            showToast.error('Failed to load audit logs');
            console.error('Audit logs error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
        setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    };

    const clearFilters = () => {
        setFilters({
            user: '',
            student: '',
            field_name: '',
            access_type: '',
            is_flagged: '',
            date_from: '',
            date_to: '',
        });
    };

    const getAccessTypeBadge = (type) => {
        const variants = {
            'VIEW': 'info',
            'UPDATE': 'warning',
            'DELETE': 'danger',
            'EXPORT': 'purple',
            'PRINT': 'secondary',
        };
        return <Badge variant={variants[type] || 'secondary'}>{type}</Badge>;
    };

    const getFieldDisplayName = (fieldName) => {
        const displayNames = {
            'aadhar_number': 'Aadhar Number',
            'samagra_family_id': 'Samagra Family ID',
            'samagra_member_id': 'Samagra Member ID',
            'father_annual_income': 'Father Annual Income',
            'mother_annual_income': 'Mother Annual Income',
            'annual_income': 'Annual Income',
            'medical_conditions': 'Medical Conditions',
            'allergies': 'Allergies',
            'blood_group': 'Blood Group',
            'disability_details': 'Disability Details',
            'phone_number': 'Phone Number',
            'email': 'Email',
            'emergency_contact_number': 'Emergency Contact',
            'father_phone': 'Father Phone',
            'mother_phone': 'Mother Phone',
            'guardian_phone': 'Guardian Phone',
            'behavioral_notes': 'Behavioral Notes',
            'disciplinary_records': 'Disciplinary Records',
            'exam_marks': 'Exam Marks',
            'grade': 'Grade',
            'attendance_percentage': 'Attendance %',
        };
        return displayNames[fieldName] || fieldName;
    };

    const columns = [
        {
            header: 'Timestamp',
            accessor: (log) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">
                        {formatDateTime(log.accessed_at)}
                    </div>
                    <div className="text-xs text-gray-500">
                        {log.ip_address}
                    </div>
                </div>
            ),
        },
        {
            header: 'User',
            accessor: (log) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">{log.user_name}</div>
                    <div className="text-xs text-gray-500">ID: {log.user}</div>
                </div>
            ),
        },
        {
            header: 'Student',
            accessor: (log) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">{log.student_name}</div>
                    <div className="text-xs text-gray-500">ID: {log.student}</div>
                </div>
            ),
        },
        {
            header: 'Field Accessed',
            accessor: (log) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">
                        {getFieldDisplayName(log.field_name)}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                        {log.field_name}
                    </div>
                </div>
            ),
        },
        {
            header: 'Access Type',
            accessor: (log) => getAccessTypeBadge(log.access_type),
        },
        {
            header: 'Consent',
            accessor: (log) => (
                log.has_valid_consent ? (
                    <Badge variant="success">✓ Valid</Badge>
                ) : (
                    <Badge variant="danger">✗ No Consent</Badge>
                )
            ),
        },
        {
            header: 'Status',
            accessor: (log) => (
                log.is_flagged ? (
                    <div>
                        <Badge variant="warning">⚠ Flagged</Badge>
                        {log.flag_reason && (
                            <div className="text-xs text-gray-500 mt-1">
                                {log.flag_reason}
                            </div>
                        )}
                    </div>
                ) : (
                    <Badge variant="secondary">Normal</Badge>
                )
            ),
        },
    ];

    return (
        <div className="space-y-4">
            {/* Filters */}
            <Card title="Filters" collapsible defaultCollapsed={false}>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Field Name
                        </label>
                        <select
                            value={filters.field_name}
                            onChange={(e) => handleFilterChange('field_name', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Fields</option>
                            <option value="aadhar_number">Aadhar Number</option>
                            <option value="samagra_family_id">Samagra Family ID</option>
                            <option value="medical_conditions">Medical Conditions</option>
                            <option value="annual_income">Annual Income</option>
                            <option value="behavioral_notes">Behavioral Notes</option>
                            <option value="exam_marks">Exam Marks</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Access Type
                        </label>
                        <select
                            value={filters.access_type}
                            onChange={(e) => handleFilterChange('access_type', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="VIEW">View</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                            <option value="EXPORT">Export</option>
                            <option value="PRINT">Print</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Flagged Status
                        </label>
                        <select
                            value={filters.is_flagged}
                            onChange={(e) => handleFilterChange('is_flagged', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All</option>
                            <option value="true">Flagged Only</option>
                            <option value="false">Normal Only</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date From
                        </label>
                        <input
                            type="date"
                            value={filters.date_from}
                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date To
                        </label>
                        <input
                            type="date"
                            value={filters.date_to}
                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-end">
                        <Button
                            variant="secondary"
                            onClick={clearFilters}
                            className="w-full"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Audit Logs Table */}
            <Card
                title={`Audit Logs (${pagination.total.toLocaleString()} total)`}
                actions={
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={loadAuditLogs}
                    >
                        🔄 Refresh
                    </Button>
                }
            >
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-4">📝</div>
                        <p className="text-lg font-medium">No audit logs found</p>
                        <p className="text-sm mt-2">Try adjusting your filters</p>
                    </div>
                ) : (
                    <>
                        <Table
                            columns={columns}
                            data={logs}
                            className="text-sm"
                        />

                        <Pagination
                            currentPage={pagination.page}
                            totalPages={Math.ceil(pagination.total / pagination.pageSize)}
                            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                            className="mt-4"
                        />
                    </>
                )}
            </Card>

            {/* Export Options */}
            <Card title="Export Audit Logs">
                <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                        📄 Export to CSV
                    </Button>
                    <Button variant="outline" size="sm">
                        📊 Export to Excel
                    </Button>
                    <Button variant="outline" size="sm">
                        📋 Export to PDF
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default AuditLogsTable;
