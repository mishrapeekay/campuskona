import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    BookOpenIcon,
    ArrowPathIcon,
    ExclamationCircleIcon,
    CurrencyRupeeIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    ClockIcon,
    UserIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';
import { StatsCard } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { getDashboardStats, getIssues, getBooks } from '../../api/library';

const LibraryDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [overdueBooks, setOverdueBooks] = useState([]);
    const [booksDueToday, setBooksDueToday] = useState([]);
    const [quickSearchQuery, setQuickSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch dashboard stats
                const statsResponse = await getDashboardStats();
                setStats(statsResponse.data);

                // Fetch recent transactions
                try {
                    const transactionsResponse = await getIssues({ limit: 10, ordering: '-created_at' });
                    setRecentTransactions(transactionsResponse.data?.results || transactionsResponse.data || []);
                } catch (e) {
                    console.error('Failed to fetch transactions:', e);
                }

                // Fetch overdue books
                try {
                    const overdueResponse = await getIssues({ status: 'OVERDUE', limit: 10 });
                    setOverdueBooks(overdueResponse.data?.results || overdueResponse.data || []);
                } catch (e) {
                    console.error('Failed to fetch overdue books:', e);
                }

            } catch (error) {
                console.error("Failed to fetch library stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Mock data for books due today
    useEffect(() => {
        setBooksDueToday([
            { id: 1, book_title: 'Introduction to Physics', student_name: 'John Doe', student_class: '10-A', contact: '9876543210' },
            { id: 2, book_title: 'Advanced Mathematics', student_name: 'Jane Smith', student_class: '10-B', contact: '9876543211' },
            { id: 3, book_title: 'English Literature', student_name: 'Mike Johnson', student_class: '9-A', contact: '9876543212' },
        ]);
    }, []);

    const handleQuickSearch = (e) => {
        e.preventDefault();
        if (quickSearchQuery.trim()) {
            navigate(`/library/catalog?search=${encodeURIComponent(quickSearchQuery)}`);
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <StatsCard key={i} loading />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Skeleton className="h-80 rounded-xl" />
                    <Skeleton className="h-80 rounded-xl" />
                    <Skeleton className="h-80 rounded-xl" />
                </div>
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    const statsData = stats || {
        total_books: 0,
        issued_books: 0,
        overdue_books: 0,
        total_fines: 0,
        available_books: 0
    };

    const cards = [
        {
            name: 'Total Books',
            value: statsData.total_books?.toString() || '0',
            icon: BookOpenIcon,
            color: 'blue',
            changeType: 'neutral',
            onClick: () => navigate('/library/catalog')
        },
        {
            name: 'Books Issued',
            value: statsData.issued_books?.toString() || '0',
            icon: ArrowPathIcon,
            color: 'green',
            changeType: 'neutral',
            onClick: () => navigate('/library/issue-return?tab=issued')
        },
        {
            name: 'Overdue Books',
            value: statsData.overdue_books?.toString() || '0',
            icon: ExclamationCircleIcon,
            color: 'red',
            changeType: statsData.overdue_books > 0 ? 'down' : 'neutral',
            onClick: () => navigate('/library/issue-return?tab=overdue')
        },
        {
            name: 'Fines Collected',
            value: `₹${statsData.total_fines || 0}`,
            icon: CurrencyRupeeIcon,
            color: 'yellow',
            changeType: 'up',
            onClick: () => navigate('/library/fines')
        }
    ];

    return (
        <AnimatedPage>
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Library Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Overview of library operations
                        </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                        <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card) => (
                        <StatsCard
                            key={card.name}
                            title={card.name}
                            value={card.value}
                            icon={<card.icon className="h-6 w-6" />}
                            trend={card.changeType === 'up' ? 'up' : card.changeType === 'down' ? 'down' : 'neutral'}
                            onClick={card.onClick}
                        />
                    ))}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Quick Issue/Return */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Quick Search */}
                            <form onSubmit={handleQuickSearch} className="mb-4">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={quickSearchQuery}
                                        onChange={(e) => setQuickSearchQuery(e.target.value)}
                                        placeholder="Search by ISBN, Title, or Student ID..."
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                                    />
                                </div>
                            </form>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Button
                                    onClick={() => navigate('/library/issue-return?action=issue')}
                                    className="w-full justify-center bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Issue Book
                                </Button>
                                <Button
                                    onClick={() => navigate('/library/issue-return?action=return')}
                                    variant="default"
                                    className="w-full justify-center"
                                >
                                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                                    Return Book
                                </Button>
                                <Button
                                    onClick={() => navigate('/library/catalog/new')}
                                    variant="outline"
                                    className="w-full justify-center"
                                >
                                    <BookOpenIcon className="h-5 w-5 mr-2" />
                                    Add New Book
                                </Button>
                            </div>

                            {/* Quick Stats */}
                            <div className="mt-4 pt-4 border-t">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="bg-primary/10 rounded-xl p-3">
                                        <p className="text-2xl font-bold text-primary">{statsData.available_books || statsData.total_books - statsData.issued_books || 0}</p>
                                        <p className="text-xs text-muted-foreground">Available</p>
                                    </div>
                                    <div className="bg-yellow-100 dark:bg-yellow-950/30 rounded-xl p-3">
                                        <p className="text-2xl font-bold text-yellow-600">{booksDueToday.length}</p>
                                        <p className="text-xs text-muted-foreground">Due Today</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Books Due Today */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Books Due Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {booksDueToday.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CheckCircleIcon className="h-12 w-12 mx-auto mb-2 text-green-300" />
                                    <p>No books due today!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {booksDueToday.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-xl"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{item.book_title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.student_name} ({item.student_class})
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={() => navigate('/library/issue-return?action=return')}
                                                >
                                                    Return
                                                </Button>
                                            </div>
                                            <div className="mt-2 flex items-center text-xs text-muted-foreground">
                                                <UserIcon className="h-3 w-3 mr-1" />
                                                {item.contact}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {booksDueToday.length > 0 && (
                                <button
                                    onClick={() => navigate('/library/issue-return?filter=due_today')}
                                    className="mt-4 text-sm text-primary hover:underline"
                                >
                                    View all ({booksDueToday.length})
                                </button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Overdue Books Alert */}
                    <Card className={overdueBooks.length > 0 ? 'border-l-4 border-l-red-500' : ''}>
                        <CardHeader>
                            <CardTitle>Overdue Books</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {overdueBooks.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CheckCircleIcon className="h-12 w-12 mx-auto mb-2 text-green-300" />
                                    <p>No overdue books!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {overdueBooks.slice(0, 5).map((item) => {
                                        const daysOverdue = Math.floor((new Date() - new Date(item.due_date)) / (1000 * 60 * 60 * 24));
                                        const fineAmount = daysOverdue * 10; // ₹10 per day

                                        return (
                                            <div
                                                key={item.id}
                                                className={`p-3 rounded-xl border ${
                                                    daysOverdue > 7 ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900' : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {item.book?.title || item.book_title || 'Book Title'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.student?.name || item.student_name || 'Student'}
                                                        </p>
                                                    </div>
                                                    <Badge variant={daysOverdue > 7 ? 'destructive' : 'warning'}>
                                                        {daysOverdue} days
                                                    </Badge>
                                                </div>
                                                <div className="mt-2 flex justify-between items-center">
                                                    <span className="text-xs text-red-600 font-medium">
                                                        Fine: ₹{fineAmount}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs text-red-700 hover:text-red-800"
                                                    >
                                                        Send Reminder
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {overdueBooks.length > 5 && (
                                <button
                                    onClick={() => navigate('/library/issue-return?tab=overdue')}
                                    className="mt-4 text-sm text-red-600 hover:underline"
                                >
                                    View all ({overdueBooks.length} overdue)
                                </button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentTransactions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <ClockIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
                                <p>No recent transactions.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                                            <th className="pb-3 pr-4">Book</th>
                                            <th className="pb-3 pr-4">Student</th>
                                            <th className="pb-3 pr-4">Type</th>
                                            <th className="pb-3 pr-4">Date</th>
                                            <th className="pb-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {recentTransactions.slice(0, 10).map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="py-3 pr-4">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {transaction.book?.title || transaction.book_title || 'Book'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        ISBN: {transaction.book?.isbn || transaction.isbn || 'N/A'}
                                                    </p>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <p className="text-sm text-foreground">
                                                        {transaction.student?.name || transaction.student_name || 'Student'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {transaction.student?.class_name || transaction.class_name || ''}
                                                    </p>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <Badge variant={transaction.status === 'RETURNED' ? 'success' : 'info'}>
                                                        {transaction.status === 'RETURNED' ? 'Return' : 'Issue'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 pr-4 text-sm text-muted-foreground">
                                                    {new Date(transaction.created_at || transaction.issue_date).toLocaleDateString()}
                                                </td>
                                                <td className="py-3">
                                                    <Badge
                                                        variant={
                                                            transaction.status === 'RETURNED' ? 'success' :
                                                            transaction.status === 'OVERDUE' ? 'destructive' :
                                                            'warning'
                                                        }
                                                    >
                                                        {transaction.status || 'ISSUED'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                            <button
                                onClick={() => navigate('/library/issue-return')}
                                className="text-sm text-primary hover:underline"
                            >
                                View all transactions
                            </button>
                            <button
                                onClick={() => navigate('/library/reports')}
                                className="text-sm text-muted-foreground hover:underline"
                            >
                                Generate Report
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                        onClick={() => navigate('/library/issue-return')}
                        className="bg-card p-4 rounded-xl border hover:shadow-md hover:border-green-300 transition-all cursor-pointer flex flex-col items-center text-center"
                    >
                        <div className="p-3 bg-green-100 dark:bg-green-950/30 rounded-xl mb-2">
                            <ArrowPathIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm">Issue/Return</h3>
                        <p className="text-xs text-muted-foreground">Manage books</p>
                    </div>

                    <div
                        onClick={() => navigate('/library/catalog')}
                        className="bg-card p-4 rounded-xl border hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col items-center text-center"
                    >
                        <div className="p-3 bg-primary/10 rounded-xl mb-2">
                            <BookOpenIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm">Book Catalog</h3>
                        <p className="text-xs text-muted-foreground">Browse all books</p>
                    </div>

                    <div
                        onClick={() => navigate('/library/catalog/new')}
                        className="bg-card p-4 rounded-xl border hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex flex-col items-center text-center"
                    >
                        <div className="p-3 bg-purple-100 dark:bg-purple-950/30 rounded-xl mb-2">
                            <PlusIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm">Add Book</h3>
                        <p className="text-xs text-muted-foreground">New entry</p>
                    </div>

                    <div
                        onClick={() => navigate('/library/reports')}
                        className="bg-card p-4 rounded-xl border hover:shadow-md hover:border-yellow-300 transition-all cursor-pointer flex flex-col items-center text-center"
                    >
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-950/30 rounded-xl mb-2">
                            <CurrencyRupeeIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm">Reports</h3>
                        <p className="text-xs text-muted-foreground">Analytics</p>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default LibraryDashboard;
