class ResponseHandler {
  static success(res, data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message, statusCode = 500, errors = null) {
    const response = {
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  static badRequest(res, message = 'Bad request', errors = null) {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  static tooManyRequests(res, message = 'Too many requests') {
    return this.error(res, message, 429);
  }
}

module.exports = ResponseHandler;