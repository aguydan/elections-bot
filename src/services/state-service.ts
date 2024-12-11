import { ElectionState, ElectionStateValue } from '@/models/election-state.js';
import { RegexUtils } from '@/utils/regex-utils.js';

export enum StateName {
    Election = 'Election',
}

type StateKind = ElectionState;

type StateNameToValueType = {
    [StateName.Election]: ElectionStateValue;
};

export class StateService {
    private states = new Map<StateName, StateKind>();

    public init(name: StateName) {
        this.states.set(name, new Map());
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
        const prevState = this.states.get(name);

        if (!prevState) {
            throw new Error(`Requested state ${name} wasnt initialized. see init method`);
        }

        const uuid = RegexUtils.getStateId(id);
        let value = prevState.get(uuid) ?? {};

        if (typeof newStateValue === 'function') {
            value = newStateValue(value);
        } else {
            value = newStateValue;
        }

        prevState.set(uuid, value);
    }

    public get<T extends StateName>(name: T, id: string): StateNameToValueType[T] {
        const state = this.states.get(name);

        if (!state) {
            throw new Error(
                `Requested state ${name} wasnt initialized during StateService creation`
            );
        }

        const uuid = RegexUtils.getStateId(id);

        return state.get(uuid) ?? {};
    }

    public delete(name: StateName, id: string): void {
        const state = this.states.get(name);

        if (!state) {
            throw new Error(
                `Requested state ${name} wasnt initialized during StateService creation`
            );
        }

        const uuid = RegexUtils.getStateId(id);

        state.delete(uuid);
    }
}
