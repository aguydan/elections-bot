import { electionResultRepo, heldElectionRepo } from '@/database/database.js';
import { Candidate, Election } from '@/database/schema/index.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Config = require('../../config/config.json');

type PartialData = Partial<CompleteData>;

type AccumulatedScoreData = {
  id: number;
  score: number;
};

type CompleteData = AccumulatedScoreData & {
  popularVote: number;
  percentage: number;
};

/* type DataWith<A extends keyof PartialData> = PartialData &
  Pick<CompleteData, A>; */

/* type NonOptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T]; */

/* type InferThis<T, B extends Data> = T extends { results: (infer C)[] }
  ? [NonOptionalKeys<C>] extends [never]
    ? Omit<T, 'results'> & {
        results: B[];
      }
    : Omit<T, 'results'> & {
        results: DataWith<NonOptionalKeys<C> | NonOptionalKeys<B>>[];
      }
  : never; */

type InferKeys<T> = T extends AccumulatedScoreData
  ? T extends CompleteData
    ? keyof CompleteData
    : keyof AccumulatedScoreData
  : never;

export class ElectionResultsBuilder<T extends PartialData> {
  public results: T[] = [];

  public sumOf<A extends AccumulatedScoreData>(
    this: ElectionResultsBuilder<A>,
    of: InferKeys<T>
  ) {
    return this.results
      .map(data => data[of])
      .reduce((sum, value) => sum + value, 0);
  }

  public sortBy<A extends AccumulatedScoreData>(
    this: ElectionResultsBuilder<A>,
    by: InferKeys<T>
  ) {
    return this.results.sort((a, b) => b[by] - a[by]);
  }

  public accumulateRawScores(candidates: Candidate[]) {
    const accumulated = candidates.map(candidate => {
      const score = Object.entries(candidate.score).reduce((sum, entry) => {
        const [param, value] = entry;

        const weight = Config.candidateScoreWeights[param];
        if (!weight) {
          throw new Error(
            'No weight defined for the score parameter: ' + param
          );
        }

        return sum + value * weight;
      }, 0);

      return {
        id: candidate.id,
        score,
      };
    });

    this.results = accumulated as T[];

    return this as ElectionResultsBuilder<AccumulatedScoreData>;
  }

  public randomizeScores(this: ElectionResultsBuilder<AccumulatedScoreData>) {
    this.results = this.results.map(data => {
      const { score } = data;

      const random = Math.random();
      let modified = score;

      if (random < 0.02) {
        modified += 0.4;
      } else if (random < 0.05) {
        modified += 0.2 * score;
      } else if (random < 0.1) {
        modified -= 0.2 * score;
      } else if (random < 0.5) {
        modified += 0.07 * score;
      } else if (random < 0.9) {
        modified -= 0.07 * score;
      }

      return {
        ...data,
        score: modified,
      };
    });

    return this;
  }

  public normalizeScores(this: ElectionResultsBuilder<AccumulatedScoreData>) {
    const sum = this.sumOf('score');

    this.results = this.results.map(data => {
      const { score } = data;

      return {
        ...data,
        score: score / sum,
      };
    });

    return this;
  }

  public calculateResults(
    this: ElectionResultsBuilder<AccumulatedScoreData>,
    election: Election
  ) {
    const votingPool = election.turnout
      ? Math.round(election.electorate * (election.turnout / 100))
      : Math.round(election.electorate * Math.random());

    if (votingPool === 0) {
      throw new Error('elections cannot proceed because no one showed up');
    }

    let hasFreeVotes = true;
    let freeVotes = votingPool;

    this.results = this.results.map(data => {
      const { score } = data;
      // ADDRESSED:
      // if votingPool is 1 and score for every candidate is less than 0.5 then everyone will get 0 votes
      let votes = hasFreeVotes ? Math.round(votingPool * score) : 0;

      if (votes === 0 && hasFreeVotes) {
        votes = 1;
      }

      freeVotes -= votes;

      /*
       * Sometimes due to rounding one nonexistent vote ends up
       * being added to the candidate who lost the most.
       *
       * This here ensures that whatever is added is immediately
       * substracted from the final bunch of votes so that in total
       * all votes are exactly the same as the votingPool number
       */
      if (freeVotes <= 0) {
        votes += freeVotes;
        freeVotes = 0;

        hasFreeVotes = false;
      }

      const percentage = (votes / votingPool) * 100;

      return {
        ...data,
        popularVote: votes,
        percentage,
      };
    });

    return this as ElectionResultsBuilder<CompleteData>;
  }

  //this logic shouldnt be here
  public async save(
    this: ElectionResultsBuilder<CompleteData>,
    electionId: number
  ) {
    const heldElectionId = await heldElectionRepo.create({
      created_at: new Date(),
      election_id: electionId,
    });

    try {
      Promise.all(
        this.results.map(data => {
          const { id, popularVote, percentage } = data;

          return electionResultRepo.create({
            percentage: percentage,
            popular_vote: popularVote,
            created_at: new Date(),
            candidate_id: id,
            held_election_id: heldElectionId,
          });
        })
      );
    } catch (error) {
      console.error(error);
    }

    return this;
  }
}
