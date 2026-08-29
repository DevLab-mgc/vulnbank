// Typed HTTP errors. Handlers/services throw these; the central error handler maps them to a
// status code and a safe message. 4xx messages are safe to expose; 5xx are never leaked.
export class HttpError extends Error {
  readonly status: number;
  readonly expose: boolean;

  constructor(status: number, message: string) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.expose = status < 500;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "bad request") {
    super(400, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "unauthorized") {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "forbidden") {
    super(403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "not found") {
    super(404, message);
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message = "unprocessable entity") {
    super(422, message);
  }
}
