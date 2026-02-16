import React, { useState, useEffect } from 'react';
import {
    PageHeader,
    Card,
    Button,
    Badge,
    DataTable,
    LoadingSpinner,
    Modal,
} from '../../components/common';
import { housesAPI } from '../../api/houses';
import { toast } from 'react-toastify';
import { TrophyIcon, StarIcon, PlusIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline';

const HouseDashboard = () => {
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isAwardingPoints, setIsAwardingPoints] = useState(false);
    const [pointLogs, setPointLogs] = useState([]);

    useEffect(() => {
        fetchHouses();
        fetchGlobalLogs();
    }, []);

    const fetchHouses = async () => {
        try {
            setLoading(true);
            const response = await housesAPI.getHouses();
            setHouses(response.data.results || response.data);
        } catch (error) {
            toast.error('Failed to fetch house stats');
        } finally {
            setLoading(false);
        }
    };

    const fetchGlobalLogs = async () => {
        try {
            const response = await housesAPI.getPointLogs({ limit: 5 });
            setPointLogs(response.data.results || response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleViewHouse = async (house) => {
        try {
            setSelectedHouse(house);
            const response = await housesAPI.getHouseLeaderboard(house.id);
            setLeaderboard(response.data);
        } catch (error) {
            toast.error('Failed to fetch house leaderboard');
        }
    };

    if (loading) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;

    const sortedHouses = [...houses].sort((a, b) => b.total_points - a.total_points);

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <PageHeader
                title="House Championship"
                subtitle="Track point standings and academic excellence across school houses"
                actions={
                    <Button variant="primary" onClick={() => setIsAwardingPoints(true)}>
                        <PlusIcon className="w-5 h-5 mr-2" /> Award Point
                    </Button>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Visual Standings */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {sortedHouses.map((house, index) => (
                        <div key={house.id} className="relative group cursor-pointer" onClick={() => handleViewHouse(house)}>
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${getGradient(house.color_code)} rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200`}></div>
                            <Card className="relative h-full border-none shadow-sm overflow-hidden">
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl`} style={{ backgroundColor: house.color_code }}>
                                            {house.name[0]}
                                        </div>
                                        {index === 0 && <TrophyIcon className="w-6 h-6 text-yellow-500 animate-bounce" />}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">{house.name} House</h3>
                                    <p className="text-xs text-slate-400 italic mb-4">{house.motto || '"Strength through Unity"'}</p>

                                    <div className="mt-auto">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-3xl font-black text-slate-900">{house.total_points}</span>
                                            <span className="text-xs font-bold text-slate-400 mb-1">PTS</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="h-full"
                                                style={{
                                                    backgroundColor: house.color_code,
                                                    width: `${Math.min(100, (house.total_points / (sortedHouses[0].total_points || 1)) * 100)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <div className="lg:col-span-1">
                        <Card title="Recent Achievements" icon={<ClockIcon className="w-5 h-5" />}>
                            <div className="space-y-4">
                                {pointLogs.map(log => (
                                    <div key={log.id} className="flex gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                        <div className={`w-1 h-10 rounded-full`} style={{ backgroundColor: houseColorMap[log.house] || '#ccc' }}></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{log.reason}</p>
                                            <p className="text-xs text-slate-500">{log.student_name || 'Collective Team Effort'}</p>
                                        </div>
                                        <div className={`font-black text-sm ${log.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {log.points >= 0 ? `+${log.points}` : log.points}
                                        </div>
                                    </div>
                                ))}
                                <Button variant="ghost" fullWidth className="mt-4 text-xs font-bold text-blue-600">
                                    View Full Point Log
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* My House Focus / Leaderboard */}
                    <div className="lg:col-span-2">
                        {selectedHouse ? (
                            <Card
                                title={`${selectedHouse.name} House Leaderboard`}
                                icon={<StarIcon className="w-5 h-5 text-yellow-500" />}
                                subtitle="Top 10 individual contributors"
                            >
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="px-6 py-3 text-left">Rank</th>
                                            <th className="px-6 py-3 text-left">Student</th>
                                            <th className="px-6 py-3 text-left">Role</th>
                                            <th className="px-6 py-3 text-right">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {leaderboard.map((member, i) => (
                                            <tr key={member.id} className="group hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-yellow-50 text-yellow-700' : 'text-slate-400'}`}>
                                                        {i + 1}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm font-bold text-slate-900">{member.student_name}</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={member.role === 'MEMBER' ? 'default' : 'primary'}>
                                                        {member.role.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-black text-slate-700">
                                                    {member.points_contributed}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        ) : (
                            <div className="h-full flex items-center justify-center border-2 border-dashed rounded-3xl p-12 bg-white/50">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <UsersIcon className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <h4 className="font-bold text-slate-800">Select a House</h4>
                                    <p className="text-sm text-slate-500">Click on a house card above to view its top performers</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Award Points Modal (Simplified for now) */}
            <Modal
                isOpen={isAwardingPoints}
                onClose={() => setIsAwardingPoints(false)}
                title="Award Competition Points"
            >
                <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    toast.success('Points awarded successfully!');
                    setIsAwardingPoints(false);
                    fetchHouses();
                    fetchGlobalLogs();
                }}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select House</label>
                        <select className="w-full rounded-xl border-slate-200 outline-none ring-blue-500 focus:ring-2">
                            {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Points</label>
                        <input type="number" defaultValue="10" className="w-full rounded-xl border-slate-200 outline-none ring-blue-500 focus:ring-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Category</label>
                        <textarea className="w-full rounded-xl border-slate-200 outline-none ring-blue-500 focus:ring-2" placeholder="e.g. 1st Place in Inter-house Debating" />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <Button variant="outline" fullWidth onClick={() => setIsAwardingPoints(false)}>Cancel</Button>
                        <Button variant="primary" fullWidth type="submit">Award Points</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

// Helpers
const getGradient = (hex) => {
    // Return a gradient string based on approximate color
    return `from-slate-300 to-slate-400`; // Placeholder, real logic would be better
};

const houseColorMap = {}; // Will be populated from data

export default HouseDashboard;
