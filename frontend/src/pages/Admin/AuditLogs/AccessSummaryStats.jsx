import React, { useState, useEffect } from 'react';
import { Card, Spinner, Badge } from '../../../components/common';
import { privacyAPI } from '../../../api/privacy';
import showToast from '../../../utils/toast';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AccessSummaryStats = ({ onRefresh }) => {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(7); // days
    const [stats, setStats] = useState({
        total_accesses: 0,
        by_access_type: {},
        by_field: {},
        by_user: [],
        by_hour: [],
        consent_compliance: {
            with_consent: 0,
            without_consent: 0,
        },
        flagged_percentage: 0,
    });

    useEffect(() => {
        loadSummaryStats();
    }, [timeRange]);

    const loadSummaryStats = async () => {
        try {
            setLoading(true);
            const response = await privacyAPI.getAuditLogsSummary({ days: timeRange });
            setStats(response.data);
        } catch (error) {
            showToast.error('Failed to load summary statistics');
            console.error('Summary stats error:', error);
        } finally {
            setLoading(false);
        }
    };

    const prepareAccessTypeData = () => {
        return Object.entries(stats.by_access_type || {}).map(([type, count]) => ({
            name: type,
            count: count,
        }));
    };

    const prepareTopFieldsData = () => {
        const entries = Object.entries(stats.by_field || {});
        return entries
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([field, count]) => ({
                name: field.replace(/_/g, ' '),
                count: count,
            }));
    };

    const prepareHourlyData = () => {
        return (stats.by_hour || []).map((item) => ({
            hour: `${item.hour}:00`,
            accesses: item.count,
        }));
    };

    const prepareConsentData = () => {
        return [
            { name: 'With Valid Consent', value: stats.consent_compliance?.with_consent || 0, color: '#10b981' },
            { name: 'Without Consent', value: stats.consent_compliance?.without_consent || 0, color: '#ef4444' },
        ];
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Overview Statistics</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Viewing data for the last {timeRange} days
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {[7, 30, 90].map((days) => (
                            <button
                                key={days}
                                onClick={() => setTimeRange(days)}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                    timeRange === days
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {days} Days
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-medium">Total Accesses</p>
                            <p className="text-3xl font-bold text-blue-900 mt-2">
                                {stats.total_accesses?.toLocaleString() || 0}
                            </p>
                        </div>
                        <div className="text-5xl opacity-50">📊</div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-medium">Consent Compliance</p>
                            <p className="text-3xl font-bold text-green-900 mt-2">
                                {Math.round(
                                    ((stats.consent_compliance?.with_consent || 0) /
                                        (stats.total_accesses || 1)) *
                                        100
                                )}%
                            </p>
                        </div>
                        <div className="text-5xl opacity-50">✅</div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-700 font-medium">Flagged Accesses</p>
                            <p className="text-3xl font-bold text-yellow-900 mt-2">
                                {stats.flagged_percentage?.toFixed(1) || 0}%
                            </p>
                        </div>
                        <div className="text-5xl opacity-50">⚠️</div>
                    </div>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Access Types Distribution */}
                <Card title="Access Types Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={prepareAccessTypeData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {prepareAccessTypeData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                {/* Consent Compliance */}
                <Card title="Consent Compliance">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={prepareConsentData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {prepareConsentData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-center">
                        {stats.consent_compliance?.without_consent > 0 ? (
                            <Badge variant="warning">
                                ⚠️ {stats.consent_compliance.without_consent} accesses without consent
                            </Badge>
                        ) : (
                            <Badge variant="success">
                                ✓ All accesses have valid consent
                            </Badge>
                        )}
                    </div>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 gap-6">
                {/* Top 10 Most Accessed Fields */}
                <Card title="Top 10 Most Accessed Sensitive Fields">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={prepareTopFieldsData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={120}
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#3b82f6" name="Access Count" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Hourly Access Pattern */}
                <Card title="Access Pattern by Hour">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={prepareHourlyData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="accesses"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                name="Access Count"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Accesses between 22:00-06:00 are flagged as suspicious
                        </p>
                    </div>
                </Card>
            </div>

            {/* Top Users Table */}
            <Card title="Top Users by Access Count">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Accesses
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Flagged
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Compliance Rate
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(stats.by_user || []).slice(0, 10).map((user, index) => (
                                <tr key={user.user_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        #{index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.user_name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            ID: {user.user_id}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.total_accesses.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.flagged_count > 0 ? (
                                            <Badge variant="warning">
                                                {user.flagged_count} flagged
                                            </Badge>
                                        ) : (
                                            <Badge variant="success">Clean</Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-sm text-gray-900">
                                                {user.compliance_rate.toFixed(1)}%
                                            </div>
                                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        user.compliance_rate >= 90
                                                            ? 'bg-green-500'
                                                            : user.compliance_rate >= 70
                                                            ? 'bg-yellow-500'
                                                            : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${user.compliance_rate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {(!stats.by_user || stats.by_user.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                            No user access data available
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AccessSummaryStats;
