// @flow
import { Request } from 'express';
import AppDevRouter from './AppDevRouter';

export type Cursor = number

export type AppDevEdge<T> = {
  cursor: Cursor,
  node: T,
}

export type PageInfo = {
  count: number,
  cursor?: Cursor
}

export type ResponseError = { message: string }

export type AppDevEdgesResponse<T> = {
  edges: Array <AppDevEdge<T>>,
  errors?: Array <ResponseError>,
  pageInfo?: PageInfo,
}

type ErrorCollector = Error => void

class AppDevEdgeRouter<T> extends AppDevRouter<AppDevEdgesResponse<T>> {
  defaultCount () {
    return 10;
  }

  async contentArray (
    req: Request,
    pageInfo: PageInfo,
    error: ErrorCollector
  ): Promise<Array<AppDevEdge<T>>> {
    throw new Error(`Didn't implement contentArray for ${this.getPath()}`);
  }

  async content (req: Request) {
    const pageInfo = {
      count: req.query.count || this.defaultCount(),
      cursor: req.query.cursor || undefined
    };

    const errors = [];
    const onerror = err => { errors.push(err); };

    const edges = await this.contentArray(req, pageInfo, onerror);
    const response: AppDevEdgesResponse<T> = {
      edges,
      pageInfo: {
        count: edges.length
      }
    };

    if (errors.length) {
      response.errors = errors.map(err => ({
        message: err.message
      }));
    }

    return response;
  }
}

export default AppDevEdgeRouter;
