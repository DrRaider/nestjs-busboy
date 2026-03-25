import {
  type CallHandler,
  type ExecutionContext,
  Inject,
  mixin,
  type NestInterceptor,
  Optional,
  type Type,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { BUSBOY_OPTIONS } from "../files.constants";
import type { BusboyModuleOptions } from "../interfaces";
import { parseMultipart } from "../utils/parse-multipart";
import { transformException } from "../utils/transform-exception";

export function NoFilesInterceptor(): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    constructor(
      @Optional()
      @Inject(BUSBOY_OPTIONS)
      private readonly options: BusboyModuleOptions = {},
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
      const req = context.switchToHttp().getRequest();

      try {
        const { body } = await parseMultipart(req, this.options, "none");
        req.body = body;
      } catch (err) {
        throw transformException(err as Error);
      }

      return next.handle();
    }
  }

  return mixin(MixinInterceptor);
}
