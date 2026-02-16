import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCommissions } from '../../store/slices/partnersSlice';
import { Card, LoadingSpinner, Badge } from '../../components/common';
import { CurrencyRupeeIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const CommissionLedger = () => {
    const dispatch = useDispatch();
    const { data: commissions, loading } = useSelector((state) => state.partners.commissions);

    useEffect(() => {
        dispatch(fetchCommissions());
    }, [dispatch]);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Commission Ledger</h1>
                <p className="text-sm text-gray-500">View detailed earnings and calculation basis.</p>
            </div>

            <Card>
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {commissions.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{item.id.toString().padStart(6, '0')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{item.lead_school_name}</div>
                                            <div className="text-xs text-gray-500">Tier: {item.payout_tier}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                                            ₹{item.commission_amount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.is_paid ? (
                                                <Badge color="success" className="flex items-center gap-1 w-fit">
                                                    <CheckCircleIcon className="h-3 w-3" /> Paid
                                                </Badge>
                                            ) : (
                                                <Badge color="yellow" className="flex items-center gap-1 w-fit">
                                                    <ClockIcon className="h-3 w-3" /> Pending
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {commissions.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No commission entries yet. Commissions are generated when your deals close.
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

export default CommissionLedger;
