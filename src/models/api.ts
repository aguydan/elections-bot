import { Controller } from '@/controllers/index.js';
import { handleError } from '@/middleware/index.js';
import express, { Express } from 'express';
import { createRequire } from 'node:module';
import util from 'node:util';

const require = createRequire(import.meta.url);
const Config = require('../../config/config.json');

export class API {
    private app: Express;

    constructor(public controllers: Controller[]) {
        this.app = express();
        this.app.use(express.json());
        this.setupControllers();
        this.app.use(handleError());
    }

    public async start(): Promise<void> {
        const listen = util.promisify(this.app.listen.bind(this.app));
        await listen(Config.api.port);

        console.log('api started');
    }

    private setupControllers(): void {
        for (let controller of this.controllers) {
            controller.register();
            this.app.use(controller.path, controller.router);
        }
    }
}
