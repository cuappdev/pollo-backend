"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class IndexRouter {
    /**
     * Initialize the IndexRouter
     */
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    /**
     * test endpoint
     */
    test(req, res, next) {
        res.json({ message: 'Hello World!' });
    }
    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.get('/', this.test);
    }
}
exports.IndexRouter = IndexRouter;
// Create the IndexRouter, and export its configured Express.Router
const indexRouter = new IndexRouter();
indexRouter.init();
exports.default = indexRouter.router;
