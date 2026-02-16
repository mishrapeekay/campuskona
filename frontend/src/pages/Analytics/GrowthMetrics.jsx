import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvestorDashboard } from '../../store/slices/analyticsSlice';
import { Card, LoadingSpinner, Badge } from '../../components/common';
import {
    ChatBubbleLeftRightIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from '@heroicons/react/24/outline';

const GrowthMetrics = () => {
    const dispatch = useDispatch();
    const { dashboard } = useSelector((state) => state.analytics);

    useEffect(() => {
        dispatch(fetchInvestorDashboard());
    }, [dispatch]);

    if (dashboard.loading) return <div className="p-12"><LoadingSpinner size="lg" /></div>;
    if (!dashboard.data) return <div className="p-12 text-center text-gray-500">No data available</div>;

    const { growth, trends } = dashboard.data;

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Market Growth Detailed Metrics</h1>
                <p className="text-sm text-gray-500">Deep dive into school acquisition and regional performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Acquisition Funnel (This Month)">
                    <div className="space-y-6 py-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">New Schools Onboarded</span>
                            <div className="flex items-center text-green-600 font-bold">
                                <span>{growth.new_schools_this_month}</span>
                                <ArrowUpIcon className="h-4 w-4 ml-1" />
                            </div>
                        </div>
                        <div className="relative pt-1">
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                                <div style={{ width: "70%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Target: 12 Schools</span>
                                <span>Progress: {Math.round((growth.new_schools_this_month / 12) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Regional Distribution">
                    <div className="space-y-4">
                        {Object.entries(growth.regions).map(([name, count]) => (
                            <div key={name} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{name}</span>
                                <div className="flex items-center gap-4 flex-1 mx-4">
                                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-purple-500 h-full rounded-full"
                                            style={{ width: `${(count / 120) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 w-8">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <Card title="Month-over-Month Trends">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRR</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Schools</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {trends.map((t, i) => (
                                <tr key={t.date}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{t.mrr.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.schools}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {i === 0 ? (
                                            <span className="text-gray-400">-</span>
                                        ) : t.mrr > trends[i - 1].mrr ? (
                                            <div className="flex items-center text-green-600 text-sm">
                                                <ArrowUpIcon className="h-3 w-3 mr-1" />
                                                {Math.round(((t.mrr - trends[i - 1].mrr) / trends[i - 1].mrr) * 100)}%
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-red-600 text-sm">
                                                <ArrowDownIcon className="h-3 w-3 mr-1" />
                                                {Math.round(((trends[i - 1].mrr - t.mrr) / trends[i - 1].mrr) * 100)}%
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default GrowthMetrics;
