import { ElectionState, ElectionStateValue } from '@/models/election-state.js';
import { ValueOf } from '@/models/utility-types.js';
import { RegexUtils } from '@/utils/regex-utils.js';

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
    private states: StateNameToStateType = {
        [StateName.Election]: {},
    };

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

        const uuid = RegexUtils.getStateId(id);
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

        const uuid = RegexUtils.getStateId(id);

        return state[uuid] ?? {};
    }

    public delete(name: StateName, id: string): void {
        const state = this.states[name];

        const uuid = RegexUtils.getStateId(id);

        delete state[uuid];
    }
}
