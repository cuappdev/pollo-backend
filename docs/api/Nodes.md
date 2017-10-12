# Nodes

All objects fetched from the API are returned in a standard "node" object type.
This is to future-proof the API, and allow metadata, warnings, errors or other
information to be returned alongside the requested resource.

## URL

URLs for nodes consist of a 'collection type' and an id. For example, to
retrieve a course, one would call;

    GET /courses/${id}

## Node Return Type

All nodes return an object in the same format. If requesting an object of type
`type T`, the response would be of type

    type Response<T> {
      node: T,
      errors?: Array<Errors>
    }

So, for example, retrieving a course would yield an object like this,

    {
      node: {
        id: 43,
        name: "CS 3110",
        term: "FA17",
      }
    }
