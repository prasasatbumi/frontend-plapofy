import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Branch } from '../../services/branch.service';
import { Plafond } from '../../services/plafond.service';

export const MasterActions = createActionGroup({
    source: 'Master Data',
    events: {
        'Load Branches': emptyProps(),
        'Load Branches Success': props<{ branches: Branch[] }>(),
        'Load Branches Failure': props<{ error: string }>(),

        'Load Plafonds': emptyProps(),
        'Load Plafonds Success': props<{ plafonds: Plafond[] }>(),
        'Load Plafonds Failure': props<{ error: string }>()
    }
});
