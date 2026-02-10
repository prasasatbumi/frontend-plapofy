import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { LoginResponse } from '../../services/auth.service';

export interface AuthState {
    user: LoginResponse | null;
    loading: boolean;
    error: string | null;
}

export const initialState: AuthState = {
    user: null,
    loading: false,
    error: null
};

export const authReducer = createReducer(
    initialState,
    on(AuthActions.login, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(AuthActions.loginSuccess, (state, { response }) => ({
        ...state,
        user: response,
        loading: false,
        error: null
    })),
    on(AuthActions.loginFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),
    on(AuthActions.logout, (state) => ({
        ...state,
        user: null,
        error: null
    })),
    on(AuthActions.loadUserFromStorage, (state) => state) // Handled by effect, state remains same
);
