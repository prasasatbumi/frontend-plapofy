import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Loan } from '../../services/loan.service';

export const LoanActions = createActionGroup({
    source: 'Loan Application',
    events: {
        'Load Loans': props<{ branchId?: number }>(), // Optional initial load
        'Load Loans Success': props<{ loans: Loan[] }>(),
        'Load Loans Failure': props<{ error: string }>(),

        'Set Branch Filter': props<{ branchId: number | null }>(),
        'Set Search Query': props<{ query: string }>(),
        'Set Status Tab': props<{ tab: string }>(),

        'Select Loan': props<{ loan: Loan }>(),
        'Clear Selection': emptyProps(),

        // Actions
        'Review Loan': props<{ id: number }>(),
        'Review Loan Success': props<{ id: number }>(), // Optimistic or Re-fetch? Re-fetch is safer.
        'Review Loan Failure': props<{ error: string }>(),

        'Approve Loan': props<{ id: number }>(),
        'Approve Loan Success': props<{ id: number }>(),
        'Approve Loan Failure': props<{ error: string }>(),

        'Disburse Loan': props<{ id: number }>(),
        'Disburse Loan Success': props<{ id: number }>(),
        'Disburse Loan Failure': props<{ error: string }>(),

        'Reject Loan': props<{ id: number, remarks?: string }>(),
        'Reject Loan Success': props<{ id: number }>(),
        'Reject Loan Failure': props<{ error: string }>(),
    }
});
