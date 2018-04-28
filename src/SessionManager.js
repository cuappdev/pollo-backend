import { Session } from './models/Session';
import SessionSocket from './SessionSocket';
import SocketIO from 'socket.io';

class SessionManager {
  /**
   * All the sessions currently running.
   */
  sessionSockets: Array<SessionSocket> = []
  io: SocketIO.Server

  constructor (server) {
    this.io = SocketIO(server);
  }

  async startNewSession (session: Session): void {
    const nsp = this.io.of(`/${session.id}`);
    this.sessionSockets.push(new SessionSocket({
      session: session,
      nsp: nsp,
      onClose: () => {
        this.endSession(session);
      }
    }));
  }

  endSession (session: Session, save: Boolean): void {
    const index = this.sessionSockets.findIndex(x => {
      if (!x || !x.session) return false;
      return (x.session.id === session.id);
    });

    if (index !== -1) {
      const socket = this.sessionSockets[index];

      if (socket.closing) return;
      socket.closing = true;

      if (save) {
        socket.saveSession();
      }

      const connectedSockets = Object.keys(socket.nsp.connected);
      connectedSockets.forEach((id) => {
        socket.nsp.connected[id].disconnect();
      });
      socket.nsp.removeAllListeners();

      this.sessionSockets.splice(index, 1);
      delete this.io.nsps[`/${session.id}`];
    }
  }

  liveSessions (sessionCodes: Array<string>): Array<Session> {
    return this.sessionSockets
      .filter(x => {
        if (x && x.session) {
          return sessionCodes.includes(x.session.code);
        } else {
          return false;
        }
      })
      .map((l : SessionSocket) => {
        return l.session;
      });
  }

  isLive (sessionCode: ?string, id: ?number): Boolean {
    const socket = this.sessionSockets.find(function (x) {
      if (x && x.session) {
        return x.session.code === sessionCode || x.session.id === id;
      }
      return false;
    });
    return (socket !== undefined);
  }
}

export default SessionManager;
