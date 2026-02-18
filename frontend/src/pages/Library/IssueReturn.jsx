import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchIssues, fetchBooks, issueBookThunk, returnBookThunk, markFinePaidThunk
} from '../../store/slices/librarySlice';
import { fetchStudents } from '../../store/slices/studentsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/ui/primitives/dialog';
import { Input } from '@/ui/primitives/input';
import { Badge } from '@/ui/primitives/badge';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    BookOpen, RotateCcw, Calendar, AlertCircle, CheckCircle2,
    Loader2, Search, Plus, IndianRupee, Clock, ChevronDown
} from 'lucide-react';
import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '@/ui/primitives/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/primitives/tabs';
import { Avatar, AvatarFallback } from '@/ui/primitives/avatar';
import showToast, { getErrorMessage } from '../../utils/toast';

const FINE_PER_DAY = 10; // ₹10/day — matches Django setting LIBRARY_FINE_PER_DAY

function daysOverdue(dueDateStr) {
    const due = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - due) / 86400000);
    return diff > 0 ? diff : 0;
}

function fineForIssue(issue) {
    if (issue.status === 'RETURNED') return parseFloat(issue.fine_amount) || 0;
    const days = daysOverdue(issue.due_date);
    return days * FINE_PER_DAY;
}

function StatusBadge({ status }) {
    const map = {
        ISSUED: 'bg-blue-100 text-blue-700',
        OVERDUE: 'bg-red-100 text-red-700',
        RETURNED: 'bg-green-100 text-green-700',
        LOST: 'bg-gray-100 text-gray-600',
    };
    return (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
}

const IssueReturn = () => {
    const dispatch = useDispatch();
    const { issues: issuesObj, books: booksObj } = useSelector((state) => state.library);
    const issues = issuesObj?.data ?? [];
    const books = booksObj?.data ?? [];
    const libraryLoading = issuesObj?.loading || booksObj?.loading;
    const { list: studentsList } = useSelector((state) => state.students);

    const [activeTab, setActiveTab] = useState('active');
    const [issueDialogOpen, setIssueDialogOpen] = useState(false);
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [returnResult, setReturnResult] = useState(null); // { fine_amount, message }
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedBook, setSelectedBook] = useState('');

    useEffect(() => {
        dispatch(fetchIssues());
        dispatch(fetchBooks());
        dispatch(fetchStudents());
    }, [dispatch]);

    // ── Derived lists ──────────────────────────────────────────────
    const activeIssues = issues.filter(i =>
        ['ISSUED', 'OVERDUE'].includes(i.status) &&
        (!searchTerm ||
            i.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.student_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const issuesWithFines = issues.filter(i =>
        parseFloat(i.fine_amount) > 0 &&
        (!searchTerm ||
            i.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.student_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const overdueIssues = issues.filter(i => i.status === 'OVERDUE' || daysOverdue(i.due_date) > 0 && i.status !== 'RETURNED');

    const availableBooks = books.filter(b => b.available_copies > 0);

    const totalFinesPending = issuesWithFines
        .filter(i => parseFloat(i.fine_amount) > 0)
        .reduce((sum, i) => sum + parseFloat(i.fine_amount), 0);

    // ── Handlers ───────────────────────────────────────────────────
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

    const openReturnDialog = (issue) => {
        setSelectedIssue(issue);
        setReturnResult(null);
        setReturnDialogOpen(true);
    };

    const handleReturnBook = async () => {
        if (!selectedIssue) return;
        setIsSubmitting(true);
        try {
            const result = await dispatch(returnBookThunk(selectedIssue.id)).unwrap();
            // result = { success, data, message, fine_amount }
            const fine = result?.fine_amount ?? 0;
            setReturnResult({ fine_amount: fine, message: result?.message || 'Returned' });
            if (fine > 0) {
                showToast(`Book returned. Fine due: ₹${fine}`, 'warning');
            } else {
                showToast('Book returned successfully', 'success');
            }
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeReturnDialog = () => {
        setReturnDialogOpen(false);
        setSelectedIssue(null);
        setReturnResult(null);
        // Refresh to get latest fine_amount
        dispatch(fetchIssues());
    };

    const handleMarkFinePaid = async (issueId) => {
        setIsSubmitting(true);
        try {
            await dispatch(markFinePaidThunk(issueId)).unwrap();
            showToast('Fine marked as collected', 'success');
            dispatch(fetchIssues());
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────
    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Circulation Desk"
                    description="Issue and return books, manage overdue fines."
                    action={
                        <Button onClick={() => setIssueDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Issue New Book
                        </Button>
                    }
                />

                {/* ── Stats ── */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Active Issues</p>
                                    <p className="text-2xl font-bold">{activeIssues.length}</p>
                                </div>
                                <BookOpen className="h-8 w-8 text-blue-400 opacity-70" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Overdue</p>
                                    <p className="text-2xl font-bold text-red-600">{overdueIssues.length}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-red-400 opacity-70" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Today's Returns</p>
                                    <p className="text-2xl font-bold">
                                        {issues.filter(i =>
                                            i.status === 'RETURNED' &&
                                            new Date(i.return_date).toDateString() === new Date().toDateString()
                                        ).length}
                                    </p>
                                </div>
                                <RotateCcw className="h-8 w-8 text-green-400 opacity-70" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Fines Pending</p>
                                    <p className="text-2xl font-bold text-orange-600">₹{totalFinesPending.toLocaleString()}</p>
                                </div>
                                <IndianRupee className="h-8 w-8 text-orange-400 opacity-70" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Main Tabs ── */}
                <Card>
                    <CardHeader className="pb-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList>
                                    <TabsTrigger value="active">
                                        Active Loans
                                        {activeIssues.length > 0 && (
                                            <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1.5">{activeIssues.length}</Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="fines">
                                        Manage Fines
                                        {issuesWithFines.length > 0 && (
                                            <Badge variant="destructive" className="ml-1.5 text-[10px] h-4 px-1.5">{issuesWithFines.length}</Badge>
                                        )}
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <div className="relative w-full sm:w-60">
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
                    <CardContent className="pt-4">
                        {/* Active Loans tab */}
                        {activeTab === 'active' && (
                            libraryLoading ? (
                                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" /> Loading...
                                </div>
                            ) : activeIssues.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/5">
                                    <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground text-sm">No active loans found.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeIssues.map(issue => {
                                        const overdueDays = daysOverdue(issue.due_date);
                                        const estimatedFine = overdueDays * FINE_PER_DAY;
                                        return (
                                            <div key={issue.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors
                                                ${overdueDays > 0 ? 'border-red-200 bg-red-50/30' : 'hover:bg-muted/30'}`}>
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <Avatar className="h-9 w-9 flex-shrink-0">
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs uppercase">
                                                            {issue.student_name?.slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-sm truncate">{issue.book_title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Issued to <span className="font-medium text-foreground">{issue.student_name}</span>
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                            <StatusBadge status={overdueDays > 0 ? 'OVERDUE' : issue.status} />
                                                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                                                <Calendar className="w-3 h-3" />
                                                                Due: {new Date(issue.due_date).toLocaleDateString('en-IN')}
                                                            </span>
                                                            {overdueDays > 0 && (
                                                                <span className="text-[10px] text-red-600 font-medium flex items-center gap-0.5">
                                                                    <Clock className="w-3 h-3" />
                                                                    {overdueDays}d overdue · Fine: ₹{estimatedFine}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant={overdueDays > 0 ? 'destructive' : 'outline'}
                                                    size="sm"
                                                    className="flex-shrink-0 ml-3"
                                                    onClick={() => openReturnDialog(issue)}
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                                    Return
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        )}

                        {/* Manage Fines tab */}
                        {activeTab === 'fines' && (
                            issuesWithFines.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/5">
                                    <IndianRupee className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground text-sm">No outstanding fines.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {issuesWithFines.map(issue => (
                                        <div key={issue.id} className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50/30 rounded-lg">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <Avatar className="h-9 w-9 flex-shrink-0">
                                                    <AvatarFallback className="bg-orange-100 text-orange-700 text-xs uppercase">
                                                        {issue.student_name?.slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm truncate">{issue.book_title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        <span className="font-medium text-foreground">{issue.student_name}</span>
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <StatusBadge status={issue.status} />
                                                        {issue.return_date && (
                                                            <span className="text-[10px] text-muted-foreground">
                                                                Returned: {new Date(issue.return_date).toLocaleDateString('en-IN')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-orange-700">₹{parseFloat(issue.fine_amount).toLocaleString()}</p>
                                                    <p className="text-[10px] text-muted-foreground">Fine due</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-green-400 text-green-700 hover:bg-green-50"
                                                    onClick={() => handleMarkFinePaid(issue.id)}
                                                    disabled={isSubmitting}
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                                    Mark Paid
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </CardContent>
                </Card>

                {/* ── Issue Book Dialog ── */}
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
                                        <SelectValue placeholder="Choose student..." />
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
                                        <SelectValue placeholder="Choose available book..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableBooks.map(book => (
                                            <SelectItem key={book.id} value={book.id.toString()}>
                                                {book.title} — {book.available_copies} cop{book.available_copies === 1 ? 'y' : 'ies'} left
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <p className="text-xs text-muted-foreground">Default loan period: 14 days.</p>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleIssueBook} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                    Confirm Issue
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ── Return Book Dialog ── */}
                <Dialog open={returnDialogOpen} onOpenChange={(open) => { if (!open) closeReturnDialog(); }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{returnResult ? 'Return Complete' : 'Confirm Return'}</DialogTitle>
                        </DialogHeader>
                        {selectedIssue && !returnResult && (
                            <div className="space-y-4 py-4">
                                <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Book</span>
                                        <span className="font-medium">{selectedIssue.book_title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Student</span>
                                        <span className="font-medium">{selectedIssue.student_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Due Date</span>
                                        <span className={`font-medium ${daysOverdue(selectedIssue.due_date) > 0 ? 'text-red-600' : ''}`}>
                                            {new Date(selectedIssue.due_date).toLocaleDateString('en-IN')}
                                        </span>
                                    </div>
                                    {daysOverdue(selectedIssue.due_date) > 0 && (
                                        <div className="flex justify-between border-t pt-2 mt-2">
                                            <span className="text-muted-foreground">Days Overdue</span>
                                            <span className="font-medium text-red-600">{daysOverdue(selectedIssue.due_date)} days</span>
                                        </div>
                                    )}
                                </div>

                                {daysOverdue(selectedIssue.due_date) > 0 && (
                                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg flex items-start gap-2 text-sm">
                                        <IndianRupee className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-orange-800">
                                                Fine Applicable: ₹{daysOverdue(selectedIssue.due_date) * FINE_PER_DAY}
                                            </p>
                                            <p className="text-xs text-orange-700">
                                                ₹{FINE_PER_DAY}/day × {daysOverdue(selectedIssue.due_date)} days. Collect before confirming.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={closeReturnDialog}>Cancel</Button>
                                    <Button onClick={handleReturnBook} disabled={isSubmitting}>
                                        {isSubmitting
                                            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            : <RotateCcw className="w-4 h-4 mr-2" />}
                                        Confirm Return
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Post-return result */}
                        {returnResult && (
                            <div className="space-y-4 py-4">
                                <div className={`p-4 rounded-lg border ${returnResult.fine_amount > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {returnResult.fine_amount > 0
                                            ? <AlertCircle className="w-5 h-5 text-orange-600" />
                                            : <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                        <p className={`font-semibold ${returnResult.fine_amount > 0 ? 'text-orange-800' : 'text-green-800'}`}>
                                            {returnResult.fine_amount > 0 ? 'Book Returned — Fine Due' : 'Book Returned Successfully'}
                                        </p>
                                    </div>
                                    {returnResult.fine_amount > 0 ? (
                                        <>
                                            <p className="text-2xl font-black text-orange-700">₹{returnResult.fine_amount}</p>
                                            <p className="text-sm text-orange-700 mt-1">
                                                Collect this fine from the student. Then go to <strong>Manage Fines</strong> tab and mark it paid.
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-green-700">No fine applicable. Return on time!</p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2">
                                    {returnResult.fine_amount > 0 && (
                                        <Button
                                            variant="outline"
                                            className="border-orange-300 text-orange-700"
                                            onClick={() => { closeReturnDialog(); setActiveTab('fines'); }}
                                        >
                                            <IndianRupee className="w-4 h-4 mr-1.5" />
                                            Go to Manage Fines
                                        </Button>
                                    )}
                                    <Button onClick={closeReturnDialog}>Done</Button>
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
