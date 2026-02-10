import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProfileState } from './profile.reducer';

export const selectProfileState = createFeatureSelector<ProfileState>('profile');

export const selectUserProfile = createSelector(
    selectProfileState,
    (state) => state.profile
);

export const selectProfileLoading = createSelector(
    selectProfileState,
    (state) => state.loading
);

export const selectProfileError = createSelector(
    selectProfileState,
    (state) => state.error
);

export const selectMissingFields = createSelector(
    selectProfileState,
    (state) => state.missingFields
);

export const selectKycStatus = createSelector(
    selectUserProfile,
    (profile) => profile?.kycStatus || 'UNVERIFIED'
);
