import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Plus,
    Pencil,
    Trash2,
    Users,
    Search,
    Filter,
    RefreshCw,
    MoreHorizontal,
    GraduationCap,
    School,
    BookOpen,
    AlertTriangle
} from 'lucide-react';
import { PageHeader } from '@/ui/composites';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/ui/primitives/dialog';
import { Skeleton } from '@/ui/primitives/skeleton';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    fetchClasses,
    deleteClass,
} from '../../store/slices/academicsSlice';

const ClassesList = () => {
    const dispatch = useDispatch();
    const { classes, loading, error } = useSelector((state) => state.academics);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [classToDelete, setClassToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchClasses());
    }, [dispatch]);

    const handleDeleteClick = (classItem) => {
        setClassToDelete(classItem);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (classToDelete) {
            try {
                await dispatch(deleteClass(classToDelete.id)).unwrap();
                setDeleteModalOpen(false);
                setClassToDelete(null);
                dispatch(fetchClasses());
            } catch (err) {
                console.error('Failed to delete class:', err);
            }
        }
    };

    const filteredClasses = classes?.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.board?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Classes"
                    description="Manage school classes and grade levels"
                    action={
                        <Link to="/academics/classes/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Class
                            </Button>
                        </Link>
                    }
                />

                <Card>
                    <CardHeader className="pb-3 border-b border-border">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search classes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Button variant="outline" size="sm">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => dispatch(fetchClasses())}>
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-medium">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Class Name</th>
                                        <th className="px-6 py-3 text-left">Board</th>
                                        <th className="px-6 py-3 text-left">Sections</th>
                                        <th className="px-6 py-3 text-left">Students</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={6} className="px-6 py-4">
                                                    <Skeleton className="h-6 w-full" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredClasses.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center">
                                                    <School className="w-12 h-12 mb-4 opacity-20" />
                                                    <p>No classes found matching your criteria</p>
                                                    <Link to="/academics/classes/new" className="mt-4">
                                                        <Button variant="outline">Create New Class</Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredClasses.map((classItem) => (
                                            <tr key={classItem.id} className="hover:bg-muted/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-primary/10 p-2 rounded-lg">
                                                            <GraduationCap className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-foreground">{classItem.name}</p>
                                                            <p className="text-xs text-muted-foreground">Grade {classItem.grade_level}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="font-mono">
                                                        {classItem.board?.name || 'N/A'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <BookOpen className="w-4 h-4" />
                                                        <span>{classItem.sections_count || 0} Sections</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Users className="w-4 h-4" />
                                                        <span>{classItem.students_count || 0} Students</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={classItem.is_active ? 'success' : 'secondary'}>
                                                        {classItem.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link to={`/academics/classes/${classItem.id}/edit`}>
                                                            <Button variant="ghost" size="icon">
                                                                <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                                            </Button>
                                                        </Link>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(classItem)}>
                                                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
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

                <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="w-5 h-5" />
                                Delete Class
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <span className="font-bold text-foreground">{classToDelete?.name}</span>?
                                <br />
                                This will also remove all associated sections. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedPage>
    );
};

export default ClassesList;
