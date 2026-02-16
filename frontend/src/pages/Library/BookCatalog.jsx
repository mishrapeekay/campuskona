import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks, createBook, fetchAuthors, fetchCategories } from '../../store/slices/librarySlice';
import { Card, CardContent } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/ui/primitives/dialog';
import { Badge } from '@/ui/primitives/badge';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Plus, Search, Book, User as AuthorIcon, Tag, Loader2, XCircle, CheckCircle } from 'lucide-react';
import showToast from '../../utils/toast';

const BookCatalog = () => {
    const dispatch = useDispatch();
    const { books, authors, categories } = useSelector((state) => state.library);
    const { user } = useSelector((state) => state.auth);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [processing, setProcessing] = useState(false);

    const [bookForm, setBookForm] = useState({
        title: '',
        isbn: '',
        author: '',
        category: '',
        quantity: 1,
        location: ''
    });

    useEffect(() => {
        dispatch(fetchBooks());
        dispatch(fetchAuthors());
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleAddBook = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await dispatch(createBook(bookForm)).unwrap();
            setIsModalOpen(false);
            setBookForm({ title: '', isbn: '', author: '', category: '', quantity: 1, location: '' });
            showToast.success('Book added to catalog successfully!');
        } catch (error) {
            showToast.error('Failed to add book: ' + (error.message || 'Unknown error'));
        } finally {
            setProcessing(false);
        }
    };

    const filteredBooks = (books.data || []).filter(b => {
        const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.author_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? b.category === parseInt(selectedCategory) : true;
        return matchesSearch && matchesCategory;
    });

    const canEdit = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'LIBRARIAN'].includes(user?.user_type || user?.role);

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Book Catalog"
                    description="Manage library books and inventory"
                    action={
                        canEdit && (
                            <Button onClick={() => setIsModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Book
                            </Button>
                        )
                    }
                />

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search by title or author..."
                                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-64">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Categories</option>
                                    {(categories || []).map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Book Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category & Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {books.loading ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : filteredBooks.length > 0 ? (
                                        filteredBooks.map((book) => (
                                            <tr key={book.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                            <Book className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-foreground">{book.title}</div>
                                                            <div className="text-xs text-muted-foreground flex items-center mt-1">
                                                                <AuthorIcon className="h-3 w-3 mr-1" /> {book.author_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-foreground flex items-center">
                                                        <Tag className="h-3 w-3 mr-1 text-muted-foreground" /> {book.category_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">Shelf: {book.location || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-foreground">{book.available_copies} / {book.quantity}</div>
                                                    <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all duration-300"
                                                            style={{ width: `${(book.available_copies / book.quantity) * 100}%` }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Badge variant={book.available_copies > 0 ? 'success' : 'destructive'}>
                                                        {book.available_copies > 0 ? 'Available' : 'Out of Stock'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                                                No books found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Book Dialog */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Book</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddBook} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Book Title <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={bookForm.title}
                                    onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                                    required
                                    className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">ISBN</label>
                                <input
                                    type="text"
                                    value={bookForm.isbn}
                                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                                    className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Author <span className="text-destructive">*</span>
                                    </label>
                                    <select
                                        value={bookForm.author}
                                        onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                                        required
                                        className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="">Select Author</option>
                                        {(authors || []).map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Category <span className="text-destructive">*</span>
                                    </label>
                                    <select
                                        value={bookForm.category}
                                        onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                                        required
                                        className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="">Select Category</option>
                                        {(categories || []).map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Quantity <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={bookForm.quantity}
                                        onChange={(e) => setBookForm({ ...bookForm, quantity: e.target.value })}
                                        required
                                        min="1"
                                        className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Shelf Location
                                    </label>
                                    <input
                                        type="text"
                                        value={bookForm.location}
                                        onChange={(e) => setBookForm({ ...bookForm, location: e.target.value })}
                                        placeholder="e.g. Rack A-12"
                                        className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
                                    ) : (
                                        'Add to Catalog'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedPage>
    );
};

export default BookCatalog;
