import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
    fetchStaffById,
    selectCurrentStaff,
    selectStaffLoading,
} from '../../store/slices/staffSlice';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/primitives/avatar';
import { getMediaUrl } from '@/utils/mediaUrl';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/primitives/tabs';
import { Separator } from '@/ui/primitives/separator';
import {
    Edit,
    Printer,
    User,
    Briefcase,
    GraduationCap,
    FileText,
    Calendar,
    Clock,
    MapPin,
    Phone,
    Mail,
    CreditCard,
    Building2,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';

const StaffDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const staff = useSelector(selectCurrentStaff);
    const loading = useSelector(selectStaffLoading);

    // Default tab based on url or state could be implemented, defaulting to 'personal'
    const [activeTab, setActiveTab] = useState('personal');

    useEffect(() => {
        if (id) {
            dispatch(fetchStaffById(id));
        }
    }, [dispatch, id]);

    if (loading) {
        return (
            <div className="h-[calc(100vh-100px)] w-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading staff details...</p>
            </div>
        );
    }

    if (!staff) {
        return (
            <AnimatedPage>
                <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="bg-destructive/10 p-4 rounded-full">
                        <User className="h-10 w-10 text-destructive" />
                    </div>
                    <h3 className="text-xl font-semibold">Staff Member Not Found</h3>
                    <p className="text-muted-foreground max-w-sm">
                        The requested staff member profile could not be retrieved. They may have been deleted or you may have an incorrect ID.
                    </p>
                    <Button onClick={() => navigate('/staff')} variant="outline">
                        Return to Staff Directory
                    </Button>
                </div>
            </AnimatedPage>
        );
    }

    const getStatusVariant = (status) => {
        const variants = {
            active: 'success',
            on_leave: 'warning',
            suspended: 'destructive',
            terminated: 'destructive',
        };
        return variants[status?.toLowerCase()] || 'secondary';
    };

    const InfoItem = ({ label, value, icon: Icon, className = "" }) => (
        <div className={`space-y-1 ${className}`}>
            <dt className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 uppercase tracking-wide">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
            </dt>
            <dd className="text-sm font-medium text-foreground break-words">{value || <span className="text-muted-foreground/40 italic">Not set</span>}</dd>
        </div>
    );

    return (
        <AnimatedPage>
            <div className="space-y-6 pb-10">
                <PageHeader
                    title={staff.full_name}
                    description={`Employee ID: ${staff.employee_id || 'N/A'}`}
                    breadcrumbs={[
                        { label: 'Staff', href: '/staff' },
                        { label: 'Profile', active: true },
                    ]}
                    action={
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => window.print()}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print Profile
                            </Button>
                            <Button size="sm" onClick={() => navigate(`/staff/${id}/edit`)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar / Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardContent className="pt-6 flex flex-col items-center text-center">
                                <Avatar className="h-32 w-32 border-4 border-background shadow-xl mb-4">
                                    <AvatarImage src={getMediaUrl(staff.photo)} alt={staff.full_name} />
                                    <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                        {staff.first_name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>

                                <h2 className="text-xl font-bold text-foreground">{staff.full_name}</h2>
                                <p className="text-muted-foreground font-medium text-sm mt-1">{staff.designation?.replace(/_/g, ' ')}</p>

                                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                                    <Badge variant={getStatusVariant(staff.employment_status)}>
                                        {staff.employment_status?.replace(/_/g, ' ')}
                                    </Badge>
                                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                                        {staff.employment_type?.replace(/_/g, ' ')}
                                    </Badge>
                                </div>

                                <Separator className="my-6" />

                                <div className="w-full space-y-4 text-left">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="p-2 bg-muted rounded-md shrink-0">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div className="truncate flex-1" title={staff.email}>
                                            <p className="text-xs text-muted-foreground">Email</p>
                                            <p className="font-medium text-foreground truncate">{staff.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="p-2 bg-muted rounded-md shrink-0">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Phone</p>
                                            <p className="font-medium text-foreground">{staff.phone_number || staff.phone || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="p-2 bg-muted rounded-md shrink-0">
                                            <Building2 className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Department</p>
                                            <p className="font-medium text-foreground capitalize">{staff.department}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="p-2 bg-muted rounded-md shrink-0">
                                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Joining Date</p>
                                            <p className="font-medium text-foreground">{staff.joining_date}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content / Tabs */}
                    <div className="lg:col-span-3">
                        <Tabs defaultValue="personal" className="w-full" onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-1 mb-6">
                                <TabsTrigger value="personal" className="gap-2"><User className="w-4 h-4" /> <span className="hidden md:inline">Personal</span></TabsTrigger>
                                <TabsTrigger value="employment" className="gap-2"><Briefcase className="w-4 h-4" /> <span className="hidden md:inline">Job</span></TabsTrigger>
                                <TabsTrigger value="qualifications" className="gap-2"><GraduationCap className="w-4 h-4" /> <span className="hidden md:inline">Education</span></TabsTrigger>
                                <TabsTrigger value="experience" className="gap-2"><Clock className="w-4 h-4" /> <span className="hidden md:inline">History</span></TabsTrigger>
                                <TabsTrigger value="documents" className="gap-2"><FileText className="w-4 h-4" /> <span className="hidden md:inline">Docs</span></TabsTrigger>
                                <TabsTrigger value="attendance" className="gap-2"><Calendar className="w-4 h-4" /> <span className="hidden md:inline">Attendance</span></TabsTrigger>
                            </TabsList>

                            {/* Personal Info Tab */}
                            <TabsContent value="personal" className="space-y-6 animate-in fade-in-50 duration-300">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <User className="w-4 h-4 text-primary" />
                                            Basic Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <InfoItem label="Full Name" value={`${staff.first_name} ${staff.middle_name || ''} ${staff.last_name}`} />
                                        <InfoItem label="Date of Birth" value={staff.date_of_birth} />
                                        <InfoItem label="Gender" value={staff.gender === 'M' ? 'Male' : staff.gender === 'F' ? 'Female' : 'Other'} />
                                        <InfoItem label="Blood Group" value={staff.blood_group} />
                                        <InfoItem label="Aadhar Number" value={staff.aadhar_number} />
                                        <InfoItem label="PAN Number" value={staff.pan_number} />
                                        <InfoItem label="Alternate Phone" value={staff.alternate_phone} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            Address Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <InfoItem label="Full Address" value={[staff.current_address_line1, staff.current_city, staff.current_state, staff.current_pincode].filter(Boolean).join(', ')} />
                                        </div>
                                        <InfoItem label="Address Line 1" value={staff.current_address_line1} />
                                        <InfoItem label="Address Line 2" value={staff.current_address_line2} />
                                        <InfoItem label="City" value={staff.current_city} />
                                        <InfoItem label="State" value={staff.current_state} />
                                        <InfoItem label="Pincode" value={staff.current_pincode} />
                                        <InfoItem label="Country" value="India" />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-primary" />
                                            Emergency Contact
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <InfoItem label="Contact Name" value={staff.emergency_contact_name} />
                                        <InfoItem label="Relation" value={staff.emergency_contact_relation} />
                                        <InfoItem label="Phone Number" value={staff.emergency_contact_number || staff.emergency_contact_phone} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Employment Tab */}
                            <TabsContent value="employment" className="space-y-6 animate-in fade-in-50 duration-300">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-primary" />
                                            Employment Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <InfoItem label="Employee ID" value={staff.employee_id} />
                                        <InfoItem label="Joining Date" value={staff.joining_date} />
                                        <InfoItem label="Department" value={staff.department?.replace(/_/g, ' ')} />
                                        <InfoItem label="Designation" value={staff.designation?.replace(/_/g, ' ')} />
                                        <InfoItem label="Type" value={staff.employment_type?.replace(/_/g, ' ')} />
                                        <InfoItem label="Status" value={staff.employment_status?.replace(/_/g, ' ')} />
                                        <InfoItem label="Qualification" value={staff.highest_qualification?.replace(/_/g, ' ')} />
                                        <InfoItem label="Experience" value={`${staff.total_experience_years || 0} Years`} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-primary" />
                                            Financial Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoItem label="Basic Salary" value={staff.basic_salary ? `₹${Number(staff.basic_salary).toLocaleString()}` : '-'} />
                                        <InfoItem label="Bank Account" value={staff.bank_account_number} />
                                        <InfoItem label="Bank Name" value={staff.bank_name} />
                                        <InfoItem label="IFSC Code" value={staff.ifsc_code} />
                                    </CardContent>
                                </Card>

                                {staff.subjects_taught?.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-primary" />
                                                Subjects Taught
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {staff.subjects_taught.map((subject, index) => (
                                                    <Badge key={index} variant="secondary" className="px-3 py-1 text-sm bg-accent/50 hover:bg-accent border border-border">
                                                        {subject}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            {/* Qualifications Tab */}
                            <TabsContent value="qualifications" className="space-y-6 animate-in fade-in-50 duration-300">
                                {staff.qualifications?.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {staff.qualifications.map((qual, index) => (
                                            <Card key={qual.id || index}>
                                                <CardHeader className="pb-2">
                                                    <div className="flex justify-between items-start">
                                                        <CardTitle className="text-base font-medium flex items-center gap-2">
                                                            <div className="p-1.5 bg-primary/10 rounded-md">
                                                                <GraduationCap className="w-4 h-4 text-primary" />
                                                            </div>
                                                            {qual.degree_name}
                                                        </CardTitle>
                                                        <Badge variant="outline">{qual.year_of_completion}</Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                                                        <InfoItem label="Institution" value={qual.institution_name} />
                                                        <InfoItem label="University/Board" value={qual.university_board} />
                                                        <InfoItem label="Type" value={qual.qualification_type} />
                                                        <InfoItem label="Score" value={`${qual.marks_percentage}% / Grade ${qual.grade || '-'}`} />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed border-border">
                                        <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3" />
                                        <p className="text-muted-foreground font-medium">No qualification records added.</p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Experience Tab */}
                            <TabsContent value="experience" className="space-y-6 animate-in fade-in-50 duration-300">
                                {staff.experience?.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {staff.experience.map((exp, index) => (
                                            <Card key={exp.id || index}>
                                                <CardHeader className="pb-2">
                                                    <div className="flex justify-between items-start">
                                                        <CardTitle className="text-base font-medium flex items-center gap-2">
                                                            <div className="p-1.5 bg-primary/10 rounded-md">
                                                                <Building2 className="w-4 h-4 text-primary" />
                                                            </div>
                                                            {exp.organization_name}
                                                        </CardTitle>
                                                        <Badge variant="secondary" className="font-mono">
                                                            {exp.duration_years || 0} Yrs {exp.duration_months || 0} Mos
                                                        </Badge>
                                                    </div>
                                                    <CardDescription className="text-sm font-medium text-foreground/80 mt-1">
                                                        {exp.designation}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                                                        <div className="flex items-center gap-4 text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {exp.start_date}
                                                            </div>
                                                            <span className="text-xs">to</span>
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {exp.end_date || 'Present'}
                                                            </div>
                                                        </div>
                                                        {exp.responsibilities && (
                                                            <div className="md:col-span-2 mt-2 p-3 bg-muted/30 rounded-md text-sm text-foreground/80">
                                                                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Responsibilities</p>
                                                                {exp.responsibilities}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed border-border">
                                        <Briefcase className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3" />
                                        <p className="text-muted-foreground font-medium">No experience records added.</p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Documents Tab */}
                            <TabsContent value="documents" className="space-y-6 animate-in fade-in-50 duration-300">
                                {staff.documents?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {staff.documents.map((doc, index) => (
                                            <Card key={doc.id || index} className="hover:border-primary/50 transition-colors cursor-pointer group">
                                                <CardContent className="p-4 flex items-start gap-4">
                                                    <div className="p-3 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                                                        <FileText className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-medium text-sm">{doc.document_type}</h4>
                                                            {doc.is_verified ? (
                                                                <Badge variant="success" className="h-5 px-1.5 text-[10px]">VERIFIED</Badge>
                                                            ) : (
                                                                <Badge variant="warning" className="h-5 px-1.5 text-[10px]">PENDING</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">Uploaded on {new Date().toLocaleDateString()}</p>
                                                        <div className="pt-2 flex gap-2">
                                                            <Button size="sm" variant="outline" className="h-7 text-xs w-full">View</Button>
                                                            <Button size="sm" variant="outline" className="h-7 text-xs w-full">Download</Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed border-border">
                                        <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3" />
                                        <p className="text-muted-foreground font-medium">No documents uploaded.</p>
                                        <Button variant="outline" size="sm" className="mt-4">Upload Document</Button>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Placeholders for future features */}
                            <TabsContent value="attendance">
                                <Card className="border-dashed">
                                    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                                        <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                        <h3 className="text-lg font-medium">Attendance History</h3>
                                        <p className="text-muted-foreground max-w-sm mt-2">
                                            Detailed attendance logs and analytics will be available here soon.
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default StaffDetail;
