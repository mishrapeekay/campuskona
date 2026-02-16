import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
    fetchPayslipById,
    selectCurrentPayslip,
    selectHRLoading,
} from '../../store/slices/hrPayrollSlice';
import { PageHeader, LoadingSpinner, Badge, Button } from '../../components/common';

const MONTHS = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const PayslipView = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const payslip = useSelector(selectCurrentPayslip);
    const loading = useSelector(selectHRLoading);

    useEffect(() => {
        if (id) dispatch(fetchPayslipById(id));
    }, [dispatch, id]);

    if (loading || !payslip) return <LoadingSpinner />;

    const formatCurrency = (amt) => `₹${Number(amt || 0).toLocaleString('en-IN')}`;

    const earnings = payslip.components?.filter(c => c.component_type === 'EARNING') || [];
    const deductions = payslip.components?.filter(c => c.component_type === 'DEDUCTION') || [];

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Payslip - ${MONTHS[payslip.month]} ${payslip.year}`}
                subtitle={`${payslip.staff_name || payslip.employee_id}`}
                actions={[
                    { label: 'Back', variant: 'outline', onClick: () => navigate(-1) },
                ]}
            />

            {/* Employee Info */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div><span className="text-gray-500 text-sm">Employee</span><p className="font-semibold">{payslip.staff_name}</p></div>
                    <div><span className="text-gray-500 text-sm">Employee ID</span><p className="font-semibold">{payslip.employee_id}</p></div>
                    <div><span className="text-gray-500 text-sm">Department</span><p>{payslip.department_name || 'N/A'}</p></div>
                    <div><span className="text-gray-500 text-sm">Status</span>
                        <Badge color={payslip.status === 'PAID' ? 'green' : payslip.status === 'APPROVED' ? 'blue' : 'gray'}>
                            {payslip.status_display || payslip.status}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Attendance */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-3">Attendance</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-blue-600">{payslip.working_days}</p>
                        <p className="text-sm text-gray-500">Working Days</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-green-600">{payslip.present_days}</p>
                        <p className="text-sm text-gray-500">Present</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-amber-600">{payslip.leave_days}</p>
                        <p className="text-sm text-gray-500">Leave</p>
                    </div>
                </div>
            </div>

            {/* Earnings & Deductions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-3 text-green-700">Earnings</h3>
                    {earnings.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                            <span className="text-gray-600">{item.component_name}</span>
                            <span className="font-medium">{formatCurrency(item.amount)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between pt-3 mt-2 border-t-2">
                        <span className="font-semibold">Total Earnings</span>
                        <span className="font-bold text-green-600">{formatCurrency(payslip.gross_salary)}</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-3 text-red-700">Deductions</h3>
                    {deductions.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                            <span className="text-gray-600">{item.component_name}</span>
                            <span className="font-medium text-red-600">-{formatCurrency(item.amount)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between pt-3 mt-2 border-t-2">
                        <span className="font-semibold">Total Deductions</span>
                        <span className="font-bold text-red-600">-{formatCurrency(payslip.total_deductions)}</span>
                    </div>
                </div>
            </div>

            {/* Net Salary */}
            <div className="bg-blue-50 rounded-lg shadow p-6 border-2 border-blue-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-blue-800">Net Salary</h3>
                        {payslip.payment_date && (
                            <p className="text-sm text-blue-600">Paid on {payslip.payment_date} via {payslip.payment_mode_display || payslip.payment_mode}</p>
                        )}
                    </div>
                    <span className="text-3xl font-bold text-blue-800">{formatCurrency(payslip.net_salary)}</span>
                </div>
            </div>
        </div>
    );
};

export default PayslipView;
