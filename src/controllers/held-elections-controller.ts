import PromiseRouter from 'express-promise-router';
import { Controller } from './index.js';
import { Request, Response, Router } from 'express';
import { heldElectionRepo } from '@/database/database.js';

export class HeldElectionsController implements Controller {
    public path = '/held';
    public router: Router = PromiseRouter({ mergeParams: true });

    public register(): void {
        this.router.get('/', (req, res) => this.getLatestHeldElection(req, res));
        this.router.post('/', (req, res) => this.createHeldElection(req, res));
        this.router.delete('/:heldId', (req, res) => this.deleteHeldElection(req, res));
    }

    /*     getAll for election router that is the parent of this router. 
    getAll will get every held election or every held election depending on the id */

    private async getLatestHeldElection(req: Request, res: Response): Promise<void> {
        res.status(200).json(await heldElectionRepo.getLatest());
    }

    private async createHeldElection(req: Request, res: Response): Promise<void> {
        res.status(200).json(await heldElectionRepo.create(req.body));
    }

    private async deleteHeldElection(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.heldId!);

        res.status(200).json(await heldElectionRepo.delete(id));
    }
}
