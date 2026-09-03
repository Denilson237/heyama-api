import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Personnalisation des erreurs 404
    if (status === HttpStatus.NOT_FOUND) {
      return response.status(status).json({
        statusCode: 404,
        error: 'Not Found',
        message:
          typeof message === 'object' && (message as any).message
            ? (message as any).message
            : 'La ressource ou la route demandée est introuvable.',
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    // Gestion standard des autres erreurs
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}