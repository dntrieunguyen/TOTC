import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, ValidationError } from "@nestjs/common";

@Catch(HttpException)
export class CatchExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    res.status(status).json({
      statusCode: status,
      message: this.handleMessageErrors(exception),
      errors: this.handleCustomErrors(exception),
      data: null,
    });
  }

  private handleMessageErrors(exception: any): any {
    const message = exception instanceof HttpException ? exception.getResponse() : exception;
    if (exception instanceof HttpException) {
      if (message["message"]) return message["message"];

      if (exception["response"]) return exception["response"]["errors"];
    }

    if (exception.getResponse()) return exception.getResponse();

    return "Internal server error";
  }

  private handleCustomErrors(exception: unknown): Record<string, string> {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === "object" && response.hasOwnProperty("message")) {
        if (Array.isArray(response["errors"])) {
          return this.formatValidationErrors(response["errors"]);
        }
      }
      if (exception.getResponse()["errors"]) {
        return exception.getResponse()["errors"];
      }
    }
    return {};
  }

  private formatValidationErrors(errors: ValidationError[]): Record<string, string> {
    const formattedErrors: Record<string, string> = {};
    for (const error of errors) {
      if (error.constraints) {
        for (const key in error.constraints) {
          if (error.constraints.hasOwnProperty(key)) {
            formattedErrors[error.property] = error.constraints[key];
          }
        }
      }
    }
    return formattedErrors;
  }
}
