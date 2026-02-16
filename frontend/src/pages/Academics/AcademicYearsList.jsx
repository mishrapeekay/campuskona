import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Plus,
    Pencil,
    Trash2,
    CheckCircle,
    Calendar,
    Clock,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { PageHeader } from '@/ui/composites';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Card, CardContent } from '@/ui/primitives/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/ui/primitives/dialog';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    fetchAcademicYears,
    deleteAcademicYear,
    setCurrentAcademicYear,
} from '../../store/slices/academicsSlice';
import showToast, { getErrorMessage } from '../../utils/toast';

const AcademicYearsList = () => {
    const dispatch = useDispatch();
    const { academicYears, loading, error } = useSelector((state) => state.academics);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, year: null });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchAcademicYears());
    }, [dispatch]);

    const handleSetCurrent = async (yearId) => {
        setActionLoading(true);
        try {
            await dispatch(setCurrentAcademicYear(yearId)).unwrap();
            dispatch(fetchAcademicYears());
            showToast.success('Current academic year updated successfully');
        } catch (err) {
            console.error('Failed to set current year:', err);
            showToast.error('Failed to update current year: ' + getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.year) return;
        setActionLoading(true);
        try {
            await dispatch(deleteAcademicYear(deleteModal.year.id)).unwrap();
            setDeleteModal({ isOpen: false, year: null });
            dispatch(fetchAcademicYears());
            showToast.success('Academic year deleted successfully');
        } catch (err) {
            console.error('Failed to delete academic year:', err);
            showToast.error('Failed to delete academic year: ' + getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Academic Years"
                    description="Manage school academic sessions and calendars"
                    breadcrumbs={[
                        { label: 'Academics', href: '/academics' },
                        { label: 'Years', active: true },
                    ]}
                    action={
                        <Link to="/academics/years/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Year
                            </Button>
                        </Link>
                    }
                />

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-medium">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Academic Year</th>
                                        <th className="px-6 py-3 text-left">Start Date</th>
                                        <th className="px-6 py-3 text-left">End Date</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading && !academicYears.length ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                    <p>Loading academic years...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : academicYears.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Calendar className="w-12 h-12 mb-4 opacity-20" />
                                                    <p>No academic years found.</p>
                                                    <Link to="/academics/years/new" className="mt-4">
                                                        <Button variant="outline">Create First Year</Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        academicYears.map((year) => (
                                            <tr key={year.id} className={`hover:bg-muted/30 transition-colors ${year.is_current ? 'bg-primary/5' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-foreground flex items-center gap-2">
                                                            {year.name}
                                                            {year.is_current && (
                                                                <Badge variant="success" className="h-5 px-1.5 text-[10px]">CURRENT</Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">{year.code}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(year.start_date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(year.end_date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={year.is_active ? 'secondary' : 'outline'}>
                                                        {year.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {!year.is_current && year.is_active && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-primary hover:text-primary hover:bg-primary/10"
                                                                onClick={() => handleSetCurrent(year.id)}
                                                                disabled={actionLoading}
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Make Current
                                                            </Button>
                                                        )}
                                                        <Link to={`/academics/years/${year.id}/edit`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => setDeleteModal({ isOpen: true, year })}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Delete Confirmation Modal */}
                <Dialog open={deleteModal.isOpen} onOpenChange={(open) => !open && setDeleteModal({ isOpen: false, year: null })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Academic Year</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <span className="font-semibold text-foreground">{deleteModal.year?.name}</span>?
                                <br />
                                This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteModal({ isOpen: false, year: null })}
                                disabled={actionLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedPage>
    );
};

export default AcademicYearsList;
