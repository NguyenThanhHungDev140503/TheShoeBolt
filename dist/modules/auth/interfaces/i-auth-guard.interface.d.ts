import { CanActivate, ExecutionContext } from '@nestjs/common';
export interface IAuthGuard extends CanActivate {
    canActivate(context: ExecutionContext): Promise<boolean>;
    convertToWebRequest(request: any): globalThis.Request;
}
