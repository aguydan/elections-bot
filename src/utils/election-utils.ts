import { electionResultRepo, heldElectionRepo } from '@/database/database.js';
import { Candidate, Election } from '@/database/schema/index.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Config = require('../../config/config.json');

type Scores = Record<number, number>;
type Results = Record<number, { popularVote: number; percentage: number }>;

export class ElectionUtils {
    public static getScores(participants: Candidate[]): Scores {
        const scores: Scores = {};

        //compute scores

        for (const participant of participants) {
            const totalScore = Object.entries(participant.score).reduce(
                (acc, entry) => acc + entry[1] * Config.candidateScoreWeights[entry[0]],
                0
            );

            scores[participant.id] = totalScore;
        }

        //randomize scores

        for (const [id, score] of Object.entries(scores)) {
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

            console.log(random);

            scores[parseInt(id)] = modified;
        }

        const sumOfScores = Object.values(scores).reduce((acc, score) => acc + score, 0);

        //normalize scores

        for (const [id, score] of Object.entries(scores)) {
            scores[parseInt(id)] = score / sumOfScores;
        }

        console.log(scores);
        return scores;
    }

    //split getting results and percentages
    public static getResults(election: Election, scores: Scores): Results {
        const votingPool = election.turnout
            ? Math.round(election.electorate * (election.turnout / 100))
            : Math.round(election.electorate * Math.random());

        if (votingPool === 0) {
            throw new Error('elections cannot proceed because no one showed up');
        }

        const results: Results = {};
        let hasFreeVotes = true;
        let freeVotes = votingPool;

        const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

        for (const [id, score] of sortedScores) {
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
        return results;
    }

    public static async saveResults(electionId: number, results: Results): Promise<void> {
        const heldElectionId = await heldElectionRepo.create({
            created_at: new Date(),
            election_id: electionId,
        });

        if (!heldElectionId) {
            throw new Error('Held election failed to record to database');
        }

        for (const [id, fields] of Object.entries(results)) {
            const { popularVote, percentage } = fields;

            await electionResultRepo.create({
                percentage: percentage,
                popular_vote: popularVote,
                created_at: new Date(),
                candidate_id: parseInt(id),
                held_election_id: heldElectionId,
            });
        }
    }
}
