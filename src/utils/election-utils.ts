import { electionResultRepo } from '@/database/database.js';
import { Candidate, Election } from '@/database/schema/index.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Config = require('../../config/config.json');

export class ElectionUtils {
    public static getIndividualPercentages(participants: Candidate[]): Record<number, number> {
        const scores: Record<number, number> = {};

        //compute scores

        for (const participant of participants) {
            const totalScore = Object.entries(participant.score).reduce(
                (acc, entry) => acc + entry[1] * Config.candidateScoreWeights[entry[0]],
                0
            );

            scores[participant.id] = totalScore;
        }

        const sumOfScores = Object.values(scores).reduce((acc, score) => acc + score, 0);

        //randomize scores!!!!!! do we even do it here?

        //normalize scores

        for (const [id, score] of Object.entries(scores)) {
            scores[parseInt(id)] = parseFloat(((score / sumOfScores) * 100).toFixed(2));
        }

        return scores;
    }

    public static getTotalVotes(election: Election): number {
        return election.turnout
            ? election.electorate * Math.ceil(election.turnout / 100)
            : election.electorate * Math.random();
    }

    //getIndividualVotes??????
    //to be implemented

    public static async saveResults(
        electionId: number,
        percentages: Record<number, number>,
        votes: number
    ): Promise<void> {
        for (const [id, percentage] of Object.entries(percentages)) {
            await electionResultRepo.create({
                popular_vote: Math.ceil(votes * (percentage / 100)), //this is what getIndividualVotes is gonna replace
                percentage: percentage,
                created_at: new Date(),
                candidate_id: parseInt(id),
                election_id: electionId,
            });
        }
    }
}
