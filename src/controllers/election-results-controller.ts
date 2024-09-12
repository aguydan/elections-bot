import PromiseRouter from 'express-promise-router';
import { Controller } from './index.js';
import { Request, Response, Router } from 'express';
import { electionResultRepo } from '@/database/database.js';

export class ElectionResultsController implements Controller {
    public path = '/results';
    public router: Router = PromiseRouter({ mergeParams: true });

    public register(): void {
        this.router.get('/', (req, res) => this.getResults(req, res));
        this.router.get('/:resultId', (req, res) => this.getResultById(req, res));
        this.router.post('/', (req, res) => this.createResult(req, res));
        this.router.delete('/:resultId', (req, res) => this.deleteResult(req, res));
    }

    private async getResults(req: Request, res: Response): Promise<void> {
        res.status(200).json(await electionResultRepo.search(req.query));
    }

    private async getResultById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.resultId!);

        res.status(200).json(await electionResultRepo.getById(id));
    }

    private async createResult(req: Request, res: Response): Promise<void> {
        res.status(200).json(await electionResultRepo.create(req.body));
    }

    private async deleteResult(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.resultId!);

        res.status(200).json(await electionResultRepo.delete(id));
    }
}
