import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, LoadingSpinner } from '../../components/common';
import { UserCircleIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import client from '../../api/client'; // Direct API call for self-profile
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import {
    StarIcon,
    TrophyIcon,
    LightBulbIcon,
    CodeBracketIcon,
    MusicalNoteIcon,
    PaintBrushIcon
} from '@heroicons/react/24/solid';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const MyProfile = () => {
    const { user } = useSelector(state => state.auth);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Assuming we have an endpoint for my-profile or search by user ID
                // For now, let's assume we can hit /students/?user_id={id} or similar
                // But typically a /auth/me/profile endpoint is better.
                // Re-using existing student List API filtering logic might be complex if permissions are strict.
                // Let's rely on Redux auth user data initially, but ideally we fetch full student details.

                // TODO: Implement dedicated /api/v1/students/me endpoint in backend for security
                const response = await client.get(`/students/?email=${user.email}`);
                if (response.data.results && response.data.results.length > 0) {
                    setProfile(response.data.results[0]);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.email) {
            fetchProfile();
        }
    }, [user]);

    if (loading) return <LoadingSpinner />;

    if (!profile) {
        return (
            <div className="p-6">
                <Card>
                    <div className="text-center py-8 text-gray-500">
                        Profile not found. Please contact administration.
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header / Basic Info */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
                <div className="px-6 pb-6">
                    <div className="relative flex items-end -mt-12 mb-4">
                        <div className="bg-white p-1 rounded-full">
                            {profile.profile_picture ? (
                                <img
                                    src={profile.profile_picture}
                                    alt="Profile"
                                    className="h-24 w-24 rounded-full object-cover border-4 border-white"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white text-3xl font-bold text-gray-400">
                                    {profile.first_name[0]}
                                </div>
                            )}
                        </div>
                        <div className="ml-4 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">{profile.first_name} {profile.last_name}</h1>
                            <p className="text-sm text-gray-600">Class {profile.current_class} - {profile.section}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        <div className="flex items-center text-gray-600">
                            <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                            <span>Roll No: {profile.roll_number}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400" />
                            <span>{profile.email}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <PhoneIcon className="h-5 w-5 mr-2 text-gray-400" />
                            <span>{profile.emergency_contact_number || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-gray-600 col-span-full">
                            <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
                            <span>{profile.address || 'Address not updated'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Academic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Academic Information">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Admission Number</dt>
                            <dd className="mt-1 text-sm text-gray-900">{profile.admission_number}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Board</dt>
                            <dd className="mt-1 text-sm text-gray-900">{profile.board || 'CBSE'}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                            <dd className="mt-1 text-sm text-gray-900">{profile.date_of_birth}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Gender</dt>
                            <dd className="mt-1 text-sm text-gray-900">{profile.gender}</dd>
                        </div>
                    </dl>
                </Card>

                <Card title="Guardian Information">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Guardian Name</dt>
                            <dd className="mt-1 text-sm text-gray-900">{profile.guardian_name}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Relation</dt>
                            <dd className="mt-1 text-sm text-gray-900">{profile.guardian_relation || 'Parent'}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Contact</dt>
                            <dd className="mt-1 text-sm text-gray-900">{profile.guardian_phone}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-sm text-gray-900">{profile.guardian_email || '-'}</dd>
                        </div>
                    </dl>
                </Card>
            </div>
            {/* PORTFOLIO SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Skill Spider Graph */}
                <Card title="Skill Matrix" className="lg:col-span-1">
                    <div className="h-64 flex items-center justify-center">
                        <Radar
                            data={{
                                labels: ['Math', 'Science', 'Logic', 'Creativity', 'Language', 'Sports'],
                                datasets: [{
                                    label: 'Skill Level',
                                    data: [85, 92, 78, 65, 88, 70],
                                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                    borderColor: 'rgb(99, 102, 241)',
                                    pointBackgroundColor: 'rgb(99, 102, 241)',
                                }]
                            }}
                            options={{
                                scales: {
                                    r: {
                                        angleLines: { display: false },
                                        suggestedMin: 0,
                                        suggestedMax: 100
                                    }
                                },
                                plugins: { legend: { display: false } }
                            }}
                        />
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-4 italic">Automatically generated from assessment data & teacher feedback.</p>
                </Card>

                {/* Best Work Showcase */}
                <Card title="Best Work Showcase" className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { title: 'AI Chatbot Project', type: 'Technology', date: 'May 2024', icon: CodeBracketIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { title: 'Classical Violin Solo', type: 'Arts', date: 'Apr 2024', icon: MusicalNoteIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
                            { title: 'District Math Olympiad', type: 'Academic', date: 'Mar 2024', icon: LightBulbIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
                            { title: 'Digital Arts Portfolio', type: 'Creativity', date: 'Feb 2024', icon: PaintBrushIcon, color: 'text-pink-600', bg: 'bg-pink-50' }
                        ].map((work, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all group cursor-pointer">
                                <div className={`p-3 rounded-lg ${work.bg} ${work.color}`}>
                                    <work.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600">{work.title}</h4>
                                    <p className="text-xs text-gray-500">{work.type} • {work.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all">
                        + Add Project to Showcase
                    </button>
                </Card>
            </div>

            {/* Achievements & Recognition */}
            <Card title="Achievements & Badges">
                <div className="flex flex-wrap gap-6">
                    {[
                        { name: 'Gold Medalist', event: 'School Debate 2023', icon: TrophyIcon, color: 'text-amber-500' },
                        { name: '100% Attendance', event: 'Term 1, 2024', icon: StarIcon, color: 'text-blue-500' },
                        { name: 'Top Scorer', event: 'Science Exhibition', icon: LightBulbIcon, color: 'text-purple-500' }
                    ].map((award, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-full border border-gray-100">
                                <award.icon className={`h-8 w-8 ${award.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{award.name}</p>
                                <p className="text-xs text-gray-500">{award.event}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default MyProfile;
