# Questions

    For questions of type 'FREE_RESPONSE'
    type FreeResponseQuestion {
      id: string,
      text: string,
      type: string
    }

    For questions of type 'MULTIPLE_CHOICE'
    type MultipleChoiceQuestion {
      id: string,
      text: string,
      type: string,
      options: option[],
      answer: string
    }

    For questions of type 'MULTIPLE_ANSWER' and 'RANKING'
    type MultipleAnswerQuestion {
      id: string,
      text: string,
      type: string,
      options: option[],
      answer: string[]
    }

    type option {id: string, description: string}

    ex. options = [{id: 'A', description: 'H2O'}, {id: 'B', description: 'H2'}]

    type Question = FreeResponseQuestion | MultipleChoiceQuestion
      | MultipleAnswerQuestion

# Responses

    For questions of type 'FREE_RESPONSE' and 'MULTIPLE_CHOICE'
    type SingleResponse {
      id: string,
      question: string,
      answerer: string,
      type: string,
      response: string
    }

    For questions of type 'MULTIPLE_ANSWER' and 'RANKING'
    type MultipleResponse {
      id: string,
      question: string,
      answerer: string,
      type: string,
      response: string[]
    }

    type Answer = SingleResponse | MultipleResponse

### Example
  MultipleAnswerQuestion {
    id: '1',
    text: 'Which are colors?',
    type: 'MULTIPLE_ANSWER',
    options: [{'id': 'A', 'description': 'Blue'}, {'id': 'B', 'description': 'Dog'},
      {'id': 'C', 'description': 'Red'}, {'id': 'D', 'description': 'Bread'}],
    answer: ['A', 'C']
  }

  MultipleResponse {
    id: '10',
    question: '1',
    answerer: '7',
    type: 'MULTIPLE_ANSWER',
    response: ['A', 'C']
  }

## Questions

### Get a question
#### Request

    GET /v1/question/${id}

#### Response

    200 OK -> Node<Question>


### Update a question
#### Request

    PUT /v1/question/${id} {
      text: string
      data: string
    }

#### Response

    200 OK -> Node<Question>

### Delete a question
#### Request

    DELETE /v1/question/${id}

#### Response

    204 No Content -> {}


## Answers

### Get all answers to a question
#### Request

    GET /v1/question/${id}/answers

#### Response

    200 OK -> Edges<Answer>


### Answer a question
#### Request

    PUT /v1/question/${id}/answer {
      answer: string
    }

**Creates** or **updates** an answer to question

#### Response

    201 Created -> Node<Answer>

If the question was unanswered, the server responds with `201 Created`

    200 OK -> Node<Answer>

If the question was previously answered and the user is updating its answer,
the server responds with `200 OK`.
