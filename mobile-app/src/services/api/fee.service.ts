import apiClient from './client';
import { FeeCategory, FeeStructure, StudentFee, Payment, Invoice } from '@/types/models';
import { PaginatedResponse, FeeQueryParams } from '@/types/api';

class FeeService {
  /**
   * Get fee categories
   */
  async getFeeCategories(): Promise<FeeCategory[]> {
    const response = await apiClient.get<PaginatedResponse<FeeCategory>>('/finance/fee-categories/');
    return response.results;
  }

  /**
   * Get fee structures
   */
  async getFeeStructures(params?: FeeQueryParams): Promise<PaginatedResponse<FeeStructure>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<FeeStructure>>(`/finance/fee-structures/${queryString}`);
  }

  /**
   * Create fee structure
   */
  async createFeeStructure(data: Partial<FeeStructure>): Promise<FeeStructure> {
    return apiClient.post<FeeStructure>('/finance/fee-structures/', data);
  }

  /**
   * Get student fees
   */
  async getStudentFees(params?: FeeQueryParams): Promise<PaginatedResponse<StudentFee>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<StudentFee>>(`/finance/student-fees/${queryString}`);
  }

  /**
   * Get student fee details
   */
  async getStudentFeeDetails(studentId: string, academicYearId?: string): Promise<StudentFee[]> {
    const queryString = academicYearId
      ? `?student=${studentId}&academic_year=${academicYearId}`
      : `?student=${studentId}`;
    const response = await apiClient.get<PaginatedResponse<StudentFee>>(`/finance/student-fees/${queryString}`);
    return response.results;
  }

  /**
   * Assign fee to student
   */
  async assignFee(data: Partial<StudentFee>): Promise<StudentFee> {
    return apiClient.post<StudentFee>('/finance/student-fees/', data);
  }

  /**
   * Get payments
   */
  async getPayments(params?: FeeQueryParams): Promise<PaginatedResponse<Payment>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<Payment>>(`/finance/payments/${queryString}`);
  }

  /**
   * Record payment
   */
  async recordPayment(data: Partial<Payment>): Promise<Payment> {
    return apiClient.post<Payment>('/finance/payments/', data);
  }

  /**
   * Get payment history for student
   */
  async getPaymentHistory(studentId: string, params?: FeeQueryParams): Promise<Payment[]> {
    const response = await this.getPayments({ ...params, student: studentId });
    return response.results;
  }

  /**
   * Get payment by ID (with allocations)
   */
  async getPayment(paymentId: string): Promise<Payment> {
    return apiClient.get<Payment>(`/finance/payments/${paymentId}/`);
  }

  /**
   * Download payment receipt
   */
  async downloadReceipt(paymentId: string): Promise<void> {
    return apiClient.downloadFile(
      `/finance/payments/${paymentId}/download_receipt/`,
      `receipt-${paymentId}.pdf`
    );
  }

  /**
   * Search payments by receipt or transaction ID
   */
  async searchPayments(search: string): Promise<PaginatedResponse<Payment>> {
    const queryString = apiClient.buildQueryString({ search });
    return apiClient.get<PaginatedResponse<Payment>>(`/finance/payments/${queryString}`);
  }

  /**
   * Get invoices
   */
  async getInvoices(params?: FeeQueryParams): Promise<PaginatedResponse<Invoice>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<Invoice>>(`/finance/invoices/${queryString}`);
  }

  /**
   * Get student invoices
   */
  async getStudentInvoices(studentId: string): Promise<Invoice[]> {
    const response = await apiClient.get<PaginatedResponse<Invoice>>(
      `/finance/invoices/?student=${studentId}`
    );
    return response.results;
  }

  /**
   * Download invoice
   */
  async downloadInvoice(invoiceId: string): Promise<any> {
    return apiClient.downloadFile(
      `/finance/invoices/${invoiceId}/download/`,
      `invoice-${invoiceId}.pdf`
    );
  }

  /**
   * Get fee summary for student
   */
  async getFeeSummary(studentId: string, academicYearId: string): Promise<{
    total_fees: number;
    paid_amount: number;
    pending_amount: number;
    overdue_amount: number;
  }> {
    const fees = await this.getStudentFeeDetails(studentId, academicYearId);

    const total_fees = fees.reduce((sum: number, fee: any) => sum + parseFloat(fee.amount), 0);
    const pending_amount = fees.reduce((sum: number, fee: any) => sum + parseFloat(fee.balance_amount), 0);
    const paid_amount = total_fees - pending_amount;

    const now = new Date();
    const overdue_amount = fees
      .filter((fee: any) => fee.status === 'OVERDUE' || (new Date(fee.due_date) < now && parseFloat(fee.balance_amount) > 0))
      .reduce((sum: number, fee: any) => sum + parseFloat(fee.balance_amount), 0);

    return {
      total_fees,
      paid_amount,
      pending_amount,
      overdue_amount,
    };
  }

  /**
   * Create Razorpay order
   */
  async createRazorpayOrder(data: {
    student_fee_ids: number[];
    amount: number;
  }): Promise<any> {
    return apiClient.post('/finance/payments/create_razorpay_order/', data);
  }

  /**
   * Verify Razorpay payment
   */
  async verifyRazorpayPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    student_fee_ids: number[];
    amount: number;
  }): Promise<any> {
    return apiClient.post('/finance/payments/verify_razorpay_payment/', data);
  }
}

export const feeService = new FeeService();
export default feeService;
