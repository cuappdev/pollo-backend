# Clicker API v1

## Responses

No route in this API returns a "raw" array or a "raw" object. All routes return a subclass of the base object, which has a simple definition;

    type Error {
      message: string
    }

    type Base {
      errors?: Array<Error>
    }

Most routes return a `Node` or `Edges` which implements this `Base` type, but some might return it directly (aka, will return an empty object if no errors, or an object with a single errors array, if there's issues)

## Errors

`Base` is returned everywhere, and might have `errors` even when the response is `200 OK`, in cases where the operation is non-fatal. Say, if adding a group of students to course, one of them fails to be added, the response would be

    200 OK -> {
      errors: [{
        message: "Couldn't add keh222"
      }]
    }

Or something along those lines. The point being, all other students were added, so the request was considered successful even if this `keh222` couldn't add the class for whatever reason (probably cause he's secretly not an undergrad anymore, shh don't tell ACSU).

Also note: the contents of message will vary depending on context, but in general should be user-friendly (aka, the UI should be able to present these to a user.

### Error codes

All requests may return the following error codes, and, if one of these is returned, the response **should** include an `errors` array.

### Response

---

    400 Bad Request {
      errors: Array<Error>,
    }

The request was misformated.

---

    500 Internal Server Error {
      errors: Array<Error>,
    }


We messed up.

---

    401 Unauthorized {
      errors: Array<Error>,
    }


The user isn't logged in, or the credentials have experied. The user should be
re-routed to the login screen.

---

    403 Forbidden {
      errors: Array<Error>,
    }


The user isn't allowed to see or modify this resource.
