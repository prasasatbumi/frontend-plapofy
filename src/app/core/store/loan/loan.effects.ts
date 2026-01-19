import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LoanService } from '../../services/loan.service';
import { LoanActions } from './loan.actions';
import { catchError, map, exhaustMap, switchMap, tap, withLatestFrom } from 'rxjs'; // switchMap for cancelable search/filter
import { Store } from '@ngrx/store';
import { selectLoanFilters } from './loan.selectors';
import { of } from 'rxjs';

@Injectable()
export class LoanEffects {
    private actions$ = inject(Actions);
    private loanService = inject(LoanService);
    private store = inject(Store);

    loadLoans$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LoanActions.loadLoans),
            switchMap(({ branchId }) =>
                this.loanService.getLoans(branchId).pipe(
                    map((loans) => LoanActions.loadLoansSuccess({ loans })),
                    catchError((error) => of(LoanActions.loadLoansFailure({ error: error.message || 'Failed to load loans' })))
                )
            )
        )
    );

    // Trigger reload when branch filter changes
    reloadOnBranchChange$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LoanActions.setBranchFilter),
            map(({ branchId }) => LoanActions.loadLoans({ branchId: branchId || undefined }))
        )
    );

    reviewLoan$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LoanActions.reviewLoan),
            exhaustMap(({ id }) =>
                this.loanService.reviewLoan(id).pipe(
                    map(() => LoanActions.reviewLoanSuccess({ id })),
                    catchError((error) => of(LoanActions.reviewLoanFailure({ error: error.message || 'Review failed' })))
                )
            )
        )
    );

    approveLoan$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LoanActions.approveLoan),
            exhaustMap(({ id }) =>
                this.loanService.approveLoan(id).pipe(
                    map(() => LoanActions.approveLoanSuccess({ id })),
                    catchError((error) => of(LoanActions.approveLoanFailure({ error: error.message || 'Approve failed' })))
                )
            )
        )
    );

    disburseLoan$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LoanActions.disburseLoan),
            exhaustMap(({ id }) =>
                this.loanService.disburseLoan(id).pipe(
                    map(() => LoanActions.disburseLoanSuccess({ id })),
                    catchError((error) => of(LoanActions.disburseLoanFailure({ error: error.message || 'Disburse failed' })))
                )
            )
        )
    );

    rejectLoan$ = createEffect(() =>
        this.actions$.pipe(
            ofType(LoanActions.rejectLoan),
            exhaustMap(({ id, remarks }) =>
                this.loanService.rejectLoan(id, remarks).pipe(
                    map(() => LoanActions.rejectLoanSuccess({ id })),
                    catchError((error) => of(LoanActions.rejectLoanFailure({ error: error.message || 'Reject failed' })))
                )
            )
        )
    );

    // Reload loans after any successful action
    reloadAfterAction$ = createEffect(() =>
        this.actions$.pipe(
            ofType(
                LoanActions.reviewLoanSuccess,
                LoanActions.approveLoanSuccess,
                LoanActions.disburseLoanSuccess,
                LoanActions.rejectLoanSuccess
            ),
            withLatestFrom(this.store.select(selectLoanFilters)),
            map(([action, filters]) => LoanActions.loadLoans({ branchId: filters.branchId || undefined }))
        )
    );
}
