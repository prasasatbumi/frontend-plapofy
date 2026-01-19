import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LoanState } from './loan.reducer';

export const selectLoanState = createFeatureSelector<LoanState>('loans');

export const selectAllLoans = createSelector(
    selectLoanState,
    (state) => state.loans
);

export const selectLoanLoading = createSelector(
    selectLoanState,
    (state) => state.loading
);

export const selectActionLoading = createSelector(
    selectLoanState,
    (state) => state.actionLoading
);

export const selectLoanError = createSelector(
    selectLoanState,
    (state) => state.error
);

export const selectSelectedLoan = createSelector(
    selectLoanState,
    (state) => state.selectedLoan
);

export const selectLoanFilters = createSelector(
    selectLoanState,
    (state) => state.filters
);

export const selectFilteredLoans = createSelector(
    selectAllLoans,
    selectLoanFilters,
    (loans, filters) => {
        let filtered = loans;
        const query = filters.searchQuery.toLowerCase().trim();
        const tab = filters.statusTab;

        // 1. Filter by Tab
        if (tab !== 'ALL') {
            filtered = filtered.filter(l => l.currentStatus === tab);
        }

        // 2. Filter by Search Query
        if (query) {
            filtered = filtered.filter(l =>
                l.id.toString().includes(query) ||
                l.applicant.username.toLowerCase().includes(query) ||
                l.applicant.email.toLowerCase().includes(query) ||
                (l.branch?.name || '').toLowerCase().includes(query)
            );
        }

        return filtered;
    }
);
