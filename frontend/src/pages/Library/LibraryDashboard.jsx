import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from '../../store/slices/librarySlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Skeleton } from '@/ui/primitives/skeleton';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Book, AlertCircle, FileText } from 'lucide-react';

const LibraryDashboard = () => {
    const dispatch = useDispatch();
    const { books, error } = useSelector((state) => state.library);

    useEffect(() => {
        dispatch(fetchBooks());
    }, [dispatch]);

    // Handle loading state
    if (books?.loading) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-32" />
                    </div>
                    <Skeleton className="h-96" />
                </div>
            </AnimatedPage>
        );
    }

    // Handle error state
    if (error) {
        return (
            <AnimatedPage>
                <div className="p-6 text-destructive bg-destructive/5 border border-destructive/20 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <div>
                        <p className="font-bold">Error loading library data:</p>
                        <p>{typeof error === 'string' ? error : JSON.stringify(error)}</p>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    // Ensure data exists to prevent crashes
    const bookData = books?.data || [];

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Library Management"
                    description="Overview of library resources and availability"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="bg-primary/10 p-4 rounded-full mr-4">
                                <Book className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <p className="text-muted-foreground font-medium">Total Books</p>
                                <p className="text-3xl font-bold text-foreground">{bookData.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Book Catalog</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Author</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Available</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {bookData.length > 0 ? (
                                        bookData.map(book => (
                                            <tr key={book.id || Math.random()} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{book.title}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{book.author_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{book.category_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${book.available_copies > 0
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                            : 'bg-destructive/10 text-destructive'
                                                        }`}>
                                                        {book.available_copies} / {book.quantity}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-muted-foreground">
                                                <div className="flex flex-col items-center">
                                                    <FileText className="w-8 h-8 mb-2 opacity-50" />
                                                    <p>No books found in catalog.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AnimatedPage>
    );
};

export default LibraryDashboard;
