import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues } from '../../store/slices/librarySlice';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Skeleton } from '@/ui/primitives/skeleton';
import {
    BookOpen,
    AlertCircle,
    CheckCircle2,
    Search,
    Clock,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/ui/primitives/tabs';

const MyLibrary = () => {
    const dispatch = useDispatch();
    const { data: issues, loading } = useSelector((state) => state.library.issues);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchIssues());
    }, [dispatch]);

    // Mock data for catalog (replace with real fetch later)
    const catalogBooks = [
        { id: 101, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', available: true },
        { id: 102, title: 'Introduction to Physics', author: 'Resnick & Halliday', category: 'Science', available: false },
        { id: 103, title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', available: true },
        { id: 104, title: 'Brief History of Time', author: 'Stephen Hawking', category: 'Science', available: true },
    ];

    if (loading) {
        return (
            <div className="space-y-6 p-6 max-w-7xl mx-auto">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    const currentIssues = issues.filter(i => i.status === 'ISSUED');
    const returnedIssues = issues.filter(i => i.status === 'RETURNED');

    // Simple mock search
    const filteredCatalog = catalogBooks.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <AnimatedPage>
            <div className="space-y-8 p-6 max-w-7xl mx-auto pb-20">
                <PageHeader
                    title="My Library"
                    description="Manage your borrowed books, track due dates, and explore the catalog."
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Library', active: true },
                    ]}
                />

                <Tabs defaultValue="current" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="current">Current Issues</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                        <TabsTrigger value="catalog">Book Catalog</TabsTrigger>
                    </TabsList>

                    <TabsContent value="current" className="space-y-6">
                        {currentIssues.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/10">
                                <div className="bg-muted p-4 rounded-full mb-4">
                                    <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">No Books Issued</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                                    You don't have any books currently checked out. Visit the library to borrow one!
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentIssues.map((issue) => {
                                    const isOverdue = new Date(issue.due_date) < new Date();
                                    return (
                                        <Card key={issue.id} className={`overflow-hidden border-l-4 ${isOverdue ? 'border-l-destructive' : 'border-l-primary'}`}>
                                            <CardHeader className="pb-3 bg-muted/20">
                                                <div className="flex justify-between items-start">
                                                    <Badge variant={isOverdue ? 'destructive' : 'secondary'} className="mb-2">
                                                        {isOverdue ? 'Overdue' : 'Borrowed'}
                                                    </Badge>
                                                    {issue.fine_amount > 0 && (
                                                        <Badge variant="destructive" className="ml-auto">
                                                            Fine: ₹{parseFloat(issue.fine_amount).toFixed(2)}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardTitle className="text-lg line-clamp-2 leading-tight">
                                                    {issue.book_details?.title || issue.book_title || 'Unknown Book'}
                                                </CardTitle>
                                                <CardDescription className="line-clamp-1">
                                                    by {issue.book_details?.author_name || 'Unknown Author'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-4 space-y-3 text-sm">
                                                <div className="flex justify-between items-center py-1 border-b border-dashed">
                                                    <span className="text-muted-foreground flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5" /> Issued
                                                    </span>
                                                    <span className="font-medium">{formatDate(issue.issue_date)}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-1">
                                                    <span className="text-muted-foreground flex items-center gap-2">
                                                        <Clock className="h-3.5 w-3.5" /> Due Date
                                                    </span>
                                                    <span className={`font-semibold ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                                                        {formatDate(issue.due_date)}
                                                    </span>
                                                </div>

                                                {isOverdue && (
                                                    <div className="bg-destructive/10 text-destructive p-2 rounded-md text-xs mt-2 flex items-start gap-2">
                                                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                                        <p>Please return this book immediately to avoid further fines.</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="space-y-6">
                        {returnedIssues.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground italic">No reading history found.</p>
                        ) : (
                            <div className="divide-y divide-border border rounded-lg bg-card">
                                {returnedIssues.map((issue) => (
                                    <div key={issue.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full dark:bg-emerald-900/20">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{issue.book_details?.title || issue.book_title}</p>
                                                <p className="text-xs text-muted-foreground">Returned on {formatDate(issue.return_date)}</p>
                                            </div>
                                        </div>
                                        {issue.fine_paid > 0 && (
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                                Paid Fine: ₹{issue.fine_paid}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="catalog" className="space-y-6">
                        <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by title, author, or category..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button>Search</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredCatalog.map(book => (
                                <Card key={book.id} className="flex flex-col h-full hover:shadow-md transition-all">
                                    <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center border-b">
                                        <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                                    </div>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start mb-1">
                                            <Badge variant="outline" className="text-[10px]">{book.category}</Badge>
                                            <Badge variant={book.available ? 'success' : 'secondary'} className="text-[10px]">
                                                {book.available ? 'Available' : 'Issued'}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-base line-clamp-1" title={book.title}>{book.title}</CardTitle>
                                        <CardDescription className="text-xs line-clamp-1">{book.author}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="mt-auto pt-2">
                                        <Button variant="outline" size="sm" className="w-full" disabled={!book.available}>
                                            {book.available ? 'Reserve Book' : 'Notify Me'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AnimatedPage>
    );
};

export default MyLibrary;
