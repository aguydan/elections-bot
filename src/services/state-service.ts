import { RegexUtils } from '@/utils/regex-utils.js';

export class StateService<
  State extends Record<string, any> = Record<string, any>,
> {
  private _stateMap = new Map<string, State>();

  constructor(private _initialState: State) {}

  get initialState(): State {
    return this._initialState;
  }

  get keys(): string[] {
    return [...this._stateMap.keys()];
  }

  public init(id: string): void {
    //shallow copy. don't know if there's a better way yet
    const state = { ...this.initialState };

    this.set(id, state);
  }

  public set(id: string, callback: (prev: State) => State): void;
  public set(id: string, newStateValue: State): void;
  public set(
    id: string,
    newStateValue: State | ((prev: State) => State)
  ): void {
    const uuid = RegexUtils.getStateId(id);
    let value = this._stateMap.get(uuid) ?? this.initialState;

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
