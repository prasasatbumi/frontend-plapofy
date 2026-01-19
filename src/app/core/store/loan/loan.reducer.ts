import { createReducer, on } from '@ngrx/store';
import { LoanActions } from './loan.actions';
import { AuthActions } from '../auth/auth.actions';
import { Loan } from '../../services/loan.service';

export interface LoanState {
    loans: Loan[];
    loading: boolean;
    error: string | null;
    selectedLoan: Loan | null;
    filters: {
        branchId: number | null;
        searchQuery: string;
        statusTab: string;
    };
    actionLoading: boolean; // For button loading states
}

export const initialState: LoanState = {
    loans: [],
    loading: false,
    error: null,
    selectedLoan: null,
    filters: {
        branchId: null,
        searchQuery: '',
        statusTab: 'ALL'
    },
    actionLoading: false
};

export const loanReducer = createReducer(
    initialState,

    // Load
    on(LoanActions.loadLoans, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(LoanActions.loadLoansSuccess, (state, { loans }) => ({
        ...state,
        loading: false,
        loans
    })),
    on(LoanActions.loadLoansFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Filters
    on(LoanActions.setBranchFilter, (state, { branchId }) => ({
        ...state,
        filters: { ...state.filters, branchId }
        // Note: Effect will trigger reload if branch changes
    })),
    on(LoanActions.setSearchQuery, (state, { query }) => ({
        ...state,
        filters: { ...state.filters, searchQuery: query }
    })),
    on(LoanActions.setStatusTab, (state, { tab }) => ({
        ...state,
        filters: { ...state.filters, statusTab: tab }
    })),

    // Selection
    on(LoanActions.selectLoan, (state, { loan }) => ({
        ...state,
        selectedLoan: loan
    })),
    on(LoanActions.clearSelection, (state) => ({
        ...state,
        selectedLoan: null
    })),

    // Actions (Review, Approve, Disburse, Reject)
    on(LoanActions.reviewLoan, LoanActions.approveLoan, LoanActions.disburseLoan, LoanActions.rejectLoan, (state) => ({
        ...state,
        actionLoading: true,
        error: null
    })),
    on(
        LoanActions.reviewLoanSuccess,
        LoanActions.approveLoanSuccess,
        LoanActions.disburseLoanSuccess,
        LoanActions.rejectLoanSuccess,
        (state) => ({
            ...state,
            actionLoading: false
        })),
    on(
        LoanActions.reviewLoanFailure,
        LoanActions.approveLoanFailure,
        LoanActions.disburseLoanFailure,
        LoanActions.rejectLoanFailure,
        (state, { error }) => ({
            ...state,
            actionLoading: false,
            error
        })),

    // Clear state on Logout
    on(AuthActions.logout, () => initialState)
);
