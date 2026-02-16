import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPayslips, selectPayslips, selectHRLoading } from '../../store/slices/hrPayrollSlice';
import { PageHeader, DataTable, LoadingSpinner, Badge } from '../../components/common';

const MONTHS = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_COLORS = { GENERATED: 'blue', DRAFT: 'gray', APPROVED: 'green', PAID: 'emerald' };

const PayrollRunPayslipsList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id: runId } = useParams();
    const payslips = useSelector(selectPayslips);
    const loading = useSelector(selectHRLoading);

    const loadPayslips = useCallback(() => {
        if (runId) dispatch(fetchPayslips({ payroll_run: runId }));
    }, [dispatch, runId]);

    useEffect(() => {
        loadPayslips();
    }, [loadPayslips]);

    const formatCurrency = (amt) => `₹${Number(amt || 0).toLocaleString('en-IN')}`;

    const columns = [
        { key: 'staff_name', label: 'Staff', sortable: true },
        { key: 'staff_employee_id', label: 'Employee ID' },
        {
            key: 'net_salary',
            label: 'Net Pay',
            render: (row) => <span className="font-semibold text-green-600">{formatCurrency(row.net_salary)}</span>,
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <Badge color={STATUS_COLORS[row.status] || 'gray'}>{row.status_display || row.status}</Badge>
            ),
        },
        {
            key: 'id',
            label: 'Actions',
            render: (row) => (
                <button
                    type="button"
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() => navigate(`/hr/payslips/${row.id}`)}
                >
                    View Payslip
                </button>
            ),
        },
    ];

    if (loading && payslips.length === 0) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Payslips for this run"
                subtitle={`${payslips.length} payslip(s)`}
                actions={[
                    { label: 'Back to Payroll', variant: 'outline', onClick: () => navigate('/hr/payroll') },
                ]}
            />
            <DataTable
                columns={columns}
                data={payslips}
                loading={loading}
            />
        </div>
    );
};

export default PayrollRunPayslipsList;
