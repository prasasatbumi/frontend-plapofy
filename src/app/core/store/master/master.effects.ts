import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BranchService } from '../../services/branch.service';
import { PlafondService } from '../../services/plafond.service';
import { MasterActions } from './master.actions';
import { catchError, map, exhaustMap, of } from 'rxjs';

@Injectable()
export class MasterEffects {
    private actions$ = inject(Actions);
    private branchService = inject(BranchService);
    private plafondService = inject(PlafondService);

    loadBranches$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MasterActions.loadBranches),
            exhaustMap(() =>
                this.branchService.getBranches().pipe(
                    map((branches) => MasterActions.loadBranchesSuccess({ branches })),
                    catchError((error) => of(MasterActions.loadBranchesFailure({ error: error.message || 'Failed to load branches' })))
                )
            )
        )
    );

    loadPlafonds$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MasterActions.loadPlafonds),
            exhaustMap(() =>
                this.plafondService.getPlafonds().pipe(
                    map((plafonds) => MasterActions.loadPlafondsSuccess({ plafonds })),
                    catchError((error) => of(MasterActions.loadPlafondsFailure({ error: error.message || 'Failed to load plafonds' })))
                )
            )
        )
    );
}
