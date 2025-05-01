import { Controller } from '@/controllers/index.js';
import { handleError } from '@/middleware/index.js';
import express, { Express } from 'express';
import util from 'node:util';
import cors from 'cors';
import Config from '@/../config/config.json' with { type: 'json' };

const { staticDir, port } = Config.api;

export class API {
  private app: Express;

  constructor(public controllers: Controller[]) {
    this.app = express();
    this.app.use(cors({ origin: '*' }));
    this.app.use(express.json());
    this.app.use(express.static(staticDir));
    this.setupControllers();
    this.app.use(handleError());
  }

  public async start(): Promise<void> {
    const listen = util.promisify(this.app.listen.bind(this.app));
    //@ts-ignore
    await listen(port);

    console.log('api started');
  }

  private setupControllers(): void {
    for (let controller of this.controllers) {
      controller.register();
      this.app.use(controller.path, controller.router);
    }
  }
}
