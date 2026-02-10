import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ProfileService } from '../../services/profile.service';
import { ProfileActions } from './profile.actions';
import { catchError, map, exhaustMap, switchMap, tap } from 'rxjs';
import { of } from 'rxjs';

@Injectable()
export class ProfileEffects {
    private actions$ = inject(Actions);
    private profileService = inject(ProfileService);

    loadProfile$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProfileActions.loadProfile),
            exhaustMap(() =>
                this.profileService.getProfile().pipe(
                    map((profile) => ProfileActions.loadProfileSuccess({ profile })),
                    catchError((error) => of(ProfileActions.loadProfileFailure({ error: error.message || 'Failed to load profile' })))
                )
            )
        )
    );

    updateProfile$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProfileActions.updateProfile),
            exhaustMap(({ profile }) =>
                this.profileService.updateProfile(profile).pipe(
                    map((updatedProfile) => ProfileActions.updateProfileSuccess({ profile: updatedProfile })),
                    catchError((error) => of(ProfileActions.updateProfileFailure({ error: error.message || 'Update failed' })))
                )
            )
        )
    );

    checkCompleteness$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProfileActions.checkCompleteness, ProfileActions.loadProfileSuccess, ProfileActions.updateProfileSuccess),
            switchMap(() =>
                this.profileService.checkCompleteness().pipe(
                    map((res) => ProfileActions.checkCompletenessSuccess({ missingFields: res.missingFields })),
                    catchError((error) => of(ProfileActions.checkCompletenessFailure({ error: error.message || 'Check failed' })))
                )
            )
        )
    );

    submitKyc$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProfileActions.submitKYC),
            exhaustMap(({ formData }) =>
                this.profileService.submitKyc(formData).pipe(
                    map(() => ProfileActions.submitKYCSuccess()),
                    catchError((error) => of(ProfileActions.submitKYCFailure({ error: error.message || 'KYC submission failed' })))
                )
            )
        )
    );

    // Reload profile after KYC submission to update status
    reloadAfterKyc$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProfileActions.submitKYCSuccess),
            map(() => ProfileActions.loadProfile())
        )
    );
}
