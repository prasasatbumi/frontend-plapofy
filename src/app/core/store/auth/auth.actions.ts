import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LoginRequest, LoginResponse } from '../../services/auth.service';
import { User } from '../../services/user.service';

export const AuthActions = createActionGroup({
    source: 'Auth',
    events: {
        'Login': props<{ request: LoginRequest }>(),
        'Login Success': props<{ response: LoginResponse }>(),
        'Login Failure': props<{ error: string }>(),
        'Logout': emptyProps(),
        'Load User From Storage': emptyProps()
    }
});
