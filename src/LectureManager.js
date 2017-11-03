import { Lecture } from './models/Lecture';
import LectureSocket from './LectureSocket';

class LectureManager {
  /**
   * All the lectures currently running.
   * All available slots contain their ID instead of a LectureSocket
   */
  lectureSockets: Array<LectureSocket | number> =
    new Array(5).fill(null).map((_, i) => i)

  _getSocketID (): number {
    let id = this.lectureSockets.find(x => typeof x === 'number');
    /** Our array is full. throw in an extra slot in there. */
    if (id === undefined) {
      id = this.lectureSockets.length;
      this.lectureSockets.push(id);
    }
    // We need this cause flow is dumb
    if (typeof id !== 'number') throw new Error('Impossible');
    return id;
  }

  async startNewLecture (lecture: Lecture): {port: number} {
    const id = this._getSocketID();
    const port = id + 4000;

    this.lectureSockets[id] = new LectureSocket({port, lecture});
    const err = await this.lectureSockets[id].start();

    if (err) {
      throw err;
    }

    return {port};
  }

  endLecture (lecture: Lecture): void {
    const index = this.lectureSockets.findIndex(x => {
      if (typeof x !== 'number') return false;
      return (x.lecture.id === lecture.id);
    });
    this.lectureSockets[index].close();
    this.lectureSockets[index] = index;
    console.log(this.lectureSockets);
  }
}

export default new LectureManager();
