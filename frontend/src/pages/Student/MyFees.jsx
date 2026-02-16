import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyFees } from '../../store/slices/financeSlice';
import { Card, Button, LoadingSpinner } from '../../components/common';
import { PrinterIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowDownTrayIcon, ClockIcon } from '@heroicons/react/24/outline';

const MyFees = () => {
    const dispatch = useDispatch();
    const { data: fees, loading, error } = useSelector((state) => state.finance.studentFees);

    useEffect(() => {
        dispatch(fetchMyFees());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-600">
                <ExclamationCircleIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Error loading fees: {typeof error === 'string' ? error : 'Unknown error'}</p>
            </div>
        );
    }

    // Calculate stats
    const totalOverdue = fees
        .filter(f => f.status === 'OVERDUE')
        .reduce((sum, f) => sum + parseFloat(f.final_amount - f.paid_amount), 0);

    const upcomingDue = fees
        .filter(f => f.status === 'PENDING' || f.status === 'PARTIAL')
        .reduce((sum, f) => sum + parseFloat(f.final_amount - f.paid_amount), 0);

    const totalPaid = fees
        .reduce((sum, f) => sum + parseFloat(f.paid_amount), 0);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Fee Status & Payments</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Summary Cards */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-600 font-semibold uppercase">Total Overdue</p>
                    <p className="text-2xl font-bold text-red-800 mt-2">₹{companyFormat(totalOverdue)}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-600 font-semibold uppercase">Pending / Upcoming</p>
                    <p className="text-2xl font-bold text-blue-800 mt-2">₹{companyFormat(upcomingDue)}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-600 font-semibold uppercase">Total Paid</p>
                    <p className="text-2xl font-bold text-green-800 mt-2">₹{companyFormat(totalPaid)}</p>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount / Paid</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {fees.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">No fee records found.</td>
                                </tr>
                            ) : (
                                fees.map((fee) => (
                                    <tr key={fee.id}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {fee.fee_structure?.fee_category?.name || 'School Fee'}
                                            </div>
                                            <div className="text-xs text-gray-500">{fee.academic_year?.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(fee.due_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <div> Total: ₹{companyFormat(fee.final_amount)} </div>
                                            <div className="text-xs text-green-600"> Paid: ₹{companyFormat(fee.paid_amount)} </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {fee.status === 'PAID' && (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" /> Paid
                                                </span>
                                            )}
                                            {(fee.status === 'PENDING' || fee.status === 'PARTIAL') && (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    <ClockIcon className="h-4 w-4 mr-1 text-blue-500" /> {fee.status}
                                                </span>
                                            )}
                                            {fee.status === 'OVERDUE' && (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    <ExclamationCircleIcon className="h-4 w-4 mr-1 text-red-500" /> Overdue
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const companyFormat = (num) => {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

export default MyFees;
