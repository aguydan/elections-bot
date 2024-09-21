import { Request, Response, Router } from 'express';
import PromiseRouter from 'express-promise-router';
import { Controller } from './index.js';
import { upload } from '@/middleware/index.js';

export class UploadsController implements Controller {
    public path = '/uploads';
    public router: Router = PromiseRouter();

    public register(): void {
        this.router.post('/', upload.single('image'), (req, res) => this.uploadImage(req, res));
    }

    private async uploadImage(req: Request, res: Response): Promise<void> {
        res.status(200).json({ file: req.file });
    }
}
