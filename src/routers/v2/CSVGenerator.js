import stream from 'stream';
import Poll from '../../models/Poll';
import GroupsRepo from '../../repos/GroupsRepo';
import User from '../../models/User';
import constants from '../../utils/Constants';

async function participationCMSX(id, dates: Array<Date>): stream {
  const polls: Array<?Poll> = (await GroupsRepo.getPolls(id))
    .filter((x: Poll) => {
      const c = new Date(Number.parseInt(x.createdAt) * 1000);
      return dates.some(d => c.toDateString() === d.toDateString());
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
  s.write('NetID,Assignment Points,Assignment Total,Adjustments,Comments\n');

  Object.entries(scores).forEach(([netID, score]) => {
    s.write(`${netID},${score},${total},,\n`);
  });
  s.end();

  return s;
}

export default {
  participationCMSX,
};
