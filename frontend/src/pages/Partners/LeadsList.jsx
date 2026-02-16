import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeads, clearError } from '../../store/slices/partnersSlice';
import { Card, LoadingSpinner, Badge, Button, Input } from '../../components/common';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    FunnelIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const LeadsList = () => {
    const dispatch = useDispatch();
    const { leads, loading } = useSelector((state) => state.partners.leads);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchLeads());
    }, [dispatch]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'WON': return 'success';
            case 'LOST': return 'danger';
            case 'QUALIFIED': return 'info';
            case 'NEW': return 'gray';
            default: return 'gray';
        }
    };

    const filteredLeads = leads?.filter(lead =>
        lead.school_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Prospects & Leads</h1>
                    <p className="text-sm text-gray-500">Manage your pipeline and track school onboardings.</p>
                </div>
                <Button variant="primary">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Lead
                </Button>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            className="pl-10"
                            placeholder="Search leads by school name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="secondary">
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        Filter
                    </Button>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated MRR</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-blue-100 rounded-lg text-blue-600">
                                                    <BuildingOfficeIcon className="h-6 w-6" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{lead.school_name}</div>
                                                    <div className="text-sm text-gray-500">{lead.city}, {lead.state}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{lead.contact_person}</div>
                                            <div className="text-sm text-gray-500">{lead.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge color={getStatusColor(lead.status)}>
                                                {lead.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ₹{lead.estimated_mrr}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {filteredLeads.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No leads found. Join our partner program to start adding prospects.
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

export default LeadsList;
