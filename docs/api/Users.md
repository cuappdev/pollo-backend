# Users

    type User {
      id: string,
      name: string,
      netid: string,
    }

## Users

## Get user
### Request

    GET /v1/users/${id}

### Response

    200 OK -> Node<User>

## Courses

## Get courses a user is enrolled in
### Request

    GET /v1/users/${id}/courses
      ?role: Role

    type Role = 'admin' | 'student'

Gets all courses associated with this user. If role is specified, returns only courses for which the user is an `admin` or a `student`

### Response

    200 OK -> Edges<Course>
