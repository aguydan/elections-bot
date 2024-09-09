import { Request, Response, Router } from 'express';
import { Controller } from './controller.js';
import router from 'express-promise-router';

export class RootController implements Controller {
    public path = '/';
    public router: Router = router();

    public register(): void {
        this.router.get('/', (req, res) => this.get(req, res));
    }

    private async get(req: Request, res: Response): Promise<void> {
        res.status(200).json({ name: 'Elections Bot API' });
    }
}
