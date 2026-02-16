import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchEnquiries,
    setEnquiryFilters,
    selectEnquiries,
    selectEnquiryFilters,
    selectEnquiryPagination,
    selectAdmissionLoading,
} from '../../store/slices/admissionsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Search, Filter, RefreshCw, User, Phone, Mail, Calendar, HelpCircle, Loader2 } from 'lucide-react';

const SOURCE_VARIANTS = {
    WALK_IN: 'primary',
    PHONE: 'success',
    ONLINE: 'violet',
    REFERRAL: 'amber'
};

const STATUS_VARIANTS = {
    NEW: 'secondary',
    CONTACTED: 'warning',
    CONVERTED: 'success',
    CLOSED: 'destructive'
};

const EnquiryList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const enquiries = useSelector(selectEnquiries);
    const pagination = useSelector(selectEnquiryPagination);
    const currentFilters = useSelector(selectEnquiryFilters);
    const loading = useSelector(selectAdmissionLoading);

    // Local state for filters
    const [filters, setLocalFilters] = useState({
        search: '',
        status: '',
        source: '',
        page: 1,
        pageSize: 10
    });

    useEffect(() => {
        if (currentFilters) {
            setLocalFilters(prev => ({ ...prev, ...currentFilters }));
        }
    }, [currentFilters]);

    const loadEnquiries = useCallback(() => {
        dispatch(fetchEnquiries(filters));
    }, [dispatch, filters]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadEnquiries();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [loadEnquiries]);

    const handleFilterChange = (key, value) => {
        setLocalFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Admission Enquiries"
                    description={`Track ${pagination?.count || 0} potential students`}
                    action={
                        <Button onClick={() => navigate('/admissions/enquiries/new')}>
                            <HelpCircle className="w-4 h-4 mr-2" />
                            New Enquiry
                        </Button>
                    }
                />

                <Card>
                    <CardHeader className="pb-3 border-b border-border">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <CardTitle>Enquiries List</CardTitle>
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, phone..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Status</option>
                                    <option value="NEW">New</option>
                                    <option value="CONTACTED">Contacted</option>
                                    <option value="CONVERTED">Converted</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                                <select
                                    value={filters.source}
                                    onChange={(e) => handleFilterChange('source', e.target.value)}
                                    className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Sources</option>
                                    <option value="WALK_IN">Walk In</option>
                                    <option value="PHONE">Phone</option>
                                    <option value="ONLINE">Online</option>
                                    <option value="REFERRAL">Referral</option>
                                </select>
                                <Button variant="outline" size="icon" onClick={loadEnquiries} title="Refresh">
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Enquirer Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact Info</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Enquiry Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Follow Up</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {loading && (!enquiries || enquiries.length === 0) ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center">
                                                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                                                    <p>Loading enquiries...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : enquiries && enquiries.length > 0 ? (
                                        enquiries.map((enquiry) => (
                                            <tr key={enquiry.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-primary/10 rounded-full mr-3">
                                                            <User className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <span className="font-medium text-foreground">{enquiry.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col space-y-1 text-sm text-foreground">
                                                        <div className="flex items-center">
                                                            <Phone className="h-3 w-3 mr-2" />
                                                            {enquiry.phone}
                                                        </div>
                                                        {enquiry.email && (
                                                            <div className="flex items-center text-muted-foreground">
                                                                <Mail className="h-3 w-3 mr-2" />
                                                                {enquiry.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={SOURCE_VARIANTS[enquiry.source] || 'secondary'}>
                                                        {enquiry.source_display || enquiry.source}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={STATUS_VARIANTS[enquiry.status] || 'secondary'} className="font-normal">
                                                        {enquiry.status_display || enquiry.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        {new Date(enquiry.enquiry_date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    {enquiry.follow_up_date ? new Date(enquiry.follow_up_date).toLocaleDateString() : '—'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                                No enquiries found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-muted/20">
                            <span className="text-sm text-muted-foreground">
                                Page {filters.page}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={filters.page === 1}
                                    onClick={() => handleFilterChange('page', filters.page - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={enquiries && enquiries.length < filters.pageSize}
                                    onClick={() => handleFilterChange('page', filters.page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AnimatedPage>
    );
};

export default EnquiryList;
