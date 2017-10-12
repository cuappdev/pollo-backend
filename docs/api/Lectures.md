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

    POST /v1/lectures/${id}/questions

#### Response

    201 Created -> Node<Question>

### Get a lecture's questions
#### Request

    GET /v1/lectures/${id}/questions

#### Response

    200 OK -> Edges<Question>

