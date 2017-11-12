# Lectures

## Lectures

    type Lecture {
      id: string,
      dateTime: string,
    }

### Get a lecture
#### Request

    GET /v1/lectures/${id}/

#### Response

    200 OK -> Node<Lecture>

### Delete a lecture
#### Request

    DELETE /v1/lectures/${id}/

#### Response

    204 No Content -> {}

### Update a lecture
#### Request

    PUT /v1/lectures/${id}/ {
      dateTime: string
    }

#### Response

    200 OK -> Node<Lecture>


## Questions

### Create a question
#### Request

    type question_type = 'FREE_RESPONSE' | 'MULTIPLE_ANSWER' | 'MULTIPLE_CHOICE'
    | 'RANKING'

    POST /v1/lectures/${id}/questions {
      text: string,
      type: question_type,
      data: json
    }

#### Response

    201 Created -> Node<Question>

#### Example of Creating Questions

    POST /v1/lectures/${id}/questions
    {
      "text": "What is 1 + 1?",
      "type": "MULTIPLE_CHOICE",
      "data": {"options":[{"id": "A", "description": "2"}], "answer": "A"}
    }

### Get a lecture's questions
#### Request

    GET /v1/lectures/${id}/questions

#### Response

    200 OK -> Edges<Question>
