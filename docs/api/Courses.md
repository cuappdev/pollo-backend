
# Courses

## Courses

    type Course {
        id: string,
        name: string,
        term: string,
    }

### Get a course
#### Request

    GET /v1/courses/${id}/

#### Response

    200 OK -> Node<Course>

### Update a course

#### Request

    PUT /v1/courses/${id} {
        name?: string,
        term?: string,
    }

#### Response

The updated course

    200 OK -> Node<Course>

### Delete a course
#### Request

    DELETE /v1/courses/${id}

#### Response

    204 No Content -> {}



## Students in courses

### Remove students
#### Request

    DELETE /v1/courses/${id}/students {
      ids: Array<string>
    }

#### Response

    200 Ok

Note: the response here is marked as empty, but may still be an object with an errors array if there was an error removing any particular student.

### Add students
#### Request

    POST /v1/course/register {
      courseCode: string,
      students: Array<string> // IDs
    }

#### Response

    200 Ok

Note: the response here is marked as empty, but may still be an object with an errors array if there was an error adding any particular student.

## Lectures

### Get lectures
#### Request

    GET /v1/courses/${id}/lectures

#### Response

    200 OK -> Edges<Lectures>

### Create a lecture
#### Request

    POST /v1/courses/${id}/lectures {
      dateTime: string,
    }

#### Response

    204 Created -> Node<Lecture>

## Admins

### Remove admins
#### Request

    DELETE /v1/courses/${id}/admins {
      ids: Array<string>
    }

### Response

    200 OK

Note: the response here is marked as empty, but may still be an object with an errors array if there was an error removing any particular admin.

### Add admin
#### Request

    PUT /v1/courses/${id}/admins {
      ids: Array<string>
    }

### Response

    200 OK

Note: the response here is marked as empty, but may still be an object with an errors array if there was an error adding any particular admin.
