import { Candidate, Election } from '@/database/schema/index.js';

const enum ElectionStage {
  ANNOUNCEMENT,
  CANDIDATES_SELECTED,
  FINISHED,
}

export type ElectionStateValue = {
  stage: ElectionStage;
  stop: boolean;
  callbackQueue: (() => void)[];
  election?: Election;
  candidates?: Candidate[];
};

//export type ElectionState = Map<string, ElectionStateValue>;
