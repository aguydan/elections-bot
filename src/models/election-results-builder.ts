import { electionResultRepo, heldElectionRepo } from '@/database/database.js';
import { Candidate, Election } from '@/database/schema/index.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Config = require('../../config/config.json');

type Results<T> = Map<number, T>;

type Data = {
    score?: number;
    popularVote?: number;
    percentage?: number;
};

type FullData = Required<Data>;
type DataWith<T extends keyof FullData> = Data & Pick<FullData, T>;

export class ElectionResultsBuilder {
    public results = new Map<number, Data>();

    public sumOf<T extends keyof Data>(
        this: this & { results: Results<DataWith<T>> },
        of: T
    ): number {
        return [...this.results].reduce((acc, result) => acc + result[1][of], 0);
    }

    public sortedBy<T extends keyof Data>(this: this & { results: Results<DataWith<T>> }, by: T) {
        return new Map([...this.results].sort((a, b) => b[1][by] - a[1][by]));
    }

    public getTotalScoresFor(
        candidates: Candidate[]
    ): this & { results: Results<DataWith<'score'>> } {
        const results = new Map<number, DataWith<'score'>>();

        for (const candidate of candidates) {
            const totalScore = Object.entries(candidate.score).reduce((acc, entry) => {
                const [param, value] = entry;

                const weight = Config.candidateScoreWeights[param];
                if (!weight) {
                    throw new Error('no weight defined for score parameter: ' + param);
                }

                return acc + value * weight;
            }, 0);

            results.set(candidate.id, { score: totalScore });
        }

        console.log(results);
        return Object.assign(this, { results });
    }

    public randomize(this: this & { results: Results<DataWith<'score'>> }) {
        //We need this cause otherwise the reference of this.results is copied into results instead of just contents => source of bugs
        //         const results = structuredClone(this.results);
        const results = new Map(this.results);

        for (const [id, data] of results) {
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

            results.set(id, { ...data, score: modified });
        }

        console.log(results);
        return Object.assign(this, { results });
    }

    public normalize(this: this & { results: Results<DataWith<'score'>> }) {
        const results = new Map(this.results);

        for (const [id, data] of results) {
            const { score } = data;

            results.set(id, { ...data, score: score / this.sumOf('score') });
        }

        console.log(results);
        return Object.assign(this, { results });
    }

    public getResults(this: this & { results: Results<DataWith<'score'>> }, election: Election) {
        const votingPool = election.turnout
            ? Math.round(election.electorate * (election.turnout / 100))
            : Math.round(election.electorate * Math.random());

        if (votingPool === 0) {
            throw new Error('elections cannot proceed because no one showed up');
        }

        let hasFreeVotes = true;
        let freeVotes = votingPool;

        const results = new Map<number, FullData>();

        for (const [id, data] of this.sortedBy('score')) {
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

            results.set(id, { ...data, popularVote: votes, percentage });
        }

        console.log(results);
        return Object.assign(this, { results });
    }

    public async save(this: this & { results: Results<FullData> }, electionId: number) {
        const heldElectionId = await heldElectionRepo.create({
            created_at: new Date(),
            election_id: electionId,
        });

        const promises = [];

        for (const [id, fields] of this.results) {
            const { popularVote, percentage } = fields;

            promises.push(
                electionResultRepo.create({
                    percentage: percentage,
                    popular_vote: popularVote,
                    created_at: new Date(),
                    candidate_id: id,
                    held_election_id: heldElectionId,
                })
            );
        }

        try {
            await Promise.all(promises);
        } catch (error) {
            console.error(error);
        }

        return this;
    }
}
