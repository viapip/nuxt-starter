// Throw when a resource is not found
export const ErrNotFound = createError({
  statusCode: 404,
  statusMessage: 'Not found',
})

// Throw when access is denied
export const ErrForbidden = createError({
  statusCode: 403,
  statusMessage: 'Forbidden',
})

// Throw when authentication is required
export const ErrUnauthorized = createError({
  statusCode: 401,
  statusMessage: 'Unauthorized',
})

// Throw when request is malformed
export const ErrBadRequest = createError({
  statusCode: 400,
  statusMessage: 'Bad request',
})

// Throw when HTTP method is not allowed
export const ErrUnsupportedMethod = createError({
  statusCode: 405,
  statusMessage: 'Unsupported method',
})

// Throw when server encounters an error
export const ErrInternalServer = createError({
  statusCode: 500,
  statusMessage: 'Internal server error',
})

// Throw when required ID parameter is missing
export const ErrNoParamId = createError({
  statusCode: 400,
  statusMessage: 'No param id',
})
