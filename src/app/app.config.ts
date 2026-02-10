import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { isDevMode } from '@angular/core';
import { authReducer } from './core/store/auth/auth.reducer';
import { AuthEffects } from './core/store/auth/auth.effects';
import { masterReducer } from './core/store/master/master.reducer';
import { MasterEffects } from './core/store/master/master.effects';
import { loanReducer } from './core/store/loan/loan.reducer';
import { LoanEffects } from './core/store/loan/loan.effects';
import { profileReducer } from './core/store/profile/profile.reducer';
import { ProfileEffects } from './core/store/profile/profile.effects';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideStore({
            auth: authReducer,
            master: masterReducer,
            loans: loanReducer,
            profile: profileReducer
        }),
        provideEffects([AuthEffects, MasterEffects, LoanEffects, ProfileEffects]),
        provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
    ]
};
