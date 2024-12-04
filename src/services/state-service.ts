import { UUID_REGEX } from '@/constants/bot.js';
import { ElectionState, ElectionStateValue } from '@/models/election-state.js';
import { ValueOf } from '@/models/utility-types.js';

export enum StateName {
    Election = 1,
}

type StateNameToStateType = {
    [StateName.Election]: ElectionState;
};

type StateNameToValueType = {
    [StateName.Election]: ElectionStateValue;
};

export class StateService {
    constructor(private states: StateNameToStateType) {
        this.states = {
            [StateName.Election]: {},
        };
    }

    public set<T extends StateName>(
        name: T,
        id: string,
        callback: (prev: StateNameToValueType[T]) => StateNameToValueType[T]
    ): void;
    public set<T extends StateName>(
        name: T,
        id: string,
        newStateValue: StateNameToValueType[T]
    ): void;
    public set<T extends StateName>(
        name: T,
        id: string,
        newStateValue:
            | StateNameToValueType[T]
            | ((prev: StateNameToValueType[T]) => StateNameToValueType[T])
    ): void {
        const prevState: ValueOf<StateNameToStateType> = this.states[name];

        //as a util function that checks any kind of id and gives back uuid
        const componentName = id.replace(UUID_REGEX, '');
        const uuid = id.replace(componentName, '');

        if (!uuid) {
            console.error('fuck uuid');
        }

        let value = prevState[uuid] ?? {};

        if (typeof newStateValue === 'function') {
            value = newStateValue(value);
        } else {
            value = newStateValue;
        }

        prevState[uuid] = value;
    }

    public get<T extends StateName>(name: T, id: string): StateNameToValueType[T] {
        const state = this.states[name];

        const componentName = id.replace(UUID_REGEX, '');
        const uuid = id.replace(componentName, '');

        if (!uuid) {
            console.error('fuck uuid');
        }

        return state[uuid] ?? {};
    }

    public delete(name: StateName, id: string): void {
        const state = this.states[name];

        const componentName = id.replace(UUID_REGEX, '');
        const uuid = id.replace(componentName, '');

        if (!uuid) {
            console.error('fuck uuid');
        }

        delete state[uuid];
    }
}
