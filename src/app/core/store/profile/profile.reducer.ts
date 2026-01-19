import { createReducer, on } from '@ngrx/store';
import { ProfileActions } from './profile.actions';
import { CustomerProfile } from '../../services/profile.service';

export interface ProfileState {
    profile: CustomerProfile | null;
    missingFields: string[];
    loading: boolean;
    error: string | null;
}

export const initialState: ProfileState = {
    profile: null,
    missingFields: [],
    loading: false,
    error: null
};

export const profileReducer = createReducer(
    initialState,

    // Load
    on(ProfileActions.loadProfile, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(ProfileActions.loadProfileSuccess, (state, { profile }) => ({
        ...state,
        loading: false,
        profile
    })),
    on(ProfileActions.loadProfileFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Update
    on(ProfileActions.updateProfile, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(ProfileActions.updateProfileSuccess, (state, { profile }) => ({
        ...state,
        loading: false,
        profile
    })),
    on(ProfileActions.updateProfileFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Check Completeness
    on(ProfileActions.checkCompletenessSuccess, (state, { missingFields }) => ({
        ...state,
        missingFields
    })),

    // Submit KYC
    on(ProfileActions.submitKYC, (state) => ({
        ...state,
        loading: true, // Use same loading flag or create separate if needed
        error: null
    })),
    on(ProfileActions.submitKYCSuccess, (state) => ({
        ...state,
        loading: false
    })),
    on(ProfileActions.submitKYCFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    }))
);
