import {Router, Request, Response, NextFunction} from 'express';
import * as util from 'util';

export class IndexRouter {
  router: Router

  /**
   * Initialize the IndexRouter
   */
  constructor() {
    this.router = Router();
    this.init();
  }

  /**
   * test endpoint
   */
  public test(req: Request, res: Response, next: NextFunction) {
    res.json({message:'Hello World!'});
  }

  public test2(req: Request, res: Response, next: NextFunction) {
    res.json({message: util.format('Hello, %s!', req.params.name)})
  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    this.router.get('/', this.test);
    this.router.get('/test/:name', this.test2);
  }

}

// Create the IndexRouter, and export its configured Express.Router
const indexRouter = new IndexRouter();

export default indexRouter.router;
