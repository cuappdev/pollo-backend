// @flow
import { Request } from 'express';
import AppDevRouter from '../utils/AppDevRouter';
import ResponsesRepo from '../repos/ResponsesRepo';

class PostResponseRouter extends AppDevRouter {
  constructor () {
    super('POST');
  }

  getPath (): string {
    return '/question/:id/answer/';
  }

  async content (req: Request) {
    const questionId = req.params.id;
    const answer = req.body.answer;
    const user = req.body.user;
    if (!answer) throw new Error('Answer missing');
    if (!user) throw new Error('User id missing');

    // Check if user already responded
    const currentResponse = await ResponsesRepo.existingResponse(user,
      questionId);
    var r;
    if (currentResponse) {
      // User already responded so update their response
      r = await ResponsesRepo.updateResponse(currentResponse.id,
        {answer: answer});
    } else {
      // User hasn't responded so create new response
      r = await ResponsesRepo.createResponse({answer: answer},
        questionId, user);
    }
    if (!r) throw new Error('No response created or updated');

    return {
      node: {
        id: String(r.id),
        question: questionId,
        answerer: user,
        type: r.type,
        response: answer,
      }
    };
  }
}

export default new PostResponseRouter().router;
