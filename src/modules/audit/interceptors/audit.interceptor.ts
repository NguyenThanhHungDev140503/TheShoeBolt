import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit.service';
import { AUDIT_KEY, AuditOptions } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditOptions>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ipAddress = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('User-Agent');

    return next.handle().pipe(
      tap(async (result) => {
        try {
          let entityId: string | undefined;
          
          if (auditOptions.getEntityId) {
            entityId = auditOptions.getEntityId(result, request.params);
          } else if (result?.id) {
            entityId = result.id;
          } else if (request.params?.id) {
            entityId = request.params.id;
          }

          await this.auditService.log({
            userId: user?.id,
            action: auditOptions.action,
            entityType: auditOptions.entityType,
            entityId,
            newValues: request.method === 'POST' || request.method === 'PUT' ? request.body : undefined,
            ipAddress,
            userAgent,
          });
        } catch (error) {
          // Silently fail - don't break the main operation
          console.error('Audit logging failed:', error);
        }
      }),
    );
  }
}