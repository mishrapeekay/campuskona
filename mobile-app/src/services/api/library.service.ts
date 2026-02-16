import apiClient from './client';
import { Book, BookIssue, Category, Author } from '@/types/models';
import { PaginatedResponse, LibraryQueryParams } from '@/types/api';

class LibraryService {
  /**
   * Get books catalog
   */
  async getBooks(params?: LibraryQueryParams): Promise<PaginatedResponse<Book>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<Book>>(`/library/books/${queryString}`);
  }

  /**
   * Get book by ID
   */
  async getBook(id: string): Promise<Book> {
    return apiClient.get<Book>(`/library/books/${id}/`);
  }

  /**
   * Search books
   */
  async searchBooks(query: string): Promise<Book[]> {
    const response = await apiClient.get<PaginatedResponse<Book>>(`/library/books/?search=${query}`);
    return response.results;
  }

  /**
   * Add new book
   */
  async addBook(data: Partial<Book>): Promise<Book> {
    return apiClient.post<Book>('/library/books/', data);
  }

  /**
   * Update book
   */
  async updateBook(id: string, data: Partial<Book>): Promise<Book> {
    return apiClient.patch<Book>(`/library/books/${id}/`, data);
  }

  /**
   * Delete book
   */
  async deleteBook(id: string): Promise<void> {
    return apiClient.delete(`/library/books/${id}/`);
  }

  /**
   * Get book categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<PaginatedResponse<Category>>('/library/categories/');
    return response.results;
  }

  /**
   * Get authors
   */
  async getAuthors(): Promise<Author[]> {
    const response = await apiClient.get<PaginatedResponse<Author>>('/library/authors/');
    return response.results;
  }

  /**
   * Get book issues
   */
  async getBookIssues(params?: LibraryQueryParams): Promise<PaginatedResponse<BookIssue>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<BookIssue>>(`/library/issues/${queryString}`);
  }

  /**
   * Issue book to student/staff
   */
  async issueBook(data: Partial<BookIssue>): Promise<BookIssue> {
    return apiClient.post<BookIssue>('/library/issues/', data);
  }

  /**
   * Return book
   */
  async returnBook(issueId: string, fineAmount?: number): Promise<BookIssue> {
    return apiClient.patch<BookIssue>(`/library/issues/${issueId}/return/`, {
      return_date: new Date().toISOString().split('T')[0],
      status: 'RETURNED',
      fine_amount: fineAmount || 0,
    });
  }

  /**
   * Get issued books for user
   */
  async getMyIssuedBooks(userId: string, userType: 'student' | 'staff'): Promise<BookIssue[]> {
    const field = userType === 'student' ? 'student' : 'staff';
    const response = await apiClient.get<PaginatedResponse<BookIssue>>(
      `/library/issues/?${field}=${userId}&status=ISSUED`
    );
    return response.results;
  }

  /**
   * Get issued books for student (simplified for student app)
   */
  async getIssuedBooks(studentId: string): Promise<BookIssue[]> {
    const response = await apiClient.get<PaginatedResponse<BookIssue>>(
      `/library/issues/?student=${studentId}`
    );
    return response.results;
  }

  /**
   * Get overdue books
   */
  async getOverdueBooks(): Promise<BookIssue[]> {
    const response = await apiClient.get<PaginatedResponse<BookIssue>>(
      `/library/issues/?status=OVERDUE`
    );
    return response.results;
  }

  /**
   * Calculate fine for overdue book
   */
  calculateFine(dueDate: string, returnDate: string, finePerDay: number = 5): number {
    const due = new Date(dueDate);
    const returned = new Date(returnDate);
    const diffTime = returned.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays * finePerDay : 0;
  }

  /**
   * Get library statistics
   */
  async getLibraryStats(): Promise<{
    total_books: number;
    available_books: number;
    issued_books: number;
    overdue_books: number;
  }> {
    const booksResponse = await apiClient.get<PaginatedResponse<Book>>('/library/books/');
    const issuesResponse = await apiClient.get<PaginatedResponse<BookIssue>>('/library/issues/?status=ISSUED');
    const overdueResponse = await apiClient.get<PaginatedResponse<BookIssue>>('/library/issues/?status=OVERDUE');

    const total_books = booksResponse.results.reduce((sum, book) => sum + book.quantity, 0);
    const available_books = booksResponse.results.reduce((sum, book) => sum + book.available_copies, 0);

    return {
      total_books,
      available_books,
      issued_books: issuesResponse.count,
      overdue_books: overdueResponse.count,
    };
  }

  /**
   * Reserve book
   */
  async reserveBook(bookId: string, userId: string, userType: 'student' | 'staff'): Promise<any> {
    return apiClient.post('/library/reservations/', {
      book: bookId,
      [userType]: userId,
    });
  }
}

export const libraryService = new LibraryService();
export default libraryService;
