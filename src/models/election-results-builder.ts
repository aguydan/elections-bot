import { electionResultRepo, heldElectionRepo } from '@/database/database.js';
import { Candidate, Election } from '@/database/schema/index.js';
import Config from '@/../config/config.json';

type PartialData = Partial<CompleteData>;

type AccumulatedScoreData = {
  id: number;
  score: number;
};

type CompleteData = AccumulatedScoreData & {
  popularVote: number;
  percentage: number;
  remainder: number;
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

/* type InferKeys<T> = T extends AccumulatedScoreData
  ? T extends CompleteData
    ? keyof CompleteData
    : keyof AccumulatedScoreData
  : never; */

export class ElectionResultsBuilder<T extends PartialData> {
  constructor(public results: T[] = []) {}

  //   public results: T[] = [];

  /*   public sumOf<A extends AccumulatedScoreData>(
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
  } */

  public accumulateRawScores(candidates: Candidate[]) {
    const accumulated = candidates.map((candidate) => {
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

    return new ElectionResultsBuilder<AccumulatedScoreData>(accumulated);
  }

  public randomizeScores(this: ElectionResultsBuilder<AccumulatedScoreData>) {
    const results = this.results.map((data) => {
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

    this.results = results;

    return this;
  }

  public normalizeScores(this: ElectionResultsBuilder<AccumulatedScoreData>) {
    const sumOfScores =
      this.results.reduce((sum, data) => sum + data.score, 0) || 1;

    const results = this.results.map((data) => {
      const { score } = data;

      return {
        ...data,
        score: score / sumOfScores,
      };
    });

    this.results = results;

    return this;
  }

  // Utilizes the largest remainder method, sort of: https://en.wikipedia.org/wiki/Quota_method
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

    let remainingVotes = votingPool;

    const results = this.results.map((data) => {
      const { score } = data;

      const votes = votingPool * score;
      const wholeVotes = Math.floor(votes);
      const remainder = votes - wholeVotes;

      remainingVotes -= wholeVotes;

      return {
        ...data,
        popularVote: wholeVotes,
        remainder,
      };
    });

    // Sort based on the largest remainder
    results.sort((a, b) => b.remainder - a.remainder);

    // Distribute remaining votes and calculate percentages
    const toEach = Math.floor(remainingVotes / results.length);
    let remainder = remainingVotes % results.length;

    const complete = results.map((data) => {
      const { popularVote } = data;

      const finalVote = popularVote + toEach + Math.max(0, remainder--);
      const percentage = (finalVote / votingPool) * 100;

      return {
        ...data,
        popularVote: finalVote,
        percentage,
      };
    });

    return new ElectionResultsBuilder<CompleteData>(complete);
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
        this.results.map((data) => {
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
