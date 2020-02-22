import stream from 'stream';
import Poll from '../../models/Poll';
import GroupsRepo from '../../repos/GroupsRepo';
import User from '../../models/User';
import constants from '../../utils/Constants';

async function participationCMSX(id, dates: Array<Date>): stream {
  const polls: Array<?Poll> = (await GroupsRepo.getPolls(id))
    .filter((x: Poll) => {
      const c = Date.parse(x.createdAt);
      c.setHours(0, 0, 0, 0);
      return dates.some(d => c === d);
    })
    .sort((a: Poll, b: Poll) => Number.parseInt(a.createdAt) - Number.parseInt(b.createdAt));

  const total: Number = polls.length;
  const scores: { string: Number } = {};
  const users: Array<User> = await GroupsRepo.getUsersByGroupID(id, constants.USER_TYPES.MEMBER);

  users.forEach((user: User) => {
    scores[user.netID] = 0;
  });

  polls.forEach((poll: Poll) => {
    users.forEach((user: User) => {
      if (Object.prototype.hasOwnProperty.call(poll.answers, user.googleID)) {
        scores[user.netID] += 1;
      }
    });
  });

  const s = new stream.PassThrough();
  s.write('NetID,Assignment Points,Assignment Total,Adjustments,Comments');

  Object.entries(scores).forEach(([netID, score]) => {
    s.write(`${netID},${score},${total},,`);
  });

  s.end();

  return s;
}

export default {
  participationCMSX,
};
