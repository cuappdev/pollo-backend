// @flow
import SocketIO from 'socket.io';
import Group from './models/Group';
import GroupSocket from './GroupSocket';

/**
 * GroupManager is responsible for handling all socket groups
 */
class GroupManager {
  /** All the groups currently running. */
  groupSockets: Array<GroupSocket> = [];

  /** The socket io server */
  io: SocketIO.Server;

  constructor(server: SocketIO.Server) {
    this.io = SocketIO(server);
  }

  /**
   * Starts a new socket group
   * @function
   * @param {Group} group - Group to start
   */
  async startNewGroup(group: Group) {
    const nsp = this.io.of(`/${group.uuid}`);
    this.groupSockets.push(new GroupSocket({
      group, nsp, onClose: () => { this.endGroup(group, true); },
    }));
  }

  /**
   * Ends a group
   * @function
   * @param {Group} group - Group to end
   * @param {bool} save - Whether to persist this group
   */
  endGroup(group: Group, save: bool): void {
    const index = this.groupSockets.findIndex((x) => {
      const groupUndefined = !x || !x.group;
      return groupUndefined ? false : x.group.uuid === group.uuid;
    });

    if (index === -1) return;

    const socket = this.groupSockets[index];

    if (socket.closing) return;
    socket.closing = true;

    const connectedSockets = Object.keys(socket.nsp.connected);
    connectedSockets.forEach((id) => {
      socket.nsp.connected[id].disconnect();
    });
    socket.nsp.removeAllListeners();

    this.groupSockets.splice(index, 1);
    delete this.io.nsps[`/${group.uuid}`];
  }

  /**
   * Give all live groups from given group codes
   * @function
   * @param {string[]} groupCodes - List of group codes of groups to check
   * if live
   * @return {Group[]} List of live groups
   */
  liveGroups(groupCodes: Array<string>): Array<Group> {
    return this.groupSockets
      .filter((x) => {
        const isGroup = x && x.group;
        return isGroup ? groupCodes.includes(x.group.code) : false;
      })
      .map((l : GroupSocket) => l.group);
  }

  /**
   * Find the group's socket
   * @function
   * @param {string} [groupCode] - Code of group to find
   * @param {number} [id] - UUID of sesssion to find
   * @return {socket} Socket of the group
   */
  findSocket(groupCode: ?string, id: ?string): SocketIO.socket {
    return this.groupSockets.find((x) => {
      if (x && x.group) return x.group.code === groupCode || x.group.uuid === id;
      return false;
    });
  }

  /**
   * Determines if a group is live
   * @function
   * @param {string} [groupCode] - Code of group to check
   * @param {number} [id] - UUID of sesssion to check
   * @return {boolean} Whether the group is live
   */
  isLive(groupCode: ?string, id: ?string): boolean {
    const socket = this.findSocket(groupCode, id);
    return socket !== undefined ? socket.isLive : false;
  }
}

export default GroupManager;
