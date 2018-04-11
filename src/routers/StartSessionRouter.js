// @flow
import AppDevRouter from '../utils/AppDevRouter';
import constants from '../utils/constants';
import SessionsRepo from '../repos/SessionsRepo';
import GroupsRepo from '../repos/GroupsRepo';
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
    const groupId = req.body.groupId;
    var name = req.body.name;

    if (!name) name = '';
    var session = await SessionsRepo.getSessionById(id);

    if (!(id || code)) {
      throw new Error('Session id, or code and device id required.');
    }

    if (!id) {
      if (!groupId) {
        session = await SessionsRepo.createSession(name, code, req.user);
      } else {
        const group = await GroupsRepo.getGroupById(groupId);
        session = await SessionsRepo.createSession(name, code, req.user, group);
      }
    }

    if (!session) {
      throw new Error(`No session with id ${id} found.`);
    }

    await req.app.sessionManager.startNewSession(session);

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
