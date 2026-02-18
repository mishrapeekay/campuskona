import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues, fetchBooks, issueBookThunk, returnBookThunk } from '../../store/slices/librarySlice';
import { fetchStudents } from '../../store/slices/studentsSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/ui/primitives/dialog';
import { Input } from '@/ui/primitives/input';
import { Badge } from '@/ui/primitives/badge';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    BookOpen,
    RotateCcw,
    User,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Search,
    QrCode,
    Plus
} from 'lucide-react';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/ui/primitives/select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/ui/primitives/tabs';
import { Avatar, AvatarFallback } from '@/ui/primitives/avatar';
import showToast, { getErrorMessage } from '../../utils/toast';

const IssueReturn = () => {
    const dispatch = useDispatch();
    const { issues: issuesObj, books: booksObj } = useSelector((state) => state.library);
    const issues = issuesObj?.data ?? [];
    const books = booksObj?.data ?? [];
    const libraryLoading = issuesObj?.loading || booksObj?.loading;
    const { list: studentsList, loading: studentsLoading } = useSelector((state) => state.students);

    // UI State
    const [activeTab, setActiveTab] = useState('issue');
    const [issueDialogOpen, setIssueDialogOpen] = useState(false);
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedBook, setSelectedBook] = useState('');
    const [selectedIssue, setSelectedIssue] = useState(null);

    useEffect(() => {
        dispatch(fetchIssues());
        dispatch(fetchBooks());
        dispatch(fetchStudents());
    }, [dispatch]);

    // Handlers
    const handleIssueBook = async () => {
        if (!selectedStudent || !selectedBook) {
            showToast('Please select both a student and a book', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            await dispatch(issueBookThunk({ studentId: selectedStudent, bookId: selectedBook })).unwrap();
            showToast('Book issued successfully', 'success');
            setIssueDialogOpen(false);
            setSelectedStudent('');
            setSelectedBook('');
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReturnBook = async () => {
        if (!selectedIssue) return;

        setIsSubmitting(true);
        try {
            await dispatch(returnBookThunk(selectedIssue.id)).unwrap();
            showToast('Book returned successfully', 'success');
            setReturnDialogOpen(false);
            setSelectedIssue(null);
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filtered Lists
    const activeIssues = issues.filter(i =>
        i.status === 'ISSUED' &&
        (i.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.student_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const availableBooks = books.filter(b => b.available_copies > 0);

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Circulation Desk"
                    description="Issue and return books, manage fines, and track overdue items."
                    action={
                        <Button onClick={() => setIssueDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Issue New Book
                        </Button>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats Cards */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeIssues.length}</div>
                            <p className="text-xs text-muted-foreground">Books currently with students</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">
                                {activeIssues.filter(i => new Date(i.due_date) < new Date()).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Require immediate attention</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Returns</CardTitle>
                            <RotateCcw className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {issues.filter(i =>
                                    i.status === 'RETURNED' &&
                                    new Date(i.return_date).toDateString() === new Date().toDateString()
                                ).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Processed successfully</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Active Loans</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search student or book..."
                                    className="pl-8 h-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {activeIssues.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/5">
                                <div className="p-3 bg-muted rounded-full mb-3">
                                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground text-sm">No active loans found matching your search.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activeIssues.map(issue => {
                                    const isOverdue = new Date(issue.due_date) < new Date();
                                    return (
                                        <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <Avatar>
                                                    <AvatarFallback className="bg-primary/10 text-primary uppercase">
                                                        {issue.student_name?.slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-semibold text-sm">{issue.book_title}</h4>
                                                    <p className="text-xs text-muted-foreground">Issued to <span className="font-medium text-foreground">{issue.student_name}</span></p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant={isOverdue ? "destructive" : "secondary"} className="text-[10px] h-5">
                                                            {isOverdue ? 'Overdue' : 'On Time'}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" /> Due: {new Date(issue.due_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => { setSelectedIssue(issue); setReturnDialogOpen(true); }}
                                            >
                                                <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                                Return
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Issue Book Dialog */}
                <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Issue New Book</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Student</label>
                                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Search student..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {studentsList.map(student => (
                                            <SelectItem key={student.id} value={student.id.toString()}>
                                                {student.first_name} {student.last_name} ({student.admission_number})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Book</label>
                                <Select value={selectedBook} onValueChange={setSelectedBook}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Search book..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableBooks.map(book => (
                                            <SelectItem key={book.id} value={book.id.toString()}>
                                                {book.title} (Copies: {book.available_copies})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleIssueBook} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                    Confirm Issue
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Return Book Dialog */}
                <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Return</DialogTitle>
                        </DialogHeader>
                        {selectedIssue && (
                            <div className="space-y-4 py-4">
                                <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Book:</span>
                                        <span className="font-medium">{selectedIssue.book_title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Student:</span>
                                        <span className="font-medium">{selectedIssue.student_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Due Date:</span>
                                        <span className={`font-medium ${new Date(selectedIssue.due_date) < new Date() ? 'text-destructive' : ''}`}>
                                            {new Date(selectedIssue.due_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {new Date(selectedIssue.due_date) < new Date() && (
                                    <div className="bg-destructive/10 p-3 rounded-lg flex items-start gap-2 text-sm text-destructive">
                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-semibold">Overdue Fine Applicable</p>
                                            <p className="text-xs opacity-90">Please collect the fine amount before confirming return.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2 flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleReturnBook} disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                                        Is Returned
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedPage>
    );
};

export default IssueReturn;
