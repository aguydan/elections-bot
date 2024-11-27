import { electionResultRepo, heldElectionRepo } from '@/database/database.js';
import { Candidate, Election } from '@/database/schema/index.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Config = require('../../config/config.json');

type Scores = Record<number, number>;
type Results = Record<number, { popularVote: number; percentage: number }>;

export class ElectionResultsBuilder {
    public scores: Scores | null;
    public results: Results | null;

    constructor() {
        this.scores = null;
        this.results = null;
    }

    private getSum(this: this & { scores: Scores }) {
        return Object.values(this.scores).reduce((acc, score) => acc + score, 0);
    }

    private getSorted(this: this & { scores: Scores }) {
        return Object.entries(this.scores).sort((a, b) => b[1] - a[1]);
    }

    public getTotalForEach(participants: Candidate[]) {
        const scores: Scores = {};

        for (const participant of participants) {
            const totalScore = Object.entries(participant.score).reduce((acc, entry) => {
                const [label, value] = entry;

                return acc + value * Config.candidateScoreWeights[label];
            }, 0);

            scores[participant.id] = totalScore;
        }

        return Object.assign(this, { scores });
    }

    public randomize(this: this & { scores: Scores }) {
        for (const [id, score] of Object.entries(this.scores)) {
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

            console.log(random); //delete log

            this.scores[parseInt(id)] = modified;
        }

        return this;
    }

    public normalize(this: this & { scores: Scores }) {
        for (const [id, score] of Object.entries(this.scores)) {
            this.scores[parseInt(id)] = score / this.getSum();
        }

        console.log(this.scores);
        return this;
    }

    public getResults(this: this & { scores: Scores }, election: Election) {
        const votingPool = election.turnout
            ? Math.round(election.electorate * (election.turnout / 100))
            : Math.round(election.electorate * Math.random());

        if (votingPool === 0) {
            throw new Error('elections cannot proceed because no one showed up');
        }

        let hasFreeVotes = true;
        let freeVotes = votingPool;

        const results: Results = {};

        for (const [id, score] of this.getSorted()) {
            // ADDRESSED:
            // if votingPool is 1 and score for every candidate is less than 0.5 then everyone will get 0 votes
            let votes = hasFreeVotes ? Math.round(votingPool * score) : 0;

            if (votes === 0 && hasFreeVotes) {
                votes = 1;
            }

            freeVotes -= votes;

            if (freeVotes === 0 && hasFreeVotes) {
                hasFreeVotes = false;
            }

            const percentage = (votes / votingPool) * 100; //.toFixed(2));

            results[parseInt(id)] = { popularVote: votes, percentage };
        }
        console.log(results);

        return Object.assign(this, { results });
    }

    public async save(this: this & { results: Results }, electionId: number) {
        const heldElectionId = await heldElectionRepo.create({
            created_at: new Date(),
            election_id: electionId,
        });

        if (!heldElectionId) {
            throw new Error('Held election failed to record to database');
        }

        for (const [id, fields] of Object.entries(this.results)) {
            const { popularVote, percentage } = fields;

            //Promise all!!!
            await electionResultRepo.create({
                percentage: percentage,
                popular_vote: popularVote,
                created_at: new Date(),
                candidate_id: parseInt(id),
                held_election_id: heldElectionId,
            });
        }

        return this.results;
    }
}
