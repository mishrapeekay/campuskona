import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
    fetchStudentById,
    selectCurrentStudent,
    selectStudentLoading,
} from '../../store/slices/studentsSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    Pencil,
    Printer,
    AlertTriangle,
    RefreshCw,
    User,
    MapPin,
    Activity,
    GraduationCap,
    School,
    FileText,
    HeartPulse,
    StickyNote,
    Users,
    Mail,
    Phone,
    Calendar,
    ArrowLeft
} from 'lucide-react';
import GuardianManager from '../../components/Students/GuardianManager';
import DocumentManager from '../../components/Students/DocumentManager';
import HealthRecordsManager from '../../components/Students/HealthRecordsManager';
import NotesManager from '../../components/Students/NotesManager';
import { printPage } from '../../utils/export';

/**
 * Student Detail Page - View complete student information
 */
const StudentDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const student = useSelector(selectCurrentStudent);
    const loading = useSelector(selectStudentLoading);

    const [activeTab, setActiveTab] = useState('personal');

    useEffect(() => {
        if (id) {
            dispatch(fetchStudentById(id));
        }
    }, [dispatch, id]);

    if (loading) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <Skeleton className="h-12 w-full max-w-2xl" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-64" />
                        <Skeleton className="h-64" />
                        <Skeleton className="h-64" />
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    if (!student && !loading) {
        return (
            <AnimatedPage>
                <div className="flex flex-col items-center justify-center py-24 min-h-[60vh]">
                    <Card className="max-w-md w-full border-destructive/20 bg-destructive/5">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10">
                                <AlertTriangle className="h-8 w-8 text-destructive" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Student Not Found</h2>
                                <p className="text-muted-foreground mt-2">
                                    Could not retrieve student details. The student might have been deleted or doesn't exist.
                                </p>
                            </div>
                            <div className="flex gap-3 justify-center pt-2">
                                <Button variant="outline" onClick={() => navigate('/students')}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to List
                                </Button>
                                <Button onClick={() => dispatch(fetchStudentById(id))}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Retry
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AnimatedPage>
        );
    }

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'academic', label: 'Academic Details', icon: GraduationCap },
        { id: 'guardians', label: 'Guardians', icon: Users, count: student.guardians?.length || 0 },
        { id: 'documents', label: 'Documents', icon: FileText, count: student.documents?.length || 0 },
        { id: 'health', label: 'Health Records', icon: HeartPulse },
        { id: 'notes', label: 'Notes', icon: StickyNote, count: student.notes?.length || 0 },
    ];

    const getStatusVariant = (status) => {
        const variants = {
            active: 'success',
            inactive: 'destructive',
            graduated: 'info',
            transferred: 'warning',
        };
        return variants[status] || 'secondary';
    };

    return (
        <AnimatedPage>
            <div className="space-y-6 pb-12">
                <PageHeader
                    title={student.full_name}
                    description={`Admission No: ${student.admission_number}`}
                    breadcrumbs={[
                        { label: 'Students', href: '/students' },
                        { label: student.full_name }
                    ]}
                    action={
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/students/${id}/edit`)}
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Student
                            </Button>
                            <Button variant="outline" onClick={printPage} className="no-print hidden sm:flex">
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                        </div>
                    }
                />

                {/* Tabs Navigation */}
                <div className="border-b border-border">
                    <nav className="-mb-px flex gap-4 overflow-x-auto pb-2 scrollbar-none" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        group inline-flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-all
                                        ${activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                                        }
                                    `}
                                >
                                    <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                    {tab.label}
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className={`
                                            ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium
                                            ${activeTab === tab.id
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-muted text-muted-foreground'
                                            }
                                        `}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <AnimatedPage key={activeTab}>
                    {/* Personal Information Tab */}
                    {activeTab === 'personal' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Profile Card */}
                            <Card className="lg:col-span-1">
                                <CardContent className="pt-6 flex flex-col items-center">
                                    <div className="w-32 h-32 rounded-full border-4 border-background shadow-lg overflow-hidden bg-muted mb-4 relative">
                                        {student.photo ? (
                                            <img
                                                src={student.photo}
                                                alt={student.full_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                                <User className="w-16 h-16" />
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-foreground text-center">{student.full_name}</h2>
                                    <p className="text-sm text-muted-foreground mb-3">{student.email || 'No email provided'}</p>
                                    <Badge variant={getStatusVariant(student.admission_status)} className="px-4 py-1 text-sm rounded-full">
                                        {student.admission_status}
                                    </Badge>

                                    <div className="w-full mt-6 space-y-4 pt-6 border-t border-border">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-foreground">{student.phone_number || student.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-foreground">{student.email || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span>
                                                Born: {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}
                                                <span className="text-muted-foreground ml-1">({student.age} yrs)</span>
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Details Column */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="w-5 h-5 text-primary" />
                                            Basic Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoItem label="First Name" value={student.first_name} />
                                            <InfoItem label="Middle Name" value={student.middle_name} />
                                            <InfoItem label="Last Name" value={student.last_name} />
                                            <InfoItem label="Gender" value={student.gender} />
                                            <InfoItem label="Blood Group" value={student.blood_group} />
                                            <InfoItem label="Aadhar Number" value={student.aadhar_number} />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-primary" />
                                            Address Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <InfoItem label="Address" value={[student.current_address_line1, student.current_address_line2].filter(Boolean).join(', ')} />
                                            </div>
                                            <InfoItem label="City" value={student.current_city} />
                                            <InfoItem label="State" value={student.current_state} />
                                            <InfoItem label="PIN Code" value={student.current_pincode} />
                                            <InfoItem label="Country" value="India" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-primary" />
                                            Medical Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoItem label="Medical Conditions" value={student.medical_conditions} />
                                            <InfoItem label="Allergies" value={student.allergies} />
                                            <InfoItem label="Emergency Contact" value={student.emergency_contact_name} />
                                            <InfoItem label="Emergency Phone" value={student.emergency_contact_number || student.emergency_contact_phone} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Academic Details Tab */}
                    {activeTab === 'academic' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Current Academic Details</CardTitle>
                                    <CardDescription>Information regarding current class and enrollment</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-6">
                                            <InfoItem label="Admission Number" value={student.admission_number} />
                                            <InfoItem label="Admission Date" value={student.admission_date ? new Date(student.admission_date).toLocaleDateString() : '-'} />
                                            <InfoItem label="Academic Year" value={student.academic_year} />
                                        </div>
                                        <div className="space-y-6">
                                            <InfoItem label="Class" value={student.class_name} highlight />
                                            <InfoItem label="Section" value={student.section_name} highlight />
                                            <InfoItem label="Roll Number" value={student.roll_number} highlight />
                                        </div>
                                        <div className="space-y-6">
                                            <InfoItem label="Board" value={student.board} />
                                            <InfoItem label="House" value={student.house} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {student.previous_school_name && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <School className="w-5 h-5 text-primary" />
                                            Previous School History
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoItem label="School Name" value={student.previous_school_name} />
                                            <InfoItem label="Board" value={student.previous_school_board} />
                                            <InfoItem label="TC Number" value={student.transfer_certificate_number} />
                                            <InfoItem label="Last Class Attended" value={student.previous_class} />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Guardians Tab */}
                    {activeTab === 'guardians' && (
                        <GuardianManager studentId={id} />
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <DocumentManager studentId={id} />
                    )}

                    {/* Health Records Tab */}
                    {activeTab === 'health' && (
                        <HealthRecordsManager studentId={id} />
                    )}

                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                        <NotesManager studentId={id} />
                    )}
                </AnimatedPage>
            </div>
        </AnimatedPage>
    );
};

// Helper component for displaying information
const InfoItem = ({ label, value, highlight }) => (
    <div className={highlight ? "bg-muted/50 p-3 rounded-lg border border-border" : ""}>
        <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</dt>
        <dd className={`mt-1 text-sm font-medium ${highlight ? 'text-primary' : 'text-foreground'}`}>
            {value || <span className="text-muted-foreground/50 italic">Not set</span>}
        </dd>
    </div>
);

export default StudentDetail;
