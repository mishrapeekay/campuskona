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
import { activitiesAPI } from '../../api/activities';
import { toast } from 'react-toastify';
import {
    UserGroupIcon,
    CalendarIcon,
    PlusIcon,
    BeakerIcon,
    MusicalNoteIcon,
    GlobeAltIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const ClubDashboard = () => {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingClub, setIsCreatingClub] = useState(false);
    const [selectedClub, setSelectedClub] = useState(null);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        fetchClubs();
        fetchGlobalActivities();
    }, []);

    const fetchClubs = async () => {
        try {
            setLoading(true);
            const response = await activitiesAPI.getClubs();
            setClubs(response.data.results || response.data);
        } catch (error) {
            toast.error('Failed to fetch clubs');
        } finally {
            setLoading(false);
        }
    };

    const fetchGlobalActivities = async () => {
        try {
            const response = await activitiesAPI.getClubActivities({ limit: 5 });
            setActivities(response.data.results || response.data);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;

    const categories = [
        { name: 'STEM', icon: <BeakerIcon className="w-5 h-5" />, color: 'purple' },
        { name: 'ARTS', icon: <MusicalNoteIcon className="w-5 h-5" />, color: 'pink' },
        { name: 'COMMUNITY', icon: <GlobeAltIcon className="w-5 h-5" />, color: 'green' },
        { name: 'ACADEMIC', icon: <MagnifyingGlassIcon className="w-5 h-5" />, color: 'blue' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <PageHeader
                title="Activities & Clubs"
                subtitle="Manage co-curricular groups and tracking student participation"
                actions={
                    <Button variant="primary" onClick={() => setIsCreatingClub(true)}>
                        <PlusIcon className="w-5 h-5 mr-2" /> Create New Club
                    </Button>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Clubs List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {clubs.map(club => (
                                <Card key={club.id} className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden border-none shadow-sm" onClick={() => setSelectedClub(club)}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-2xl bg-${getCategoryColor(club.category)}-50 text-${getCategoryColor(club.category)}-600`}>
                                            {getCategoryIcon(club.category)}
                                        </div>
                                        <Badge variant={club.is_active ? 'success' : 'default'}>
                                            {club.is_active ? 'Active' : 'Archived'}
                                        </Badge>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">{club.name}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-6">{club.description}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                            <UserGroupIcon className="w-4 h-4 mr-2" />
                                            {club.member_count} Members
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            In-Charge: <span className="font-bold text-slate-700">{club.in_charge_name || 'N/A'}</span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: Upcoming activities */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card title="Upcoming Activities" icon={<CalendarIcon className="w-5 h-5" />} className="border-none shadow-sm">
                            <div className="space-y-6">
                                {activities.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-4 italic">No activities scheduled</p>
                                ) : (
                                    activities.map(activity => (
                                        <div key={activity.id} className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-100">
                                            <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-blue-500"></div>
                                            <p className="text-xs font-bold text-blue-600 uppercase mb-1">{activity.date}</p>
                                            <p className="text-sm font-bold text-slate-800 mb-1">{activity.title}</p>
                                            <p className="text-xs text-slate-400 font-medium">{activity.club_name} • {activity.venue}</p>
                                        </div>
                                    ))
                                )}
                                <Button variant="outline" fullWidth size="sm" className="mt-4">
                                    Full Calendar
                                </Button>
                            </div>
                        </Card>

                        <Card title="Engagement Stats" className="border-none shadow-sm bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-blue-100 text-xs font-bold uppercase">Total Enrolled</p>
                                    <p className="text-2xl font-black">428</p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-xs font-bold uppercase">Active Clubs</p>
                                    <p className="text-2xl font-black">{clubs.length}</p>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-xs text-blue-100 italic">"Co-curricular activities increase student retention by 18%"</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Create Club Modal (Stub) */}
            <Modal
                isOpen={isCreatingClub}
                onClose={() => setIsCreatingClub(false)}
                title="Launch New Club"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-500">Define the mission and leadership for a new student group.</p>
                    {/* Form fields here */}
                    <div className="pt-4 flex gap-3">
                        <Button variant="outline" fullWidth onClick={() => setIsCreatingClub(false)}>Cancel</Button>
                        <Button variant="primary" fullWidth onClick={() => {
                            toast.success('Club proposal submitted for Admin approval!');
                            setIsCreatingClub(false);
                        }}>Submit Proposal</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Helpers
const getCategoryIcon = (cat) => {
    switch (cat) {
        case 'STEM': return <BeakerIcon className="w-6 h-6" />;
        case 'ARTS': return <MusicalNoteIcon className="w-6 h-6" />;
        case 'COMMUNITY': return <GlobeAltIcon className="w-6 h-6" />;
        default: return <MagnifyingGlassIcon className="w-6 h-6" />;
    }
}

const getCategoryColor = (cat) => {
    switch (cat) {
        case 'STEM': return 'indigo';
        case 'ARTS': return 'pink';
        case 'COMMUNITY': return 'emerald';
        default: return 'blue';
    }
}

export default ClubDashboard;
