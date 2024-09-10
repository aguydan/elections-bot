import PromiseRouter from 'express-promise-router';
import { Controller } from './index.js';
import { Request, Response, Router } from 'express';
import { candidateRepo } from '@/database/database.js';

//maybe I should create base controller in the future!

export class CandidatesController implements Controller {
    public path = '/candidates';
    public router: Router = PromiseRouter();

    constructor(private electionResultsRouter: Router) {}

    public register(): void {
        this.router.get('/', (req, res) => this.getCandidates(req, res));
        this.router.get('/:candidateId', (req, res) => this.getCandidateById(req, res));
        this.router.post('/', (req, res) => this.createCandidate(req, res));
        this.router.put('/:candidateId', (req, res) => this.updateCandidate(req, res));
        this.router.delete('/:candidateId', (req, res) => this.deleteCandidate(req, res));

        this.router.use('/:candidateId/results', this.electionResultsRouter);
    }

    private async getCandidates(req: Request, res: Response): Promise<void> {
        res.status(200).json(await candidateRepo.getAll());
    }

    private async getCandidateById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.candidateId!);

        res.status(200).json(await candidateRepo.getById(id));
    }

    private async createCandidate(req: Request, res: Response): Promise<void> {
        res.status(200).json(await candidateRepo.create(req.body));
    }

    private async updateCandidate(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.candidateId!);

        res.status(200).json(await candidateRepo.update(id, req.body));
    }

    private async deleteCandidate(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.candidateId!);

        res.status(200).json(await candidateRepo.delete(id));
    }
}
