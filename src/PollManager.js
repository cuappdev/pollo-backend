import { Poll } from './models/Poll';
// import { PollSocket, Question } messes up start poll router
import PollSocket from './PollSocket';
import { Question } from './PollSocket';

class PollManager {
  /**
   * All the polls currently running.
   * All available slots contain their ID instead of a PollSocket
   */
  pollSockets: Array<PollSocket | number> =
    new Array(5).fill(null).map((_, i) => i)

  _getSocketID (): number {
    let id = this.pollSockets.find(x => typeof x === 'number');
    /** Our array is full. throw in an extra slot in there. */
    if (id === undefined) {
      id = this.pollSockets.length;
      this.pollSockets.push(id);
    }
    // We need this cause flow is dumb
    if (typeof id !== 'number') throw new Error('Impossible');
    return id;
  }

  async startNewPoll (poll: Poll): {port: number} {
    const id = this._getSocketID();
    const port = id + 4000;

    this.pollSockets[id] = new PollSocket({port, poll});
    const err = await this.pollSockets[id].start();
    if (err) {
      throw err;
    }

    return {port};
  }

  endPoll (poll: Poll): void {
    const index = this.pollSockets.findIndex(x => {
      if (!x || !x.poll) return false;
      return (x.poll.id === poll.id);
    });
    this.pollSockets[index].close();
    this.pollSockets[index] = index;
  }

  /**
   * What ports is this poll currently running on?
   */
  portsForPoll (pollId: number): Array<number> {
    return this.pollSockets
      .filter(x => {
        if (typeof x === 'number') return false;
        else {
          return x.poll.id === pollId;
        }
      })
      .map((l: PollSocket) => {
        return l.port;
      });
  }

  livePolls (pollCodes: Array<string>): Array<Poll> {
    return this.pollSockets
      .filter(x => {
        if (x && x.poll) {
          return pollCodes.includes(x.poll.code);
        } else {
          return false;
        }
      })
      .map((l : PollSocket) => {
        return l.poll;
      });
  }

  questionForPort (port: number): ?Question {
    const p = this.pollSockets.find(function (x) {
      return x && x.port === port;
    });
    if (!p) throw new Error('Poll not found for port number');
    const currId = p.current.question;
    return p.questions[`${currId}`].question;
  }
}

export default new PollManager();
