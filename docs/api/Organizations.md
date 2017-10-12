
# Organizations

    type Organization {
      id: string,
      name: string,
    }

## Organizations

### Get all organizations
#### Request

    GET /v1/organizations

Gets all available organizations

#### Response

    200 OK -> Edges<Organization>

### Get some organization
#### Request

    GET /v1/organizations/${id}/

#### Response

    200 OK -> Node<Organization>


### Update an organization
#### Request

    PUT /v1/organizations/${id}/ {
      name: string
    }

#### Response

    200 OK -> Node<Organization>

### Create an organization
#### Request

    POST /v1/organizations {
      name: string
    }

#### Response

    201 Created -> Node<Organization>

### Delete an organization
#### Request

    DELETE /v1/organizations/${id}

#### Response

    204 No Content -> {}

## Courses


### Get the courses in an organization
#### Request

    GET /v1/organizations/${id}/courses

#### Response

    200 OK -> Edges<Courses>

### Create a course in an organization

NOTE: By default, the organization wont have `students`, but will have a single entry in the `admins` array; the user who created it.

#### Request

    POST /v1/organizations/${id}/courses {
      name: string,
      term: string,
    }

#### Response

    201 OK -> Node<Course>
