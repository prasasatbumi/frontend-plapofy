import { createReducer, on } from '@ngrx/store';
import { MasterActions } from './master.actions';
import { Branch } from '../../services/branch.service';
import { Plafond } from '../../services/plafond.service';

export interface MasterState {
    branches: Branch[];
    plafonds: Plafond[];
    loadingBranches: boolean;
    loadingPlafonds: boolean;
    error: string | null;
}

export const initialState: MasterState = {
    branches: [],
    plafonds: [],
    loadingBranches: false,
    loadingPlafonds: false,
    error: null
};

export const masterReducer = createReducer(
    initialState,

    // Branches
    on(MasterActions.loadBranches, (state) => ({
        ...state,
        loadingBranches: true,
        error: null
    })),
    on(MasterActions.loadBranchesSuccess, (state, { branches }) => ({
        ...state,
        loadingBranches: false,
        branches
    })),
    on(MasterActions.loadBranchesFailure, (state, { error }) => ({
        ...state,
        loadingBranches: false,
        error
    })),

    // Plafonds
    on(MasterActions.loadPlafonds, (state) => ({
        ...state,
        loadingPlafonds: true,
        error: null
    })),
    on(MasterActions.loadPlafondsSuccess, (state, { plafonds }) => ({
        ...state,
        loadingPlafonds: false,
        plafonds
    })),
    on(MasterActions.loadPlafondsFailure, (state, { error }) => ({
        ...state,
        loadingPlafonds: false,
        error
    }))
);
