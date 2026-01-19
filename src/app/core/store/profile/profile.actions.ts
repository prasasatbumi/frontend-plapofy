import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CustomerProfile } from '../../services/profile.service';

export const ProfileActions = createActionGroup({
    source: 'Profile',
    events: {
        'Load Profile': emptyProps(),
        'Load Profile Success': props<{ profile: CustomerProfile }>(),
        'Load Profile Failure': props<{ error: string }>(),

        'Update Profile': props<{ profile: Partial<CustomerProfile> }>(),
        'Update Profile Success': props<{ profile: CustomerProfile }>(),
        'Update Profile Failure': props<{ error: string }>(),

        'Check Completeness': emptyProps(),
        'Check Completeness Success': props<{ missingFields: string[] }>(),
        'Check Completeness Failure': props<{ error: string }>(),

        'Submit KYC': props<{ formData: FormData }>(),
        'Submit KYC Success': emptyProps(),
        'Submit KYC Failure': props<{ error: string }>()
    }
});
