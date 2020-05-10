import stream from 'stream';
import Poll from '../../models/Poll';
import GroupsRepo from '../../repos/GroupsRepo';
import User from '../../models/User';
import constants from '../../utils/Constants';

async function participation(id, dates: Array<Date>) {
  const polls: Array<?Poll> = (await GroupsRepo.getPolls(id))
    .filter((x: Poll) => {
      const c = new Date(Number.parseInt(x.createdAt) * 1000);
      return dates.some(d => c.toDateString() === d.toDateString());
    })
    .sort((pollA: Poll, pollB: Poll) => Number.parseInt(pollA.createdAt) - Number.parseInt(pollB.createdAt));

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

  return { scores, total };
}

/**
 * Writes a CSV of participation data for several days to a stream.
 * Example output:
 * ```
 * NetID,Mon Oct 10 2011,Wed Mar 11 2020
 * u1,0,2
 * u2,0,2
 * u3,0,1
 * ```
 */
async function participationCMSXPerDay(id, dates: Array<Date>): stream {
  const scores = await Promise.all(dates.map(async d => (await participation(id, [d])).scores));

  const s = new stream.PassThrough();
  s.write(`NetID,${dates.map(d => d.toDateString()).join(',')}\n`);

  Object.entries(scores[0]).forEach(([netID, _]) => {
    s.write(`${netID},${scores.map(ps => ps[netID]).join(',')}\n`);
  });
  s.end();

  return s;
}

/**
 * Writes a CSV of participation data for several days to a stream.
 * Example output:
 * ```
 * Student,ID,Mon Oct 10 2011,Wed Mar 11 2020
 * User One,u1,0,2
 * User Two,u2,0,2
 * User Three,u3,0,1
 * ```
 * @param id
 * @param dates
 * @returns {Promise<void>}
 */
async function participationCanvasPerDay(id, dates: Array<Date>) : stream {
  // scores is a list of dictionaries associating netids to scores for each date in dates
  const scores = await Promise.all(dates.map(async date => (await participation(id, [date])).scores));

  // create the output stream for the csv
  const strm = new stream.PassThrough();
  strm.write(`Student,ID,${dates.map(d => d.toDateString()).join(',')}\n`);
  console.log(`Student,ID,${dates.map(d => d.toDateString()).join(',')}`);

  // dictionary associating netIDs to "FirstName LastName" for members in the group
  const members : { string: string } = {};

  const users: Array<User> = await GroupsRepo.getUsersByGroupID(id, constants.USER_TYPES.MEMBER);

  users.forEach((u : User) => {
    members[u.netID] = `${u.firstName} ${u.lastName}`; console.log(`${u.firstName} ${u.lastName}`);
  });

  // for each netID, write that netIDs information to the stream
  Object.entries(scores[0]).forEach(([netID, _]) => {
    strm.write(`${members[netID]},${netID},${scores.map(scoreList => scoreList[netID]).join(',')}\n`);
    console.log(`${members[netID]},${netID},${scores.map(scoreList => scoreList[netID]).join(',')}\n`);
  });

  strm.end();
  return strm;
}
export default {
  participationCMSXPerDay,
  participationCanvasPerDay,
};
