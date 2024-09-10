import PromiseRouter from 'express-promise-router';
import { Controller } from './index.js';
import { Request, Response, Router } from 'express';
import { db } from '@/database/database.js';

export class ElectionResultsController implements Controller {
    public path = '/results';
    public router: Router = PromiseRouter({ mergeParams: true });

    public register(): void {
        this.router.get('/', (req, res) => this.getResults(req, res));
    }

    private async getResults(req: Request, res: Response): Promise<void> {
        let results;

        if (req.params.electionId) {
            const id = parseInt(req.params.electionId);

            results = await db
                .selectFrom('election_result')
                .selectAll()
                .where('election_id', '=', id)
                .execute();
        } else if (req.params.candidateId) {
            const id = parseInt(req.params.candidateId);

            results = await db
                .selectFrom('election_result')
                .selectAll()
                .where('candidate_id', '=', id)
                .execute();
        } else {
            results = await db.selectFrom('election_result').selectAll().execute();
        }

        res.status(200).json(results);
    }
}
