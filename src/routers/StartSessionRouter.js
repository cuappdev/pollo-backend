// @flow
import AppDevRouter from '../utils/AppDevRouter';
import constants from '../utils/constants';
import SessionsRepo from '../repos/SessionsRepo';
import {Request} from 'express';
import type { APISession } from './APITypes';

class StartSessionRouter extends AppDevRouter<APISession> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/start/session/';
  }

  async content (req: Request) {
    const id = req.body.id;
    const code = req.body.code;
    var name = req.body.name;
    var isGroup = req.body.isGroup;

    if (!name) name = '';
    if (isGroup === null) isGroup = false;
    var session = await SessionsRepo.getSessionById(id);

    if (!(id || code)) {
      throw new Error('Session id, or code and device id required.');
    }

    if (!session && code) {
      const sessionId = await SessionsRepo.getSessionId(code);
      if (sessionId) {
        session = await SessionsRepo.getSessionById(sessionId);
      }
    }

    if (!id && !session) {
      session = await SessionsRepo.createSession(name, code, req.user, isGroup);
    }

    if (!session) {
      throw new Error(`No session with id ${id} found.`);
    }

    if (!req.app.sessionManager.isLive(code, id)) {
      await req.app.sessionManager.startNewSession(session);
    }

    return {
      node: {
        id: session.id,
        name: session.name,
        code: session.code
      }
    };
  }
}

export default new StartSessionRouter().router;
