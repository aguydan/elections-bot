import { RegexUtils } from '@/utils/regex-utils.js';

export class StateService<State extends Record<string, any>> {
  private _initialState: State;
  private _stateMap = new Map<string, State>();

  constructor(initialState: State) {
    this._initialState = initialState;
  }

  public set(id: string, callback: (prev: State) => State): void;
  public set(id: string, newStateValue: State): void;
  public set(
    id: string,
    newStateValue: State | ((prev: State) => State)
  ): void {
    const uuid = RegexUtils.getStateId(id);
    let value = this._stateMap.get(uuid) ?? this._initialState;

    if (typeof newStateValue === 'function') {
      value = newStateValue(value);
    } else {
      value = newStateValue;
    }

    this._stateMap.set(uuid, value);
  }

  public get(id: string): State {
    const uuid = RegexUtils.getStateId(id);

    const value = this._stateMap.get(uuid);

    if (!value) {
      throw new Error(`State entry with uuid ${uuid} doesn't exist.`);
    }

    return value;
  }

  public delete(id: string): void {
    const uuid = RegexUtils.getStateId(id);

    this._stateMap.delete(uuid);
  }
}
