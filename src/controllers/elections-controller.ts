import PromiseRouter from 'express-promise-router';
import { Controller } from './index.js';
import { Request, Response, Router } from 'express';
import { electionRepo } from '@/database/database.js';

export class ElectionsController implements Controller {
    public path = '/elections';
    public router: Router = PromiseRouter();

    constructor(
        private electionResultsRouter: Router,
        private heldElectionsRouter: Router
    ) {}

    public register(): void {
        this.router.get('/', (req, res) => this.getElections(req, res));
        this.router.get('/:electionId', (req, res) => this.getElectionById(req, res));
        this.router.post('/', (req, res) => this.createElection(req, res));
        this.router.put('/:electionId', (req, res) => this.updateElection(req, res));
        this.router.delete('/:electionId', (req, res) => this.deleteElection(req, res));

        this.router.use('/:electionId/results', this.electionResultsRouter);
        this.router.use('/:electionId/held', this.heldElectionsRouter);
    }

    private async getElections(req: Request, res: Response): Promise<void> {
        res.status(200).json(await electionRepo.getAll());
    }

    private async getElectionById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.electionId!);

        res.status(200).json(await electionRepo.getById(id));
    }

    private async createElection(req: Request, res: Response): Promise<void> {
        res.status(200).json(await electionRepo.create(req.body));
    }

    private async updateElection(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.electionId!);

        res.status(200).json(await electionRepo.update(id, req.body));
    }

    private async deleteElection(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.electionId!);

        res.status(200).json(await electionRepo.delete(id));
    }
}
