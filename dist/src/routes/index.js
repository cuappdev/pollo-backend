"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class IndexRouter {
    constructor() {
        this.router = express_1.Router();
        this.init();
    }
    test(req, res, next) {
        res.json({ message: 'Hello World!' });
    }
    init() {
        this.router.get('/', this.test);
    }
}
exports.IndexRouter = IndexRouter;
const indexRouter = new IndexRouter();
indexRouter.init();
exports.default = indexRouter.router;
