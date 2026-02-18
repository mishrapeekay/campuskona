import client from './client';

const BASE_URL = '/finance';

// Fee Categories
export const getFeeCategories = (params) => {
    return client.get(`${BASE_URL}/fee-categories/`, { params });
};

export const getActiveFeeCategories = () => {
    return client.get(`${BASE_URL}/fee-categories/active/`);
};

export const createFeeCategory = (data) => {
    return client.post(`${BASE_URL}/fee-categories/`, data);
};

// Fee Structures
export const getFeeStructures = (params) => {
    return client.get(`${BASE_URL}/fee-structures/`, { params });
};

export const createFeeStructure = (data) => {
    return client.post(`${BASE_URL}/fee-structures/`, data);
};

// Student Fees
export const getStudentFees = (params) => {
    return client.get(`${BASE_URL}/student-fees/`, { params });
};

export const getStudentFeeById = (id) => {
    return client.get(`${BASE_URL}/student-fees/${id}/`);
};

export const createStudentFee = (data) => {
    return client.post(`${BASE_URL}/student-fees/`, data);
};

export const updateStudentFee = (id, data) => {
    return client.put(`${BASE_URL}/student-fees/${id}/`, data);
};

export const getStudentFeesByStudent = (studentId) => {
    return client.get(`${BASE_URL}/student-fees/by_student/`, {
        params: { student_id: studentId }
    });
};

export const getMyFees = () => {
    return client.get(`${BASE_URL}/student-fees/my_fees/`);
};

export const getPendingFees = () => {
    return client.get(`${BASE_URL}/student-fees/pending/`);
};

// Payments
export const getPayments = (params) => {
    return client.get(`${BASE_URL}/payments/`, { params });
};

export const getPaymentById = (id) => {
    return client.get(`${BASE_URL}/payments/${id}/`);
};

export const createPayment = (data) => {
    return client.post(`${BASE_URL}/payments/`, data);
};

export const collectFee = (data) => {
    return client.post(`${BASE_URL}/payments/collect_fee/`, data);
};

export const downloadReceipt = (paymentId) => {
    return client.get(`${BASE_URL}/payments/${paymentId}/download_receipt/`, {
        responseType: 'blob'
    });
};

export const getMyPayments = () => {
    return client.get(`${BASE_URL}/payments/my_payments/`);
};

// Expenses
export const getExpenses = (params) => {
    return client.get(`${BASE_URL}/expenses/`, { params });
};

export const getExpenseById = (id) => {
    return client.get(`${BASE_URL}/expenses/${id}/`);
};

export const createExpense = (data) => {
    return client.post(`${BASE_URL}/expenses/`, data);
};

export const updateExpense = (id, data) => {
    return client.put(`${BASE_URL}/expenses/${id}/`, data);
};

export const deleteExpense = (id) => {
    return client.delete(`${BASE_URL}/expenses/${id}/`);
};

export const approveExpense = (id) => {
    return client.post(`${BASE_URL}/expenses/${id}/approve/`);
};

export const rejectExpense = (id) => {
    return client.post(`${BASE_URL}/expenses/${id}/reject/`);
};

export const getExpenseSummary = (params) => {
    return client.get(`${BASE_URL}/expenses/summary/`, { params });
};

// Invoices
export const getInvoices = (params) => {
    return client.get(`${BASE_URL}/invoices/`, { params });
};

export const getInvoiceById = (id) => {
    return client.get(`${BASE_URL}/invoices/${id}/`);
};

export const createInvoice = (data) => {
    return client.post(`${BASE_URL}/invoices/`, data);
};

export const generateInvoice = (data) => {
    return client.post(`${BASE_URL}/invoices/generate/`, data);
};

export const getFinancialSummary = (params) => {
    return client.get(`${BASE_URL}/invoices/financial_summary/`, { params });
};

// Razorpay Payment Gateway
export const createRazorpayOrder = (studentFeeId) => {
    return client.post(`${BASE_URL}/payments/create-order/`, { student_fee_id: studentFeeId });
};

export const verifyRazorpayPayment = (data) => {
    return client.post(`${BASE_URL}/payments/verify/`, data);
};
