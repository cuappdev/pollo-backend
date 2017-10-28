# Questions

    type Question {
      id: string,
      text: string,
      type: string,
      data: string
    }

    type SingleResponse {
      id: id
      question: id
      answerer: id,
      type: string,
      response: string,
    }

    type MultipleResponse {
      id: id
      question: id
      answerer: id,
      type: string,
      response: string[],
    }

    type Answer = SingleResponse | MultipleResponse

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
