import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as financeAPI from '../../api/finance';

// Async thunks
export const fetchFeeCategories = createAsyncThunk(
    'finance/fetchFeeCategories',
    async (params, { rejectWithValue }) => {
        try {
            const response = await financeAPI.getFeeCategories(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch fee categories');
        }
    }
);

export const createFeeCategory = createAsyncThunk(
    'finance/createFeeCategory',
    async (data, { rejectWithValue }) => {
        try {
            const response = await financeAPI.createFeeCategory(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create fee category');
        }
    }
);

export const fetchFeeStructures = createAsyncThunk(
    'finance/fetchFeeStructures',
    async (params, { rejectWithValue }) => {
        try {
            const response = await financeAPI.getFeeStructures(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch fee structures');
        }
    }
);

export const createFeeStructure = createAsyncThunk(
    'finance/createFeeStructure',
    async (data, { rejectWithValue }) => {
        try {
            const response = await financeAPI.createFeeStructure(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create fee structure');
        }
    }
);

export const fetchStudentFees = createAsyncThunk(
    'finance/fetchStudentFees',
    async (params, { rejectWithValue }) => {
        try {
            const response = await financeAPI.getStudentFees(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch student fees');
        }
    }
);

export const fetchMyFees = createAsyncThunk(
    'finance/fetchMyFees',
    async (_, { rejectWithValue }) => {
        try {
            const response = await financeAPI.getMyFees();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch my fees');
        }
    }
);

export const fetchPayments = createAsyncThunk(
    'finance/fetchPayments',
    async (params, { rejectWithValue }) => {
        try {
            const response = await financeAPI.getPayments(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch payments');
        }
    }
);

export const fetchMyPayments = createAsyncThunk(
    'finance/fetchMyPayments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await financeAPI.getMyPayments();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch my payments');
        }
    }
);

export const collectFee = createAsyncThunk(
    'finance/collectFee',
    async (data, { rejectWithValue }) => {
        try {
            const response = await financeAPI.collectFee(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to collect fee');
        }
    }
);

export const fetchExpenses = createAsyncThunk(
    'finance/fetchExpenses',
    async (params, { rejectWithValue }) => {
        try {
            const response = await financeAPI.getExpenses(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch expenses');
        }
    }
);

export const createExpense = createAsyncThunk(
    'finance/createExpense',
    async (data, { rejectWithValue }) => {
        try {
            const response = await financeAPI.createExpense(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create expense');
        }
    }
);

export const approveExpense = createAsyncThunk(
    'finance/approveExpense',
    async (id, { rejectWithValue }) => {
        try {
            const response = await financeAPI.approveExpense(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to approve expense');
        }
    }
);

export const fetchFinancialSummary = createAsyncThunk(
    'finance/fetchFinancialSummary',
    async (params, { rejectWithValue }) => {
        try {
            const response = await financeAPI.getFinancialSummary(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch financial summary');
        }
    }
);

export const fetchInvoices = createAsyncThunk(
    'finance/fetchInvoices',
    async (params, { rejectWithValue }) => {
        try {
            const response = await financeAPI.getInvoices(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch invoices');
        }
    }
);

export const generateInvoice = createAsyncThunk(
    'finance/generateInvoice',
    async (data, { rejectWithValue }) => {
        try {
            const response = await financeAPI.generateInvoice(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to generate invoice');
        }
    }
);

// Initial state
const initialState = {
    feeCategories: {
        data: [],
        loading: false,
        error: null,
    },
    feeStructures: {
        data: [],
        loading: false,
        error: null,
    },
    studentFees: {
        data: [],
        pagination: null,
        loading: false,
        error: null,
    },
    payments: {
        data: [],
        pagination: null,
        loading: false,
        error: null,
    },
    expenses: {
        data: [],
        pagination: null,
        loading: false,
        error: null,
    },
    invoices: {
        data: [],
        pagination: null,
        loading: false,
        error: null,
    },
    financialSummary: {
        data: null,
        loading: false,
        error: null,
    },
    filters: {
        studentId: null,
        status: null,
        academicYearId: null,
    },
};

// Slice
const financeSlice = createSlice({
    name: 'finance',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
        clearError: (state, action) => {
            const section = action.payload;
            if (state[section]) {
                state[section].error = null;
            }
        },
    },
    extraReducers: (builder) => {
        // Fee Categories
        builder
            .addCase(fetchFeeCategories.pending, (state) => {
                state.feeCategories.loading = true;
                state.feeCategories.error = null;
            })
            .addCase(fetchFeeCategories.fulfilled, (state, action) => {
                state.feeCategories.loading = false;
                state.feeCategories.data = action.payload.results || action.payload;
            })
            .addCase(fetchFeeCategories.rejected, (state, action) => {
                state.feeCategories.loading = false;
                state.feeCategories.error = action.payload;
            })
            .addCase(createFeeCategory.fulfilled, (state, action) => {
                state.feeCategories.data.push(action.payload);
            });

        // Fee Structures
        builder
            .addCase(fetchFeeStructures.pending, (state) => {
                state.feeStructures.loading = true;
                state.feeStructures.error = null;
            })
            .addCase(fetchFeeStructures.fulfilled, (state, action) => {
                state.feeStructures.loading = false;
                state.feeStructures.data = action.payload.results || action.payload;
            })
            .addCase(fetchFeeStructures.rejected, (state, action) => {
                state.feeStructures.loading = false;
                state.feeStructures.error = action.payload;
            })
            .addCase(createFeeStructure.fulfilled, (state, action) => {
                state.feeStructures.data.push(action.payload);
            });

        // Student Fees
        builder
            .addCase(fetchStudentFees.pending, (state) => {
                state.studentFees.loading = true;
                state.studentFees.error = null;
            })
            .addCase(fetchStudentFees.fulfilled, (state, action) => {
                state.studentFees.loading = false;
                state.studentFees.data = action.payload.results || action.payload;
                state.studentFees.pagination = action.payload.count ? {
                    count: action.payload.count,
                    next: action.payload.next,
                    previous: action.payload.previous,
                } : null;
            })
            .addCase(fetchStudentFees.rejected, (state, action) => {
                state.studentFees.loading = false;
                state.studentFees.error = action.payload;
            })
            .addCase(fetchMyFees.pending, (state) => {
                state.studentFees.loading = true;
                state.studentFees.error = null;
            })
            .addCase(fetchMyFees.fulfilled, (state, action) => {
                state.studentFees.loading = false;
                state.studentFees.data = action.payload.results || action.payload;
            })
            .addCase(fetchMyFees.rejected, (state, action) => {
                state.studentFees.loading = false;
                state.studentFees.error = action.payload;
            });

        // Payments
        builder
            .addCase(fetchPayments.pending, (state) => {
                state.payments.loading = true;
                state.payments.error = null;
            })
            .addCase(fetchPayments.fulfilled, (state, action) => {
                state.payments.loading = false;
                state.payments.data = action.payload.results || action.payload;
                state.payments.pagination = action.payload.count ? {
                    count: action.payload.count,
                    next: action.payload.next,
                    previous: action.payload.previous,
                } : null;
            })
            .addCase(fetchPayments.rejected, (state, action) => {
                state.payments.loading = false;
                state.payments.error = action.payload;
            })
            .addCase(fetchMyPayments.pending, (state) => {
                state.payments.loading = true;
                state.payments.error = null;
            })
            .addCase(fetchMyPayments.fulfilled, (state, action) => {
                state.payments.loading = false;
                state.payments.data = action.payload.results || action.payload;
            })
            .addCase(fetchMyPayments.rejected, (state, action) => {
                state.payments.loading = false;
                state.payments.error = action.payload;
            });

        // Collect Fee
        builder
            .addCase(collectFee.pending, (state) => {
                state.payments.loading = true;
                state.payments.error = null;
            })
            .addCase(collectFee.fulfilled, (state, action) => {
                state.payments.loading = false;
                state.payments.data.unshift(action.payload.payment);
            })
            .addCase(collectFee.rejected, (state, action) => {
                state.payments.loading = false;
                state.payments.error = action.payload;
            });

        // Expenses
        builder
            .addCase(fetchExpenses.pending, (state) => {
                state.expenses.loading = true;
                state.expenses.error = null;
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.expenses.loading = false;
                state.expenses.data = action.payload.results || action.payload;
                state.expenses.pagination = action.payload.count ? {
                    count: action.payload.count,
                    next: action.payload.next,
                    previous: action.payload.previous,
                } : null;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.expenses.loading = false;
                state.expenses.error = action.payload;
            });

        // Create Expense
        builder
            .addCase(createExpense.fulfilled, (state, action) => {
                state.expenses.data.unshift(action.payload);
            });

        // Approve Expense
        builder
            .addCase(approveExpense.fulfilled, (state, action) => {
                const index = state.expenses.data.findIndex(e => e.id === action.payload.expense.id);
                if (index !== -1) {
                    state.expenses.data[index] = action.payload.expense;
                }
            });

        // Financial Summary
        builder
            .addCase(fetchFinancialSummary.pending, (state) => {
                state.financialSummary.loading = true;
                state.financialSummary.error = null;
            })
            .addCase(fetchFinancialSummary.fulfilled, (state, action) => {
                state.financialSummary.loading = false;
                state.financialSummary.data = action.payload;
            })
            .addCase(fetchFinancialSummary.rejected, (state, action) => {
                state.financialSummary.loading = false;
                state.financialSummary.error = action.payload;
            });

        // Invoices
        builder
            .addCase(fetchInvoices.pending, (state) => {
                state.invoices.loading = true;
                state.invoices.error = null;
            })
            .addCase(fetchInvoices.fulfilled, (state, action) => {
                state.invoices.loading = false;
                state.invoices.data = action.payload.results || action.payload;
                state.invoices.pagination = action.payload.count ? {
                    count: action.payload.count,
                    next: action.payload.next,
                    previous: action.payload.previous,
                } : null;
            })
            .addCase(fetchInvoices.rejected, (state, action) => {
                state.invoices.loading = false;
                state.invoices.error = action.payload;
            });

        // Generate Invoice
        builder
            .addCase(generateInvoice.fulfilled, (state, action) => {
                state.invoices.data.unshift(action.payload.invoice);
            });
    },
});

export const { setFilters, clearFilters, clearError } = financeSlice.actions;
export default financeSlice.reducer;
