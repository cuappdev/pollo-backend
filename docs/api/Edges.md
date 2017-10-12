# Edges

Relations between entities are connected by paginated edges, following a common
scheme. The edge connection is retrieved independently of the source object following
common patterns.

## URL

URLs for connections are made from a node, which is fetched with a 'collection type'
and an id. For example, to retrieve a course, one would call;

    GET /v1/courses/${id}

Courses have a connection to lectures. From this node, we can fetch said connection;

    GET /v1/courses/${id}/lectures

Which would return a connection return object.

## Connection Return type

All paginated routes return an object in the same format. If requesting a list
of elements of `type T`, the response would be of type

    type Response<T> {
      edges: Array<Node<T>>
      errors?: Array<Errors>
    }

    type Node<T> {
      cursor: string,
      node: T
    }

So fetching all lectures for a course would yield something similar to;

    {
      edges: [
        {
          cursor: '1506730644751',
          node: {
            id: 0,
            dateTime: 'xxx'
          }
        },
        {
          cursor: '1506730707264',
          node: {
            id: 1,
            dateTime: 'xxx'
          }
        }
      ]
    }

#### One-liners for common operations

Extracting the nodes is easy using;

    result.edges.map(({node}) => node)

Extracting the last cursor can be done with;

    result.edges.map(({cursor}) => cursor).pop()

## Fetching aditional pages

To fetch a page other than the first one, page information needs to be provided
in the query. Each route implements the following arguments;

num: number
:    The number of elements to fetch. Note; it's not guaranteed that this number
of elements will be returned; only that there will be these many at most.

> Default: varies.

after: string
:    The cursor after which to fetch. The element at this location (with this
cursor) is not included!

> Default: If not present, returns the first page

So to retrive a page of size 5 after the last element in the example above, we'd
do;

    GET /v1/courses/${id}/lectures?num=5&after=1506730707264

## Deleting connections

Calling `DELETE` on a connection with an array of ids will delete the
edges.

    DELETE /v1/${path} {
      ids: Array<string>
    }

`DELETE` takes all the query parameters `GET` does, since the response is a
page on the edge.

For example;

    DELETE /courses/${id}/lectures {
      ids: [0]
    }

will return something like

    {
      edges: [
        {
          cursor: '1506730707264',
          node: {
            id: 1,
            dateTime: 'xxx'
          }
        }
      ]
    }
