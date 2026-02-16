import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayouts } from '../../store/slices/partnersSlice';
import { Card, LoadingSpinner, Badge, Button } from '../../components/common';
import {
    BanknotesIcon,
    DocumentArrowDownIcon,
    ArrowUpRightIcon
} from '@heroicons/react/24/outline';

const PayoutHistory = () => {
    const dispatch = useDispatch();
    const { data: payouts, loading } = useSelector((state) => state.partners.payouts);

    useEffect(() => {
        dispatch(fetchPayouts());
    }, [dispatch]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PROCESSED': return 'success';
            case 'FAILED': return 'danger';
            case 'INITIATED': return 'info';
            case 'PENDING': return 'gray';
            default: return 'gray';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payout History</h1>
                    <p className="text-sm text-gray-500">Track your bank transfers and payout summaries.</p>
                </div>
                <Button variant="secondary">
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    Statement
                </Button>
            </div>

            <Card>
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statement</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payouts.map((payout) => (
                                    <tr key={payout.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{payout.id.toString().padStart(8, '0')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                            ₹{payout.amount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {payout.payment_method}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge color={getStatusColor(payout.status)}>
                                                {payout.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(payout.processed_date || payout.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                                                Download <ArrowUpRightIcon className="h-3 w-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {payouts.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No payouts found. Payouts are processed monthly when the balance exceeds ₹5000.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PayoutHistory;
