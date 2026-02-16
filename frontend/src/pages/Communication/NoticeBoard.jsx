import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchNotices,
    createNotice,
    deleteNotice
} from '../../store/slices/communicationSlice';
import { fetchClasses } from '../../store/slices/academicsSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/ui/primitives/dialog';
import { Label } from '@/ui/primitives/label';
import { Input } from '@/ui/primitives/input';
import { Textarea } from '@/ui/primitives/textarea';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/ui/primitives/select';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    Plus,
    Bell,
    Calendar,
    Trash2,
    FileText,
    Users,
    Paperclip,
    Loader2,
    Info,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import showToast from '../../utils/toast';

const NoticeBoard = () => {
    const dispatch = useDispatch();
    const { notices } = useSelector((state) => state.communication);
    const { classes } = useSelector((state) => state.academics);
    const { user } = useSelector((state) => state.auth);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [noticeToDelete, setNoticeToDelete] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        target_audience: 'ALL',
        specific_classes: [],
        priority: 'MEDIUM',
        attachment: null
    });

    useEffect(() => {
        dispatch(fetchNotices());
        if (canCreateNotice) {
            dispatch(fetchClasses());
        }
    }, [dispatch]);

    const canCreateNotice = ['ADMIN', 'TEACHER', 'SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(user?.role);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'attachment') {
            setFormData(prev => ({ ...prev, attachment: files[0] }));
        } else if (name === 'specific_classes') {
            const options = e.target.selectedOptions;
            const values = [];
            for (let i = 0; i < options.length; i++) {
                values.push(options[i].value);
            }
            setFormData(prev => ({ ...prev, specific_classes: values }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await dispatch(createNotice(formData)).unwrap();
            setIsCreateModalOpen(false);
            setFormData({
                title: '',
                content: '',
                target_audience: 'ALL',
                specific_classes: [],
                priority: 'MEDIUM',
                attachment: null
            });
            showToast.success('Notice posted successfully!');
            dispatch(fetchNotices()); // Refresh list
        } catch (error) {
            showToast.error('Failed to post notice: ' + (error.message || 'Unknown error'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (notice) => {
        setNoticeToDelete(notice);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (noticeToDelete) {
            try {
                await dispatch(deleteNotice(noticeToDelete.id)).unwrap();
                showToast.success('Notice deleted successfully!');
                setIsDeleteModalOpen(false);
                setNoticeToDelete(null);
                dispatch(fetchNotices());
            } catch (error) {
                showToast.error('Failed to delete notice');
            }
        }
    };

    const getPriorityVariant = (priority) => {
        const variants = {
            'URGENT': 'destructive',
            'HIGH': 'warning',
            'LOW': 'secondary',
            'MEDIUM': 'outline'
        };
        return variants[priority] || 'outline';
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Notice Board"
                    description="Latest school announcements and circulars"
                    action={
                        canCreateNotice && (
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Post Notice
                            </Button>
                        )
                    }
                />

                <div className="grid gap-6">
                    {notices.loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Loading notices...</p>
                        </div>
                    ) : notices.data && notices.data.length > 0 ? (
                        notices.data.map((notice) => (
                            <Card key={notice.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-lg font-semibold text-foreground tracking-tight">{notice.title}</h3>
                                                <Badge variant={getPriorityVariant(notice.priority)} className="uppercase text-[10px]">
                                                    {notice.priority}
                                                </Badge>
                                                {notice.is_new && (
                                                    <Badge className="bg-blue-500 hover:bg-blue-600">NEW</Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                                                    <Users className="w-3 h-3" />
                                                    {notice.target_audience === 'ALL' ? 'Everyone' :
                                                        notice.target_audience === 'TEACHERS' ? 'Staff Only' :
                                                            notice.target_audience === 'PARENTS' ? 'Parents Only' :
                                                                'Students'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(notice.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Bell className="w-3 h-3" />
                                                    Posted by {notice.posted_by_name || 'Admin'}
                                                </span>
                                            </div>

                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed mt-2">
                                                {notice.content}
                                            </p>

                                            {notice.attachment && (
                                                <div className="flex items-center gap-2 mt-4 text-sm text-primary">
                                                    <Paperclip className="w-4 h-4" />
                                                    <a href={notice.attachment} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
                                                        View Attachment
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {canCreateNotice && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(notice)}
                                                className="text-muted-foreground hover:text-destructive shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="bg-primary/10 p-4 rounded-full mb-4">
                                    <Bell className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No Notices Yet</h3>
                                <p className="text-muted-foreground max-w-sm mb-6">
                                    There are currently no notices posted. Important announcements and circulars will appear here.
                                </p>
                                {canCreateNotice && (
                                    <Button onClick={() => setIsCreateModalOpen(true)}>
                                        Post First Notice
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Create Notice Modal */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Post New Notice</DialogTitle>
                            <DialogDescription>
                                Create a new announcement for students, teachers, or parents.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Annual Sports Day Announcement"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="target_audience">Target Audience</Label>
                                    <select
                                        id="target_audience"
                                        name="target_audience"
                                        value={formData.target_audience}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="ALL">Everyone</option>
                                        <option value="STUDENTS">Students</option>
                                        <option value="TEACHERS">Teachers</option>
                                        <option value="PARENTS">Parents</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <select
                                        id="priority"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            {formData.target_audience === 'STUDENTS' && (
                                <div className="space-y-2">
                                    <Label htmlFor="specific_classes">Specific Classes (Optional)</Label>
                                    <select
                                        id="specific_classes"
                                        name="specific_classes"
                                        multiple
                                        value={formData.specific_classes}
                                        onChange={handleInputChange}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {classes?.map(cls => (
                                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-[0.8rem] text-muted-foreground">Hold Ctrl/Cmd to select multiple</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    placeholder="Write the details of your announcement here..."
                                    rows={5}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="attachment">Attachment (Optional)</Label>
                                <Input
                                    id="attachment"
                                    name="attachment"
                                    type="file"
                                    onChange={handleInputChange}
                                    className="cursor-pointer"
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        'Post Notice'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="w-5 h-5" />
                                Delete Notice
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <span className="font-semibold text-foreground">"{noticeToDelete?.title}"</span>?
                                <br />
                                This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedPage>
    );
};

export default NoticeBoard;
