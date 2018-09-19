// @flow
import SocketIO from 'socket.io';
import Session from './models/Session';
import SessionSocket from './SessionSocket';

/**
 * SessionManager is responsibble for handling all socket sessions
 */
class SessionManager {
  /** All the sessions currently running. */
  sessionSockets: Array<SessionSocket> = [];

  /** The socket io server */
  io: SocketIO.Server;

  constructor(server: SocketIO.Server) {
      this.io = SocketIO(server);
  }

  /**
   * Starts a new socket session
   * @function
   * @param {Session} session - Session to start
   */
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

  /**
   * Ends a session
   * @function
   * @param {Session} session - Session to end
   * @param {bool} save - Whether to persist this session
   */
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

  /**
   * Give all live sessions from given session codes
   * @function
   * @param {string[]} sessionCodes - List of session codes of sessions to check
   * if live
   * @return {Session[]} List of live sessions
   */
  liveSessions(sessionCodes: Array<string>): Array<Session> {
      return this.sessionSockets
          .filter((x) => {
              const isSession = x && x.session;
              return isSession ? sessionCodes.includes(x.session.code) : false;
          })
          .map((l : SessionSocket) => l.session);
  }

  /**
   * Determines if a session is live
   * @function
   * @param {string} [sessionCode] - Code of session to check
   * @param {number} [id] - Id of sesssion to check
   * @return {boolean} Whether the session is live
   */
  isLive(sessionCode: ?string, id: ?number): boolean {
      const socket = this.sessionSockets.find((x) => {
          const isSession = x && x.session;
          return isSession ? x.session.code === sessionCode || x.session.id === id : false;
      });
      return socket !== undefined;
  }
}

export default SessionManager;
