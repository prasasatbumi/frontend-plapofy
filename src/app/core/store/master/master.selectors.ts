import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MasterState } from './master.reducer';

export const selectMasterState = createFeatureSelector<MasterState>('master');

export const selectAllBranches = createSelector(
    selectMasterState,
    (state) => state.branches
);

export const selectAllPlafonds = createSelector(
    selectMasterState,
    (state) => state.plafonds
);

export const selectBranchesLoading = createSelector(
    selectMasterState,
    (state) => state.loadingBranches
);

export const selectPlafondsLoading = createSelector(
    selectMasterState,
    (state) => state.loadingPlafonds
);

export const selectMasterError = createSelector(
    selectMasterState,
    (state) => state.error
);
