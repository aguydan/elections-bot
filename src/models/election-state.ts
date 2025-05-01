import { Candidate, Election } from '@/database/schema/index.js';
import { StateService } from '@/services/state-service.js';
import { TextBasedChannel } from 'discord.js';

export const enum ElectionStage {
  ANNOUNCEMENT,
  CANDIDATES_SELECTED,
  FINISHED,
}

export type ElectionState = {
  stage: ElectionStage;
  stop: boolean;
  channel?: TextBasedChannel;
  callbackQueue: ((stateId: string, channel: TextBasedChannel) => void)[];
  election?: Election;
  candidates?: Candidate[];
};

export class ElectionStateService extends StateService<ElectionState> {
  public init(id: string): void {
    const state = { ...this.initialState };
    state.callbackQueue = this.initialState.callbackQueue.slice();

    this.set(id, state);
  }

  public nextStep(id: string, ignoreStop: boolean = false): void {
    const state = this.get(id);

    if (state.stop && !ignoreStop) return;

    const callback = state.callbackQueue.pop();

    if (!callback) {
      //state isnt needed anymore since there are no callbacks left to utilize it
      this.delete(id);

      return;
    }

    if (!state.channel) {
      throw new Error('No text channel associated with this state');
    }

    callback(id, state.channel);
  }
}
