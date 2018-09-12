// @flow
import SocketIO from 'socket.io';
import Session from './models/Session';
import SessionSocket from './SessionSocket';

class SessionManager {
  /**
   * All the sessions currently running.
   */
  sessionSockets: Array<SessionSocket> = []

  io: SocketIO.Server

  constructor(server: SocketIO.Server) {
      this.io = SocketIO(server);
  }

  async startNewSession(session: Session) {
      const nsp = this.io.of(`/${session.id}`);
      this.sessionSockets.push(new SessionSocket({
          session,
          nsp,
          onClose: () => {
              this.endSession(session, true);
          },
      }));
  }

  endSession(session: Session, save: bool): void {
      const index = this.sessionSockets.findIndex((x) => {
          const sessionUndefined = !x || !x.session;
          return sessionUndefined ? false : x.session.id === session.id;
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

  liveSessions(sessionCodes: Array<string>): Array<Session> {
      return this.sessionSockets
          .filter((x) => {
              const isSession = x && x.session;
              return isSession ? sessionCodes.includes(x.session.code) : false;
          })
          .map((l : SessionSocket) => l.session);
  }

  isLive(sessionCode: ?string, id: ?number): bool {
      const socket = this.sessionSockets.find((x) => {
          const isSession = x && x.session;
          return isSession ? x.session.code === sessionCode || x.session.id === id : false;
      });
      return socket !== undefined;
  }
}

export default SessionManager;
